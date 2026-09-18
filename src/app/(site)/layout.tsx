import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/wholesale-export", label: "Wholesale & Export" },
  { href: "/contact", label: "Contact" },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            UAE<span className="text-blue-600">PCS</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-blue-600">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/contact"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Get a Quote
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-base font-bold text-slate-900">UAEPCS</p>
              <p className="mt-2">
                IT retail, wholesale &amp; export solutions provider based in Dubai&apos;s
                electronics hub since 1997.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Company</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
                <li><Link href="/products" className="hover:text-blue-600">Products</Link></li>
                <li><Link href="/wholesale-export" className="hover:text-blue-600">Wholesale &amp; Export</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Get in touch</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/contact" className="hover:text-blue-600">Contact &amp; Enquiries</Link></li>
                <li><Link href="/admin/login" className="hover:text-blue-600">Staff Login</Link></li>
              </ul>
            </div>
          </div>
          <p className="mt-8 border-t border-slate-200 pt-6">
            &copy; {new Date().getFullYear()} UAEPCS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
