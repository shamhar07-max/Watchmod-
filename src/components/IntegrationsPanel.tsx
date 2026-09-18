"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { LeadSource } from "@prisma/client";

const CHANNELS: LeadSource[] = [
  "FACEBOOK",
  "INSTAGRAM",
  "WHATSAPP",
  "LINKEDIN",
  "EMAIL",
  "PHONE",
  "REFERRAL",
  "TRADE_SHOW",
  "OTHER",
];

type Integration = {
  id: string;
  channel: LeadSource;
  label: string;
  isActive: boolean;
  lastEventAt: string | null;
};

export function IntegrationsPanel({ initial }: { initial: Integration[] }) {
  const router = useRouter();
  const [channel, setChannel] = useState<LeadSource>("FACEBOOK");
  const [label, setLabel] = useState("");
  const [pending, setPending] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setPending(true);
    await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, label }),
    });
    setLabel("");
    setPending(false);
    router.refresh();
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/integrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-5">
        <label className="text-sm">
          <span className="font-medium text-slate-700">Channel</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as LeadSource)}
            className="input mt-1"
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Label</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Main Facebook Page"
            className="input mt-1"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add integration
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Last event</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initial.map((integration) => (
              <tr key={integration.id}>
                <td className="px-4 py-3 text-slate-700">{integration.channel}</td>
                <td className="px-4 py-3 text-slate-700">{integration.label}</td>
                <td className="px-4 py-3 text-slate-400">
                  {integration.lastEventAt
                    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
                        new Date(integration.lastEventAt),
                      )
                    : "No events yet"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      integration.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {integration.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggle(integration.id, integration.isActive)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {integration.isActive ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
            {initial.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No integrations configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
