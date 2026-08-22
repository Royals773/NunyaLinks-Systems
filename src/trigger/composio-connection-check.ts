import { Composio } from "@composio/core";
import { logger, task } from "@trigger.dev/sdk";

// Toolkits the NunyaLink lead automation depends on. Read-only check:
// confirms each is ACTIVE for COMPOSIO_USER_ID without touching credentials
// or account data.
const REQUIRED_TOOLKIT_SLUGS = ["gmail", "googlesheets"];

export const composioConnectionCheckTask = task({
  id: "composio-connection-check",
  maxDuration: 60,
  retry: {
    maxAttempts: 1,
  },
  run: async () => {
    const userId = process.env.COMPOSIO_USER_ID;
    if (!userId) {
      throw new Error("COMPOSIO_USER_ID is not set.");
    }

    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

    const { items } = await composio.connectedAccounts.list({
      userIds: [userId],
      statuses: ["ACTIVE"],
    });

    const activeToolkitSlugs = new Set(
      items.map((item) => item.toolkit.slug.toLowerCase())
    );

    const results: Record<string, "ACTIVE" | "MISSING"> = {};

    for (const toolkitSlug of REQUIRED_TOOLKIT_SLUGS) {
      const isActive = activeToolkitSlugs.has(toolkitSlug);
      results[toolkitSlug] = isActive ? "ACTIVE" : "MISSING";
      logger.log(`${toolkitSlug}: ${isActive ? "ACTIVE" : "MISSING"}`);

      if (!isActive) {
        throw new Error(
          `Required Composio connection "${toolkitSlug}" is missing or inactive for this user.`
        );
      }
    }

    return results;
  },
});
