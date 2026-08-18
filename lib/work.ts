// "Selected Work" — evidence of systems NunyaLink has actually built, as
// opposed to lib/products.ts (SaaS products NunyaLink sells) or
// components/ExampleSystems.tsx (illustrative, hypothetical examples).
// Add a new entry here to feature another project; nothing in
// components/app/work/** needs to change.
//
// Every field on the WealthCircle entry below is drawn from the existing,
// already-approved WealthCircle content in lib/products.ts. Nothing here
// asserts a user count, revenue figure, launch date, client name, or
// outcome that isn't already stated there.

export interface WorkStep {
  title: string;
  description: string;
}

export interface WorkTheme {
  title: string;
  description: string;
}

export interface WorkItem {
  slug: string;
  name: string;
  /** e.g. "NunyaLink Product" — never implies an external client commissioned it. */
  type: string;
  tagline: string;
  /** 1–2 sentences, for the homepage Selected Work card and /work index. */
  summary: string;
  statusLabel: string;
  problem: {
    intro: string;
    points: string[];
    closing: string;
  };
  system: {
    intro: string;
    capabilities: string[];
    /** A verified boundary/scope disclaimer — what the system deliberately does not do. */
    boundary: string;
  };
  howItWorks: WorkStep[];
  /** No real screenshots exist yet — this drives the placeholder list, not actual images. */
  recommendedScreenshots: string[];
  demonstrates: WorkTheme[];
  technology: {
    disclosed: boolean;
    note: string;
  };
  /** Link to the SaaS product's own marketing/pricing page, if it has one. */
  productHref?: string;
}

export const WORK_ITEMS: WorkItem[] = [
  {
    slug: "wealth-circle",
    name: "WealthCircle",
    type: "NunyaLink Product",
    tagline:
      "A shared, transparent record for community savings groups — built by NunyaLink, not commissioned by a client.",
    summary:
      "A multi-tenant platform giving community savings groups a shared, structured record of contributions, loans and decisions — currently in early access.",
    statusLabel: "Early access",
    problem: {
      intro:
        "Community savings groups — susu circles, workplace collections, diaspora associations, investment clubs — run on trust and structure, but the tools underneath rarely match that. Most still depend on a combination of:",
      points: [
        "A shared spreadsheet, edited by whoever has access to it",
        "WhatsApp messages as the de facto record of who paid what, and when",
        "Contribution and loan tracking that depends on one person's memory or notebook",
        "Withdrawal and loan records kept manually, with no independent check",
        "Member updates scattered across calls, texts and group chats",
      ],
      closing:
        "None of this means a group is badly run — it means the record-keeping hasn't caught up with how much trust is riding on it.",
    },
    system: {
      intro:
        "WealthCircle brings that record into one shared, structured system, built for the way a group already runs rather than asking it to adopt a new process.",
      capabilities: [
        "Contributions tracked per member and reconciled against the group's bank statement",
        "Loan applications, approvals and repayment schedules with a clear status for every loan",
        "Role-based access — owners, administrators, treasurers, loan officers, auditors and members each see only what their role needs",
        "Two-person approval required on sensitive actions like withdrawal requests",
        "Governance proposals and voting, with a permanent record of what was decided and when",
        "A full audit trail of who did what, and when",
      ],
      boundary:
        "WealthCircle is software-only. It is not a bank, credit union, or payments provider — it doesn't hold a group's money, receive deposits, transfer funds or initiate withdrawals. The group's money stays in its own external bank account at all times; WealthCircle gives a clear, shared record of what happens around it.",
    },
    howItWorks: [
      {
        title: "Create the group",
        description:
          "Name, country, currency, contribution frequency and basic rules, set up in a guided flow.",
      },
      {
        title: "Invite members",
        description:
          "Invitations go out by email. Each member accepts and joins with the role the group assigns them.",
      },
      {
        title: "Record activity as it happens",
        description:
          "Contributions, loan applications and withdrawal requests are logged as the treasurer verifies them against the bank account.",
      },
      {
        title: "Approve, reconcile and report",
        description:
          "Sensitive actions go through two-person approval. Records reconcile against the bank statement, and reports generate on demand.",
      },
    ],
    recommendedScreenshots: [
      "Member dashboard — contribution history and status",
      "Organiser/treasurer dashboard — group overview",
      "Contribution recording and reconciliation view",
      "Loan application and approval flow",
      "Governance and voting screen",
      "Reports and audit trail view",
    ],
    demonstrates: [
      {
        title: "Turning spreadsheets and chat threads into structured data",
        description:
          "The same contribution and loan information a group already tracks informally, reorganised into one reconcilable record.",
      },
      {
        title: "Role-based access for real group hierarchies",
        description:
          "Owners, administrators, treasurers, loan officers, auditors and members — each with exactly the access their role needs, not a single shared login.",
      },
      {
        title: "Approval workflows around decisions that carry real trust",
        description:
          "Two-person sign-off and governance voting, designed around how groups actually make sensitive decisions.",
      },
      {
        title: "Building around an existing process, not replacing it",
        description:
          "WealthCircle was designed to fit how a group already runs — not to force a new way of working on it.",
      },
    ],
    technology: {
      disclosed: false,
      note:
        "Specific technology choices for WealthCircle aren't published here. Get in touch if that's relevant to your evaluation.",
    },
    productHref: "/products/wealthcircle",
  },
];

export function getWorkBySlug(slug: string): WorkItem | undefined {
  return WORK_ITEMS.find((item) => item.slug === slug);
}
