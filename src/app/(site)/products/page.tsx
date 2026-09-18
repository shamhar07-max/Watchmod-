import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Products" };

const CATEGORIES = [
  {
    title: "Networking Equipment",
    items: ["Switches & routers", "Structured cabling", "Wireless access points", "Enterprise networking racks"],
  },
  {
    title: "IT Hardware",
    items: ["Desktops & workstations", "Laptops & notebooks", "Servers & storage", "Monitors & peripherals"],
  },
  {
    title: "Consumables",
    items: ["Printer & toner consumables", "Cables & connectors", "Power supplies & accessories"],
  },
  {
    title: "Corporate IT Infrastructure",
    items: ["Office & data center fit-out", "Structured IT supply contracts", "Bulk procurement for enterprises"],
  },
];

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Products &amp; Categories</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        A full catalogue is available on request. Contact our sales team for current stock,
        pricing and lead times.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <div key={c.title} className="rounded-lg border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <ul className="mt-3 space-y-1 text-sm text-slate-500">
              {c.items.map((item) => (
                <li key={item}>&bull; {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg bg-slate-50 p-6">
        <p className="font-semibold text-slate-900">Looking for something specific?</p>
        <p className="mt-1 text-sm text-slate-500">
          Send us your requirement and we&apos;ll get back with pricing and availability.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Request a Quote
        </Link>
      </div>
    </div>
  );
}
