import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStage } from "@prisma/client";

const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  QUOTED: "Quoted",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

const STAGES = Object.keys(STAGE_LABELS) as LeadStage[];

export default async function AdminOverviewPage() {
  const [leads, openTasksCount, wonThisMonth] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { updatedAt: "desc" },
      include: { assignedTo: { select: { name: true } } },
      take: 300,
    }),
    prisma.task.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.lead.count({
      where: {
        stage: "WON",
        updatedAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
  ]);

  const byStage = STAGES.reduce<Record<LeadStage, typeof leads>>((acc, stage) => {
    acc[stage] = leads.filter((l) => l.stage === stage);
    return acc;
  }, {} as Record<LeadStage, typeof leads>);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Overview</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total leads" value={leads.length} />
        <StatTile label="Open tasks" value={openTasksCount} />
        <StatTile label="Won this month" value={wonThisMonth} />
      </div>

      <h2 className="mt-10 text-sm font-semibold text-slate-500">Pipeline</h2>
      <div className="mt-3 flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div key={stage} className="w-64 shrink-0 rounded-lg bg-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-slate-700">{STAGE_LABELS[stage]}</p>
              <span className="text-xs text-slate-400">{byStage[stage].length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {byStage[stage].slice(0, 8).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="block rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-blue-400"
                >
                  <p className="font-medium text-slate-900">{lead.contactName}</p>
                  {lead.companyName && <p className="text-xs text-slate-500">{lead.companyName}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {lead.source} {lead.assignedTo ? `· ${lead.assignedTo.name}` : ""}
                  </p>
                </Link>
              ))}
              {byStage[stage].length === 0 && (
                <p className="px-1 text-xs text-slate-400">No leads</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
