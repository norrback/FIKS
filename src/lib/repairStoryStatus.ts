/**
 * Repair story lifecycle — v1 strings stored on `RepairStory.status`.
 * Expect this list and the transitions to change as we learn the real workflow.
 *
 * Item vs story: `Listing.id` is the case/item id. Each `RepairStory.id` is a separate
 * line of work (another repairer, or a branched attempt after e.g. CLOSED_CANNOT_FIX).
 */

export const REPAIR_STORY_STATUSES = [
  "APPLIED",
  "IN_CONVERSATION",
  "TROUBLESHOOTING",
  "AGREED",
  "ESCROW_HELD",
  "WORK_IN_PROGRESS",
  "JOB_DONE",
  "PAID",
  "CLOSED_CANNOT_FIX",
  "CLOSED_CANCELLED",
] as const;

export type RepairStoryStatusValue = (typeof REPAIR_STORY_STATUSES)[number];

export const TERMINAL_REPAIR_STORY_STATUSES: ReadonlySet<string> = new Set([
  "PAID",
  "CLOSED_CANNOT_FIX",
  "CLOSED_CANCELLED",
]);

/**
 * Once any story reaches these statuses, this listing is no longer open for fresh applications.
 * Existing stories can continue, but new ones should be blocked.
 */
export const APPLICATION_BLOCKING_REPAIR_STORY_STATUSES: ReadonlySet<string> = new Set([
  "AGREED",
  "ESCROW_HELD",
  "WORK_IN_PROGRESS",
  "JOB_DONE",
  "PAID",
]);

export const ESCROW_STATES = ["NONE", "HELD", "RELEASED", "REFUNDED"] as const;
export type EscrowStateValue = (typeof ESCROW_STATES)[number];

export function isTerminalRepairStoryStatus(status: string): boolean {
  return TERMINAL_REPAIR_STORY_STATUSES.has(status);
}

export function isApplicationBlockedByRepairStoryStatus(status: string): boolean {
  return APPLICATION_BLOCKING_REPAIR_STORY_STATUSES.has(status);
}

const STATUS_PROGRESSION_INDEX = new Map(
  REPAIR_STORY_STATUSES.map((s, i) => [s as string, i]),
);

/**
 * Derive the display status for a listing from its repair stories.
 * Returns the status of whichever active (non-terminal) story is furthest
 * along in the process. Falls back to the listing's own status when no
 * active stories exist.
 */
export function getEffectiveListingStatus(
  listingStatus: string,
  storyStatuses: string[],
): string {
  if (storyStatuses.length === 0) return listingStatus;

  let bestIndex = -1;
  let bestStatus = "";

  for (const s of storyStatuses) {
    if (TERMINAL_REPAIR_STORY_STATUSES.has(s)) continue;
    const idx = STATUS_PROGRESSION_INDEX.get(s) ?? -1;
    if (idx > bestIndex) {
      bestIndex = idx;
      bestStatus = s;
    }
  }

  if (bestStatus) return bestStatus;

  if (storyStatuses.includes("PAID")) return "PAID";

  return listingStatus;
}

export function isAllowedRepairStoryStatus(status: string): status is RepairStoryStatusValue {
  return (REPAIR_STORY_STATUSES as readonly string[]).includes(status);
}

export function isAllowedEscrowState(s: string): s is EscrowStateValue {
  return (ESCROW_STATES as readonly string[]).includes(s);
}
