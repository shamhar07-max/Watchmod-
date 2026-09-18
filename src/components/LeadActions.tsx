"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { LeadStage } from "@prisma/client";

const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  QUOTED: "Quoted",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export function StageActions({ leadId, allowedNextStages }: { leadId: string; allowedNextStages: LeadStage[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function move(stage: LeadStage) {
    setPending(stage);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : "Could not move lead");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move lead");
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {allowedNextStages.map((stage) => (
          <button
            key={stage}
            onClick={() => move(stage)}
            disabled={pending !== null}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            {pending === stage ? "Moving..." : `Move to ${STAGE_LABELS[stage]}`}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function AssigneeSelect({
  leadId,
  currentId,
  staff,
}: {
  leadId: string;
  currentId: string | null;
  staff: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(value: string) {
    setSaving(true);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: value || null }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={currentId ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className="input"
    >
      <option value="">Unassigned</option>
      {staff.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setPending(true);
    await fetch(`/api/leads/${leadId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setMessage("");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a note..."
        className="input"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
