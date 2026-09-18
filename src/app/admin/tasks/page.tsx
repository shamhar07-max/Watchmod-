import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TaskStatusSelect } from "@/components/TaskStatusSelect";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: {
      lead: { select: { id: true, contactName: true, companyName: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    take: 300,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Tasks</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Assigned to</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{task.title}</td>
                <td className="px-4 py-3">
                  {task.lead ? (
                    <Link href={`/admin/leads/${task.lead.id}`} className="text-blue-600 hover:underline">
                      {task.lead.contactName}
                    </Link>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{task.assignedTo?.name ?? "Unassigned"}</td>
                <td className="px-4 py-3 text-slate-400">
                  {task.dueAt
                    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(task.dueAt)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <TaskStatusSelect taskId={task.id} status={task.status} />
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No tasks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
