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

export const ESCROW_STATES = ["NONE", "HELD", "RELEASED", "REFUNDED"] as const;
export type EscrowStateValue = (typeof ESCROW_STATES)[number];

export function isTerminalRepairStoryStatus(status: string): boolean {
  return TERMINAL_REPAIR_STORY_STATUSES.has(status);
}

export function isAllowedRepairStoryStatus(status: string): status is RepairStoryStatusValue {
  return (REPAIR_STORY_STATUSES as readonly string[]).includes(status);
}

export function isAllowedEscrowState(s: string): s is EscrowStateValue {
  return (ESCROW_STATES as readonly string[]).includes(s);
}
