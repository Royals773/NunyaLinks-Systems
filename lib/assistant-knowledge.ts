// Static facts the NunyaLink AI assistant is allowed to draw on. Every
// line here is copied or closely paraphrased from copy already published
// elsewhere on this site (see the comment above each export for its
// source component) — nothing here should be invented.
//
// Do not add prices, timelines, statistics, testimonials, guarantees,
// integrations, capabilities, clients, results, policies or service terms
// that aren't already published on the site. If a fact isn't here, the
// assistant should say it doesn't have confirmed information rather than
// guess.

// Hero.tsx / WhatWeDo.tsx
export const COMPANY_OVERVIEW =
  "NunyaLink Systems builds AI-powered automations and mobile-first websites for SMEs. It finds the manual, repetitive work costing a business time — chasing enquiries, following up on payments, onboarding staff, updating records — and builds systems that do that work automatically, tailored to how the business already works and connected to the tools it already uses.";

// ProblemSection.tsx
export const COMMON_PAIN_POINTS = [
  "Chasing enquiries and following up leads by hand",
  "Re-typing the same information across apps and spreadsheets",
  "Manually reminding people about payments, documents or deadlines",
  "Onboarding staff or customers through slow, inconsistent steps",
  "Copying data between messaging apps, email and records",
  "Reporting that only happens when someone finds the time",
];

// WhatWeBuild.tsx
export const WHAT_WE_BUILD = [
  {
    title: "Enquiry and lead handling",
    description:
      "Where most engagements start: capture, sort and respond automatically so nothing's missed. Once this is running, everything else connects to it.",
  },
  {
    title: "Payments and reminders",
    description:
      "Automatic reminders for payments, renewals, documents and deadlines.",
  },
  {
    title: "Staff and customer onboarding",
    description: "Consistent, hands-off sequences that never skip a step.",
  },
  {
    title: "Records and data sync",
    description: "Keep info updated across apps without re-entry.",
  },
  {
    title: "Reporting and alerts",
    description: "Automatic dashboards and alerts, no chasing.",
  },
  {
    title: "Websites that feed your automations",
    description:
      "Mobile-first sites that capture enquiries and route them straight into your systems.",
  },
];

// HowItWorks.tsx
export const HOW_IT_WORKS = [
  {
    title: "Free Automation Opportunity Review",
    description:
      "A focused conversation to identify the process costing you the most time and money.",
  },
  {
    title: "Automation Audit & Roadmap",
    description:
      "A paid, in-depth review of that process — ROI estimate, priorities and a fixed build quote.",
  },
  {
    title: "Build",
    description:
      "NunyaLink builds the automation, and any website it needs, using AI and proven tools.",
  },
  {
    title: "Test and launch",
    description:
      "Tested on real business scenarios, then launched with the team briefed.",
  },
  {
    title: "Maintain and expand",
    description:
      "NunyaLink monitors, maintains and improves, and finds the next process to tackle.",
  },
];

// Packages.tsx — the approved offer names, in the order they appear on the site.
export const OFFERS = [
  {
    name: "Automation Opportunity Review",
    tag: "Free",
    description:
      "A focused initial conversation to identify the manual process creating the greatest operational cost or friction. This is exploratory and does not include a complete operational audit or detailed implementation roadmap. Every engagement starts here.",
  },
  {
    name: "Automation Audit & Roadmap",
    tag: "Paid",
    description:
      "A paid, in-depth review of the selected workflow, including process analysis, automation opportunities, an estimated ROI, priorities and a recommended implementation roadmap.",
  },
  {
    name: "Digital Foundation",
    tag: "Entry point",
    description:
      "For SMEs who need a professional online presence and a proper way to capture enquiries — often the first step before automating what happens next. Includes: mobile-first website, service or product pages, structured enquiry forms that feed your systems, basic customer records, analytics setup, team handover.",
  },
  {
    name: "First Automation",
    tag: null,
    description:
      "For SMEs ready to automate one high-value process and see the results. Includes: one custom-built automation, connection to existing tools, testing against real scenarios, team briefing and handover, 30 days post-launch support.",
  },
  {
    name: "Automation Partner",
    tag: "Recommended",
    description:
      "For SMEs who want an ongoing partner keeping things running and automating more over time. Includes: maintenance and monitoring of all automations, ongoing fixes and improvements, new automations built on a rolling basis, priority support, regular ROI and performance reviews.",
  },
  {
    name: "Business Control System",
    tag: null,
    description:
      "For established SMEs who want their automations feeding a single operational view. Includes: multiple connected automations, a central dashboard for owners and managers, alerts and reporting across the business, multi-location and multi-currency support where needed, full retainer support.",
  },
];

// WhyUs.tsx
export const WHY_NUNYALINK = [
  {
    title: "We build around ROI, not features",
    description:
      "NunyaLink automates the processes that cost the most, and proves the return before building.",
  },
  {
    title: "We handle your data responsibly",
    description:
      "Systems are designed with data protection, access control and sensible handling of business information in mind.",
  },
  {
    title: "You own the outcome, not a subscription trap",
    description:
      "Automations and websites are built around the business and kept running, not locking anyone into software they'll never fully use.",
  },
  {
    title: "We start small and expand",
    description:
      "Value is proven on one process first, then more is automated as the results speak for themselves.",
  },
];

// WhoWeWorkWith.tsx
export const WHO_WE_WORK_WITH = [
  "Recruitment & staffing agencies",
  "Care & healthcare providers",
  "Retail, wholesale & e-commerce",
  "Fashion, bespoke & creative businesses",
  "Beauty, wellness & service providers",
  "Catering & event businesses",
  "Professional & business services",
  "Training & education providers",
  "Multi-location & remotely managed businesses",
];

// AuditForm.tsx / lib/site.ts
export const CONTACT = {
  /** The Automation Opportunity Review form's section id on the homepage. */
  reviewFormAnchor: "#contact",
  enquiriesEmail: "enquiries@nunyalinksystems.com",
};
