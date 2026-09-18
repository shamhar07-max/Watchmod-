import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">About UAEPCS</h1>
      <p className="mt-6 text-slate-600">
        Established in 1997, UAEPCS is an IT retail, wholesale and export solutions provider
        located in the heart of Dubai&apos;s electronics hub. Over more than two decades we have
        built a reputation for reliable sourcing and fast turnaround on networking equipment,
        hardware, consumables and corporate IT infrastructure.
      </p>
      <p className="mt-4 text-slate-600">
        What started as a local retail and wholesale supplier has grown into a global export
        operation, serving customers and partners in over 77 countries alongside a strong base of
        local businesses across the UAE.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">Local presence</h2>
          <p className="mt-2 text-sm text-slate-500">
            Retail and wholesale supply to businesses across the UAE, backed by stock on hand and
            same-day dispatch from Dubai.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">Global export</h2>
          <p className="mt-2 text-sm text-slate-500">
            Container-load and bulk export orders shipped to distributors and resellers in 77+
            countries worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
