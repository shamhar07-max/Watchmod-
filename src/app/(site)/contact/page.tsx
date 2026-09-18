import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Get in touch</h1>
        <p className="mt-4 text-slate-600">
          Whether you need a single order or a long-term wholesale/export partnership, tell us
          what you&apos;re looking for and our team will follow up.
        </p>

        <dl className="mt-8 space-y-3 text-sm text-slate-600">
          <div>
            <dt className="font-semibold text-slate-900">Office</dt>
            <dd>Dubai, United Arab Emirates</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Phone</dt>
            <dd>+971 4 393 4707</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Email</dt>
            <dd>office@uaepcs.com</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
        <ContactForm />
      </div>
    </div>
  );
}
