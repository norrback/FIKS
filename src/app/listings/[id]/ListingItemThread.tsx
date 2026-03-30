"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./listing-detail.module.css";

type Sender = { id: string; name: string | null; email: string };

export type ListingThreadMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: Sender;
};

type Props = {
  listingId: string;
  initialMessages: ListingThreadMessage[];
};

export default function ListingItemThread({ listingId, initialMessages }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`/api/listings/${encodeURIComponent(listingId)}/listing-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: ListingThreadMessage;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not send.");
        return;
      }
      if (data.message) {
        setMessages((m) => [...m, data.message!]);
        setBody("");
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.itemThread}>
      <div className={styles.itemThreadMessages}>
        {messages.length === 0 ? (
          <p className={styles.caseHint}>No case-wide messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={styles.itemThreadBubble}>
              <div className={styles.itemThreadMeta}>
                {m.sender.name ?? m.sender.email} · {new Date(m.createdAt).toLocaleString()}
              </div>
              <div>{m.body}</div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={(e) => void send(e)}>
        {error ? (
          <p className={styles.caseError} role="alert">
            {error}
          </p>
        ) : null}
        <label className={styles.sectionLabel} htmlFor="listing-thread-msg">
          Add message
        </label>
        <textarea
          id="listing-thread-msg"
          className={styles.itemThreadTextarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={sending}
          rows={3}
        />
        <button type="submit" className={styles.applyBtn} disabled={sending || !body.trim()}>
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
