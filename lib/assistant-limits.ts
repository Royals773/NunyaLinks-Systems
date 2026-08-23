// Constants and types shared between the assistant's client UI and its
// API route. Deliberately has no dependency on zod or the knowledge
// module — importing this from a client component must never pull the
// system instructions or validation library into the browser bundle.

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Per-message character cap, enforced both client- and server-side. */
export const MAX_MESSAGE_LENGTH = 800;

/**
 * Maximum number of messages in a conversation (user + assistant turns
 * combined) — roughly 10-12 exchanges.
 */
export const MAX_MESSAGES = 24;

/** Server-side ceiling on waiting for the OpenAI response. */
export const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Client-side fetch ceiling — kept a little above REQUEST_TIMEOUT_MS so a
 * normal reply that takes the server close to its own limit still has
 * time to arrive, rather than the browser aborting first. Bounds how
 * long the composer can stay in a "sending" state if something between
 * the browser and the server hangs.
 */
export const CLIENT_TIMEOUT_MS = 25_000;
