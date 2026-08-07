import { ENQUIRIES_MAILTO } from "@/lib/site";

// Products NunyaLink Systems has built and sells as standalone SaaS —
// distinct from the bespoke automation/website work described elsewhere
// on the site. Add a new entry here to add a new product; nothing in
// components/app/products/** needs to change.

export type ProductStatus = "live" | "beta" | "coming-soon";

export interface ProductFeature {
  title: string;
  description: string;
}

export interface ProductStep {
  title: string;
  description: string;
}

export interface ProductCta {
  /** "trial"/"visit" open the product's own site in a new tab; "enquire" opens a mailto. */
  type: "trial" | "visit" | "enquire";
  label: string;
  href: string;
}

export interface Product {
  slug: string;
  name: string;
  /** Short monogram shown in the product's own badge, e.g. "WC". */
  monogram: string;
  tagline: string;
  /** Short context line, e.g. who it's built for — shown under the tagline. */
  eyebrow: string;
  /** 1–2 sentences, for the card. */
  description: string;
  /** Fuller description, one entry per paragraph, for the detail page. */
  longDescription: string[];
  /** 2–4 short bullets, for the card. */
  features: string[];
  /** Fuller feature list with descriptions, for the detail page. */
  detailFeatures: ProductFeature[];
  /** Optional "how it works" steps, for the detail page. */
  howItWorks?: ProductStep[];
  /** Who the product is aimed at, shown as tags on the detail page. */
  builtFor?: string[];
  pricing: {
    /** Short summary shown on the card, e.g. "From £29/mo" or "Early access". */
    summary: string;
    note?: string;
    includes?: string[];
  };
  status: ProductStatus;
  /** Overrides the default label for `status` (e.g. "Early Access" instead of "Beta"). */
  statusLabel?: string;
  cta: ProductCta;
  screenshots?: { alt: string; src: string }[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "wealthcircle",
    name: "WealthCircle",
    monogram: "WC",
    tagline:
      "Manage your group's savings, loans and decisions with clarity, accountability and confidence.",
    eyebrow: "Built for savings groups, susu circles, and associations",
    description:
      "A shared, transparent record of contributions, loans, repayments and decisions for community savings groups, susu circles, workplace groups and associations — built for the way your group already runs.",
    longDescription: [
      "WealthCircle gives community savings groups, friends and family circles, workplace groups, churches, diaspora associations, susu groups and investment clubs a shared, transparent record of contributions, loans, repayments and decisions — built for the way your group already runs.",
      "It's a multi-tenant platform: every group gets its own private workspace, with its own members, contributions, loans and governance decisions kept separate from every other group.",
      "WealthCircle is software-only. It is not a bank, credit union, or payments provider — it doesn't hold your group's money, receive deposits, transfer funds or initiate withdrawals. Your group's money stays in its own external bank account at all times; WealthCircle simply gives you a clear, shared record of what happens around it.",
    ],
    features: [
      "Contributions, tracked precisely",
      "Loans and repayments with a clear status",
      "Role-based access for your committee",
      "Two-person approval for sensitive actions",
    ],
    detailFeatures: [
      {
        title: "Contributions, tracked precisely",
        description:
          "Record fixed or flexible contributions per member, verify them, and reconcile against your group's bank statement — all in one place.",
      },
      {
        title: "Loans and repayments",
        description:
          "Manage loan products, applications, approvals and repayment schedules with a clear status for every loan.",
      },
      {
        title: "Roles built for how groups run",
        description:
          "Owners, administrators, treasurers, loan officers, auditors and members each get the access their role needs — nothing more.",
      },
      {
        title: "Two-person approval",
        description:
          "Sensitive actions like withdrawal requests can require sign-off from two separate people before they're marked approved.",
      },
      {
        title: "Governance and voting",
        description:
          "Raise proposals, collect votes and keep a permanent record of what your group decided and when.",
      },
      {
        title: "Reports and audit trail",
        description:
          "Every important action is recorded, so treasurers and auditors can always see who did what, and when.",
      },
    ],
    howItWorks: [
      {
        title: "Create your group",
        description:
          "Set your group's name, country, currency, contribution frequency and basic rules in a guided setup.",
      },
      {
        title: "Invite your members",
        description:
          "Send invitations by email. Each member accepts and joins with the role your group assigns them.",
      },
      {
        title: "Record activity as it happens",
        description:
          "Log contributions, loan applications and withdrawal requests as your group's treasurer verifies them against your bank account.",
      },
      {
        title: "Approve, reconcile and report",
        description:
          "Sensitive actions go through approval. Reconcile records against your statement and generate reports whenever you need them.",
      },
    ],
    builtFor: [
      "Community savings groups",
      "Friends and family savings groups",
      "Workplace groups",
      "Churches and associations",
      "Diaspora groups",
      "Susu groups",
      "Investment clubs",
    ],
    pricing: {
      summary: "Early access — pricing to be announced",
      note: "Create your group today and keep using it as pricing is introduced.",
      includes: [
        "Unlimited group members",
        "Contributions, loans and repayment tracking",
        "Role-based access for your committee",
        "Governance proposals and voting",
        "Audit log and reporting",
      ],
    },
    status: "beta",
    statusLabel: "Early Access",
    cta: {
      // No public production URL is wired up yet — see the note in
      // the PR/chat this shipped with. Swap this to
      // { type: "trial", label: "Create your account", href: "https://<real-domain>" }
      // once WealthCircle has a public URL.
      type: "enquire",
      label: "Enquire about early access",
      href: ENQUIRIES_MAILTO,
    },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}
