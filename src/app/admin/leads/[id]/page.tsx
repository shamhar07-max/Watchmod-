import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canTransition } from "@/lib/workflow";
import { LeadStage } from "@prisma/client";
import { StageActions, AssigneeSelect, NoteForm } from "@/components/LeadActions";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [lead, staff] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        tasks: { orderBy: { createdAt: "desc" } },
        activities: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { name: true } } },
        },
      },
    }),
    prisma.user.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
  ]);

  if (!lead) notFound();

  const allowedNextStages = Object.values(LeadStage).filter((s) => canTransition(lead.stage, s));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{lead.contactName}</h1>
            <p className="text-sm text-slate-500">{lead.companyName ?? "No company"}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {lead.stage}
          </span>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-500">Move stage</h2>
          <div className="mt-3">
            <StageActions leadId={lead.id} allowedNextStages={allowedNextStages} />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-500">Activity</h2>
          <div className="mt-3">
            <NoteForm leadId={lead.id} />
          </div>
          <ul className="mt-5 space-y-4 border-t border-slate-100 pt-4">
            {lead.activities.map((activity) => (
              <li key={activity.id} className="text-sm">
                <p className="text-slate-700">{activity.message}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {activity.type} {activity.createdBy ? `· ${activity.createdBy.name}` : ""} ·{" "}
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
                    activity.createdAt,
                  )}
                </p>
              </li>
            ))}
            {lead.activities.length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-500">Tasks</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {lead.tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{task.title}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {task.status}
                </span>
              </li>
            ))}
            {lead.tasks.length === 0 && <p className="py-2 text-sm text-slate-400">No tasks yet.</p>}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-500">Details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Email" value={lead.email} />
            <Row label="Phone" value={lead.phone} />
            <Row label="Country" value={lead.country} />
            <Row label="Product interest" value={lead.productInterest} />
            <Row label="Source" value={`${lead.source}${lead.sourceRef ? ` (${lead.sourceRef})` : ""}`} />
          </dl>
          {lead.message && (
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{lead.message}</div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-500">Assigned to</h2>
          <div className="mt-3">
            <AssigneeSelect leadId={lead.id} currentId={lead.assignedTo?.id ?? null} staff={staff} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-slate-700">{value || "—"}</dd>
    </div>
  );
}
