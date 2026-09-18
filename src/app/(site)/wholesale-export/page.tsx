import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Wholesale & Export" };

export default function WholesaleExportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Wholesale &amp; Export</h1>
      <p className="mt-6 text-slate-600">
        UAEPCS supplies distributors, resellers and enterprises worldwide with bulk and
        container-load orders of networking equipment, hardware, consumables and IT
        infrastructure &mdash; exported to over 77 countries from our base in Dubai.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-6">
          <p className="font-semibold text-slate-900">Bulk pricing</p>
          <p className="mt-2 text-sm text-slate-500">Tiered pricing for volume and repeat orders.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-6">
          <p className="font-semibold text-slate-900">Export documentation</p>
          <p className="mt-2 text-sm text-slate-500">Full support with shipping and customs paperwork.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-6">
          <p className="font-semibold text-slate-900">Long-term partnerships</p>
          <p className="mt-2 text-sm text-slate-500">Dedicated account management for ongoing supply.</p>
        </div>
      </div>

      <div className="mt-10">
        <Link
          href="/contact"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Start a Wholesale/Export Enquiry
        </Link>
      </div>
    </div>
  );
}
