import Link from "next/link";

const CATEGORIES = [
  {
    title: "Networking Equipment",
    desc: "Switches, routers, structured cabling, wireless and enterprise networking gear.",
  },
  {
    title: "IT Hardware",
    desc: "Desktops, laptops, servers, storage and peripherals from leading brands.",
  },
  {
    title: "Consumables",
    desc: "Printer & toner consumables, cables, accessories and everyday IT supplies.",
  },
  {
    title: "Corporate IT Infrastructure",
    desc: "End-to-end infrastructure supply for offices, data centers and enterprises.",
  },
];

const STATS = [
  { value: "1997", label: "Established in Dubai" },
  { value: "77+", label: "Countries exported to" },
  { value: "1000+", label: "Products supplied" },
  { value: "25+", label: "Years of trading experience" },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Retail &middot; Wholesale &middot; Export
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            IT networking, hardware &amp; infrastructure, sourced from Dubai and shipped worldwide.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Since 1997, UAEPCS has supplied networking equipment, hardware, consumables and
            corporate IT infrastructure to local businesses and exporters across more than 77
            countries.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Request a Quote
            </Link>
            <Link
              href="/products"
              className="rounded-md border border-slate-600 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 sm:px-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-blue-600">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">What we supply</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <div key={c.title} className="rounded-lg border border-slate-200 p-6">
              <p className="font-semibold text-slate-900">{c.title}</p>
              <p className="mt-2 text-sm text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-600">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Wholesale &amp; export enquiries welcome</h2>
            <p className="mt-2 max-w-xl text-blue-100">
              Bulk pricing, container-load export orders and long-term supply partnerships,
              handled by a dedicated team.
            </p>
          </div>
          <Link
            href="/wholesale-export"
            className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            Learn more
          </Link>
        </div>
      </section>
    </div>
  );
}
