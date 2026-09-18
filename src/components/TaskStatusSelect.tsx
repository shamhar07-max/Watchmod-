"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TaskStatus } from "@prisma/client";

const OPTIONS: TaskStatus[] = ["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"];

export function TaskStatusSelect({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(value: TaskStatus) {
    setSaving(true);
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as TaskStatus)}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
