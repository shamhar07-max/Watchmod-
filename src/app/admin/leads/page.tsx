import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStage, LeadSource } from "@prisma/client";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; source?: string }>;
}) {
  const { stage, source } = await searchParams;

  const leads = await prisma.lead.findMany({
    where: {
      stage: stage ? (stage as LeadStage) : undefined,
      source: source ? (source as LeadSource) : undefined,
    },
    include: { assignedTo: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Leads</h1>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <FilterLink label="All stages" active={!stage} href="/admin/leads" />
        {Object.values(LeadStage).map((s) => (
          <FilterLink
            key={s}
            label={s}
            active={stage === s}
            href={`/admin/leads?stage=${s}${source ? `&source=${source}` : ""}`}
          />
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Assigned to</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="font-medium text-blue-600 hover:underline">
                    {lead.contactName}
                  </Link>
                  {lead.email && <p className="text-xs text-slate-400">{lead.email}</p>}
                </td>
                <td className="px-4 py-3 text-slate-600">{lead.companyName ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{lead.source}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {lead.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{lead.assignedTo?.name ?? "Unassigned"}</td>
                <td className="px-4 py-3 text-slate-400">
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(lead.updatedAt)}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No leads match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 ${
        active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}
