"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ESCROW_STATES,
  REPAIR_STORY_STATUSES,
  isTerminalRepairStoryStatus,
  type RepairStoryStatusValue,
} from "@/lib/repairStoryStatus";
import styles from "./repair-story.module.css";

type Party = { id: string; name: string | null; email: string };

export type StoryPayload = {
  id: string;
  listingId: string;
  status: string;
  branchedFromId: string | null;
  agreedPriceCents: number | null;
  escrowState: string;
  agreedAt: string | null;
  jobCompletedAt: string | null;
  paidAt: string | null;
  closedReason: string | null;
  customerScore: number | null;
  repairerScore: number | null;
  createdAt: string;
  updatedAt: string;
  listing: { id: string; title: string; authorId: string };
  repairer: Party;
};

export type Msg = {
  id: string;
  body: string;
  createdAt: string;
  sender: Party;
};

const STATUS_HELP: Partial<Record<RepairStoryStatusValue, string>> = {
  APPLIED: "Repairer applied — agree to start talking.",
  IN_CONVERSATION: "Figuring out fit and scope.",
  TROUBLESHOOTING: "Diagnosing without a firm quote yet.",
  AGREED: "Scope/price agreed — next step is escrow (when payments ship).",
  ESCROW_HELD: "Funds held in escrow (stub until payment integration).",
  WORK_IN_PROGRESS: "Repair work underway.",
  JOB_DONE: "Work finished — confirm and release payment.",
  PAID: "Closed successfully.",
  CLOSED_CANNOT_FIX: "Repairer cannot proceed — you can branch a new story.",
  CLOSED_CANCELLED: "Stopped before completion.",
};

type Props = {
  initialStory: StoryPayload;
  initialMessages: Msg[];
  viewerIsAuthor: boolean;
  viewerIsRepairer: boolean;
};

export default function RepairStoryWorkspace({
  initialStory,
  initialMessages,
  viewerIsAuthor,
  viewerIsRepairer,
}: Props) {
  const router = useRouter();
  const [story, setStory] = useState(initialStory);
  const [messages, setMessages] = useState(initialMessages);
  const [status, setStatus] = useState(story.status);
  const [agreedPriceEur, setAgreedPriceEur] = useState(
    story.agreedPriceCents != null ? (story.agreedPriceCents / 100).toFixed(2) : "",
  );
  const [escrowState, setEscrowState] = useState(story.escrowState);
  const [closedReason, setClosedReason] = useState(story.closedReason ?? "");
  const [customerScore, setCustomerScore] = useState(story.customerScore?.toString() ?? "");
  const [repairerScore, setRepairerScore] = useState(story.repairerScore?.toString() ?? "");
  const [msgBody, setMsgBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const terminal = isTerminalRepairStoryStatus(story.status);

  const statusHelp = useMemo(() => {
    const k = status as RepairStoryStatusValue;
    return STATUS_HELP[k] ?? "Status meanings will evolve as we learn the workflow.";
  }, [status]);

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};

      if (terminal) {
        if (viewerIsAuthor) {
          if (customerScore.trim() !== "") {
            const n = Number(customerScore);
            if (n >= 1 && n <= 5) body.customerScore = n;
            else {
              setError("Customer score must be 1–5.");
              setSaving(false);
              return;
            }
          } else if (story.customerScore != null) {
            body.customerScore = null;
          }
        }
        if (viewerIsRepairer) {
          if (repairerScore.trim() !== "") {
            const n = Number(repairerScore);
            if (n >= 1 && n <= 5) body.repairerScore = n;
            else {
              setError("Repairer score must be 1–5.");
              setSaving(false);
              return;
            }
          } else if (story.repairerScore != null) {
            body.repairerScore = null;
          }
        }
        if (Object.keys(body).length === 0) {
          setSaving(false);
          return;
        }
      } else {
        const agreedPriceCents =
          agreedPriceEur.trim() === ""
            ? null
            : Math.round(Number.parseFloat(agreedPriceEur.replace(",", ".")) * 100);
        if (agreedPriceCents != null && (!Number.isFinite(agreedPriceCents) || agreedPriceCents < 0)) {
          setError("Enter a valid price or leave empty.");
          setSaving(false);
          return;
        }

        body.status = status;
        body.escrowState = escrowState;
        body.closedReason = closedReason.trim() || null;
        if (agreedPriceCents !== null) body.agreedPriceCents = agreedPriceCents;

        if (viewerIsAuthor && customerScore.trim() !== "") {
          const n = Number(customerScore);
          if (n >= 1 && n <= 5) body.customerScore = n;
        } else if (viewerIsAuthor && customerScore.trim() === "" && story.customerScore != null) {
          body.customerScore = null;
        }

        if (viewerIsRepairer && repairerScore.trim() !== "") {
          const n = Number(repairerScore);
          if (n >= 1 && n <= 5) body.repairerScore = n;
        } else if (viewerIsRepairer && repairerScore.trim() === "" && story.repairerScore != null) {
          body.repairerScore = null;
        }
      }

      const res = await fetch(`/api/repair-stories/${encodeURIComponent(story.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; story?: StoryPayload };
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      if (data.story) {
        setStory(data.story);
        setStatus(data.story.status);
        setEscrowState(data.story.escrowState);
        setClosedReason(data.story.closedReason ?? "");
        setCustomerScore(data.story.customerScore?.toString() ?? "");
        setRepairerScore(data.story.repairerScore?.toString() ?? "");
        setAgreedPriceEur(
          data.story.agreedPriceCents != null ? (data.story.agreedPriceCents / 100).toFixed(2) : "",
        );
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = msgBody.trim();
    if (!text) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`/api/repair-stories/${encodeURIComponent(story.id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: Msg };
      if (!res.ok) {
        setError(data.error ?? "Could not send.");
        return;
      }
      if (data.message) {
        setMessages((m) => [...m, data.message!]);
        setMsgBody("");
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.container}>
      <nav className={styles.back}>
        <Link href={`/listings/${story.listingId}`} className={styles.backLink}>
          ← Back to case
        </Link>
      </nav>

      <p className={styles.processNote}>
        This repair flow is a first draft: statuses, escrow, and scoring will change as we build FIKS. Several
        repairers can each have their own <strong>repair story</strong> on the same <strong>case</strong> (listing).
        If an attempt ends without a fix, start a <strong>branched</strong> story from the closed one.
      </p>

      <div className={styles.grid}>
        <div>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Repair story</h2>
            <p className={styles.ids}>
              <strong>Case (item) ID:</strong> {story.listingId}
              <br />
              <strong>Repair story ID:</strong> {story.id}
              {story.branchedFromId ? (
                <>
                  <br />
                  <strong>Branched from:</strong> {story.branchedFromId}
                </>
              ) : null}
            </p>

            <div className={styles.statusRow}>
              <span className={styles.statusBadge}>{story.status.replace(/_/g, " ")}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{statusHelp}</span>
            </div>

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            <form onSubmit={saveMeta}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={terminal || saving}
                >
                  {REPAIR_STORY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="price">
                  Agreed price (EUR)
                </label>
                <input
                  id="price"
                  className={styles.input}
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 45.00"
                  value={agreedPriceEur}
                  onChange={(e) => setAgreedPriceEur(e.target.value)}
                  disabled={terminal || saving}
                />
                <p className={styles.hint}>Stored in cents server-side. Escrow/payout is not wired yet.</p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="escrow">
                  Escrow (stub)
                </label>
                <select
                  id="escrow"
                  className={styles.select}
                  value={escrowState}
                  onChange={(e) => setEscrowState(e.target.value)}
                  disabled={terminal || saving}
                >
                  {ESCROW_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="closedReason">
                  Closed reason (optional)
                </label>
                <input
                  id="closedReason"
                  className={styles.input}
                  value={closedReason}
                  onChange={(e) => setClosedReason(e.target.value)}
                  disabled={terminal || saving}
                  style={{ maxWidth: "100%" }}
                />
              </div>

              {viewerIsAuthor ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="custScore">
                    Your score for the repairer (1–5)
                  </label>
                  <input
                    id="custScore"
                    className={styles.input}
                    type="number"
                    min={1}
                    max={5}
                    value={customerScore}
                    onChange={(e) => setCustomerScore(e.target.value)}
                    disabled={saving}
                  />
                </div>
              ) : null}

              {viewerIsRepairer ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="repScore">
                    Your score for the customer (1–5)
                  </label>
                  <input
                    id="repScore"
                    className={styles.input}
                    type="number"
                    min={1}
                    max={5}
                    value={repairerScore}
                    onChange={(e) => setRepairerScore(e.target.value)}
                    disabled={saving}
                  />
                </div>
              ) : null}

              <div className={styles.btnRow}>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? "Saving…" : "Save updates"}
                </button>
              </div>
            </form>
          </section>

          <section className={styles.card} style={{ marginTop: "1.25rem" }}>
            <h2 className={styles.cardTitle}>Story thread (you + other party only)</h2>
            <div className={styles.messages}>
              {messages.length === 0 ? (
                <p className={styles.hint} style={{ margin: 0 }}>
                  No messages yet.
                </p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={styles.bubble}>
                    <div className={styles.bubbleMeta}>
                      {m.sender.name ?? m.sender.email} · {new Date(m.createdAt).toLocaleString()}
                    </div>
                    <div>{m.body}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={sendMessage}>
              <label className={styles.label} htmlFor="msg">
                Message
              </label>
              <textarea
                id="msg"
                className={styles.textarea}
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className={styles.sendBtn} disabled={sending || !msgBody.trim()}>
                {sending ? "Sending…" : "Send"}
              </button>
            </form>
          </section>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.cardTitle}>Case</h2>
          <p className={styles.sideMuted}>
            <strong>{story.listing.title}</strong>
          </p>
          <p className={styles.sideMuted}>
            Repairer: <strong>{story.repairer.name ?? story.repairer.email}</strong>
          </p>
          <p className={styles.sideMuted}>
            For case-wide chat (owner + repairers who have a story here), use the listing page.
          </p>
          <Link href={`/listings/${story.listingId}`} className={styles.backLink}>
            Open listing
          </Link>
        </aside>
      </div>
    </div>
  );
}
