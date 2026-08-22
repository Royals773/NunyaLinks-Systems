import { logger, task } from "@trigger.dev/sdk";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const LeadPayloadSchema = z.object({
  leadId: z.string().min(1),
  submittedAt: z.string().min(1),
  fullName: z.string().min(1),
  businessName: z.string().min(1),
  email: z.email(),
  phone: z.string().nullable(),
  businessLocation: z.string().min(1),
  industry: z.string().min(1),
  numberOfEmployees: z.string().min(1),
  timeDrainingProcess: z.string().min(1),
  hoursPerWeek: z.number().nonnegative(),
  preferredContact: z.string().min(1),
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;

const OpportunityReviewAnalysisSchema = z.object({
  summary: z.string(),
  suggestedQuestions: z.array(z.string()).length(3),
  draftEmailSubject: z.string(),
  draftEmailBody: z.string(),
});

type Priority = "High" | "Medium" | "Standard";

// Priority is calculated deterministically — never delegated to the model.
function calculatePriority(hoursPerWeek: number): Priority {
  if (hoursPerWeek >= 10) return "High";
  if (hoursPerWeek >= 5) return "Medium";
  return "Standard";
}

const INSTRUCTIONS = `You are drafting internal notes and a customer acknowledgement email for NunyaLink Systems, a UK automation consultancy, after someone submits their free Automation Opportunity Review request.

Strict rules:
- Base every personalised statement only on the submitted payload. Never invent prices, savings, guarantees, statistics, outcomes, integrations, or capabilities.
- Never claim an automation has already been built for this business.
- Never call the free review an "audit". It is a free, exploratory "Automation Opportunity Review" — a separate paid "Automation Audit & Roadmap" may follow later, but do not mention pricing or promise it will happen.
- Keep the tone warm, concise, and commercially professional.
- The email must be professional UK-English and must say that NunyaLink Systems will contact them within one working day.
- summary: two or three concise, factual sentences about the lead, based only on what they submitted.
- suggestedQuestions: exactly three specific, useful questions to ask during the free Automation Opportunity Review call, based on what they submitted.
- draftEmailSubject: a concise acknowledgement subject line.
- draftEmailBody: a professional UK-English acknowledgement email confirming receipt and that NunyaLink Systems will be in touch within one working day.`;

export const analyzeOpportunityReviewTask = task({
  id: "analyze-opportunity-review",
  maxDuration: 60,
  retry: {
    maxAttempts: 1,
  },
  run: async (rawPayload: unknown) => {
    const payload = LeadPayloadSchema.parse(rawPayload);
    const priority = calculatePriority(payload.hoursPerWeek);

    const model = process.env.OPENAI_MODEL;
    if (!model) throw new Error("OPENAI_MODEL is not set.");

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.parse({
      model,
      reasoning: { effort: "none" },
      input: [
        { role: "developer", content: INSTRUCTIONS },
        {
          role: "user",
          content: JSON.stringify({
            businessName: payload.businessName,
            industry: payload.industry,
            businessLocation: payload.businessLocation,
            numberOfEmployees: payload.numberOfEmployees,
            timeDrainingProcess: payload.timeDrainingProcess,
            hoursPerWeek: payload.hoursPerWeek,
            preferredContact: payload.preferredContact,
            fullName: payload.fullName,
          }),
        },
      ],
      text: {
        format: zodTextFormat(OpportunityReviewAnalysisSchema, "opportunity_review_analysis"),
      },
    });

    const hasRefusal = response.output?.some(
      (item) =>
        item.type === "message" &&
        item.content?.some((content) => content.type === "refusal")
    );
    if (hasRefusal) {
      throw new Error("OpenAI refused to generate the structured response.");
    }

    if (response.status !== "completed" || !response.output_parsed) {
      throw new Error(
        `OpenAI response was not usable (status: ${response.status ?? "unknown"}). No structured output was returned.`
      );
    }

    const parsed = response.output_parsed;

    logger.log(
      `model: ${model}, priority: ${priority}, status: ${response.status}, questionCount: ${parsed.suggestedQuestions.length}`
    );

    return {
      leadId: payload.leadId,
      priority,
      summary: parsed.summary,
      suggestedQuestions: parsed.suggestedQuestions,
      draftEmailSubject: parsed.draftEmailSubject,
      draftEmailBody: parsed.draftEmailBody,
    };
  },
});
