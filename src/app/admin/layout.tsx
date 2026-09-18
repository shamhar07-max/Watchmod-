import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/settings/integrations", label: "Integrations" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // The login page renders under this same layout tree in Next.js, but it
  // shouldn't get the authenticated shell — middleware handles the redirect,
  // this just avoids flashing the nav when session is briefly unresolved.
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white sm:block">
        <div className="px-6 py-5">
          <p className="text-lg font-bold text-slate-900">
            UAE<span className="text-blue-600">PCS</span>
          </p>
          <p className="text-xs text-slate-400">Operations Dashboard</p>
        </div>
        <nav className="mt-2 flex flex-col gap-1 px-3 text-sm font-medium text-slate-600">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-sm text-slate-500">
            Signed in as <span className="font-medium text-slate-800">{session.user.name}</span>
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              Sign out
            </button>
          </form>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
