import { logger, task } from "@trigger.dev/sdk";
import { z } from "zod";
import { analyzeOpportunityReviewTask } from "./analyze-opportunity-review";
import { persistOpportunityReviewTask } from "./persist-opportunity-review";
import { HoursPerWeekBandSchema } from "./opportunity-review-shared";

// Caller-supplied identity — never generated here. The website integration
// creates and retains this Lead ID across delivery retries, so idempotency
// is keyed on it downstream (in persist-opportunity-review), not on email
// or any other personal data.
const ProcessOpportunityReviewInputSchema = z
  .object({
    leadId: z.string().trim().min(1).max(100),
    submittedAt: z.iso.datetime({ message: "submittedAt must be a valid ISO timestamp." }),
    fullName: z.string().trim().min(1).max(200),
    businessName: z.string().trim().min(1).max(200),
    email: z.email(),
    phone: z.string().trim().max(50).nullable(),
    businessLocation: z.string().trim().min(1).max(200),
    industry: z.string().trim().min(1).max(200),
    numberOfEmployees: z.string().trim().min(1).max(50),
    timeDrainingProcess: z.string().trim().min(1).max(2000),
    hoursPerWeek: HoursPerWeekBandSchema,
    preferredContact: z.string().trim().min(1).max(100),
    // Matches the "Automation Rules" business default (Follow-up delay
    // hours: 24). Overridable, not hardcoded, so a future rules change
    // doesn't require a code change here.
    followUpDelayHours: z.number().finite().nonnegative().default(24),
    dryRun: z.boolean().default(true),
  })
  .strict();

export const processOpportunityReviewTask = task({
  id: "process-opportunity-review",
  maxDuration: 180,
  retry: {
    maxAttempts: 1,
  },
  // Unnamed (task-scoped) queue — distinct from the analyze and persist
  // tasks' own unnamed queues, so this task never contends with its
  // children for the same concurrency slot. triggerAndWait checkpoints
  // this run and releases its slot while waiting on a child, so a shared
  // slot would not deadlock either — but keeping the queues separate is
  // the simplest way to avoid the question entirely.
  queue: {
    concurrencyLimit: 1,
  },
  run: async (rawInput: unknown) => {
    const input = ProcessOpportunityReviewInputSchema.parse(rawInput);

    logger.log(`stage: analysis, status: started, dryRun: ${input.dryRun}`);

    const analysisResult = await analyzeOpportunityReviewTask.triggerAndWait({
      leadId: input.leadId,
      submittedAt: input.submittedAt,
      fullName: input.fullName,
      businessName: input.businessName,
      email: input.email,
      phone: input.phone,
      businessLocation: input.businessLocation,
      industry: input.industry,
      numberOfEmployees: input.numberOfEmployees,
      timeDrainingProcess: input.timeDrainingProcess,
      hoursPerWeek: input.hoursPerWeek,
      preferredContact: input.preferredContact,
    });

    if (!analysisResult.ok) {
      logger.log(`stage: analysis, status: failed, dryRun: ${input.dryRun}`);
      throw new Error("Opportunity analysis failed.");
    }

    // The analysis task's deterministic priority is authoritative — never
    // recalculated here.
    const analysis = analysisResult.output;
    logger.log(
      `stage: analysis, status: succeeded, priority: ${analysis.priority}, questionCount: ${analysis.suggestedQuestions.length}, dryRun: ${input.dryRun}`
    );

    logger.log(`stage: persistence, status: started, dryRun: ${input.dryRun}`);

    const persistenceResult = await persistOpportunityReviewTask.triggerAndWait({
      leadId: input.leadId,
      submittedAt: input.submittedAt,
      fullName: input.fullName,
      businessName: input.businessName,
      email: input.email,
      phone: input.phone,
      businessLocation: input.businessLocation,
      industry: input.industry,
      numberOfEmployees: input.numberOfEmployees,
      timeDrainingProcess: input.timeDrainingProcess,
      hoursPerWeek: input.hoursPerWeek,
      preferredContact: input.preferredContact,
      priority: analysis.priority,
      summary: analysis.summary,
      suggestedQuestions: analysis.suggestedQuestions,
      draftEmailSubject: analysis.draftEmailSubject,
      draftEmailBody: analysis.draftEmailBody,
      followUpDelayHours: input.followUpDelayHours,
      // Forwarded explicitly and unmodified — persist-opportunity-review's
      // own NUNYALINK_ENABLE_WRITES fail-closed gate remains the sole
      // authority over whether a write actually happens.
      dryRun: input.dryRun,
    });

    if (!persistenceResult.ok) {
      logger.log(`stage: persistence, status: failed, dryRun: ${input.dryRun}`);
      throw new Error("Opportunity persistence failed.");
    }

    const persistence = persistenceResult.output;
    const persistenceStatus = "status" in persistence ? persistence.status : "planned";
    logger.log(
      `stage: persistence, status: succeeded, persistenceStatus: ${persistenceStatus}, dryRun: ${input.dryRun}`
    );

    return {
      status: "completed" as const,
      priority: analysis.priority,
      suggestedQuestionCount: analysis.suggestedQuestions.length,
      persistenceStatus,
      dryRun: input.dryRun,
    };
  },
});
