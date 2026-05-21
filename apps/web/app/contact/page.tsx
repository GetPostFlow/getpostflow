"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

// Note: metadata export must be in a server component, so we export from here as a named const
// and the actual page is a client component for the form state.
// For Next.js 15, we export metadata from a separate server wrapper if needed — for now,
// contact page keeps it simple with a client component for form handling.

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          Contact
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Get in touch.
        </h1>
        <p className="text-lg leading-8 mb-12" style={{ color: "#3A3A3A" }}>
          We reply to every message within one business day. For sales inquiries, you can also email{" "}
          <a href="mailto:hello@getpostflow.com" className="underline" style={{ color: "#2F5D62" }}>
            hello@getpostflow.com
          </a>{" "}
          directly.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact form */}
          <div
            className="rounded-2xl border p-8"
            style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
          >
            <h2
              className="text-lg font-bold mb-6"
              style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
            >
              Send us a message
            </h2>

            {status === "sent" ? (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: "#EFE7DA" }}
              >
                <p className="text-base font-bold mb-2" style={{ color: "#2F5D62" }}>Message sent!</p>
                <p className="text-sm" style={{ color: "#3A3A3A" }}>We'll get back to you within one business day.</p>
              </div>
            ) : (
              <form
                action={`mailto:hello@getpostflow.com`}
                method="GET"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem("name") as HTMLInputElement)?.value;
                  const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
                  const subject = (form.elements.namedItem("subject") as HTMLInputElement)?.value;
                  const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value;
                  window.location.href = `mailto:hello@getpostflow.com?subject=${encodeURIComponent(subject || "Website inquiry")}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
                  setStatus("sent");
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>
                    Name
                  </label>
                  <input
                    name="name"
                    required
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: "#D8CCBA", background: "#F6F2EA", color: "#1A1A1A", focusRingColor: "#2F5D62" } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>
                    Email
                  </label>
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="you@company.com"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: "#D8CCBA", background: "#F6F2EA", color: "#1A1A1A" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>
                    Subject
                  </label>
                  <input
                    name="subject"
                    type="text"
                    placeholder="How can we help?"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: "#D8CCBA", background: "#F6F2EA", color: "#1A1A1A" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us about your business and what you need..."
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 resize-none"
                    style={{ borderColor: "#D8CCBA", background: "#F6F2EA", color: "#1A1A1A" }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ background: "#2F5D62" }}
                >
                  Send message
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-6">
            {[
              {
                label: "General inquiries",
                value: "hello@getpostflow.com",
                href: "mailto:hello@getpostflow.com",
              },
              {
                label: "Sales",
                value: "sales@getpostflow.com",
                href: "mailto:sales@getpostflow.com",
              },
              {
                label: "Billing & support",
                value: "billing@getpostflow.com",
                href: "mailto:billing@getpostflow.com",
              },
              {
                label: "Privacy requests",
                value: "privacy@getpostflow.com",
                href: "mailto:privacy@getpostflow.com",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border p-5"
                style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8C6A43" }}>
                  {item.label}
                </p>
                <a
                  href={item.href}
                  className="text-sm font-semibold hover:opacity-70 transition"
                  style={{ color: "#2F5D62" }}
                >
                  {item.value}
                </a>
              </div>
            ))}

            <div
              className="rounded-2xl p-5"
              style={{ background: "#EFE7DA" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8C6A43" }}>
                Response time
              </p>
              <p className="text-sm" style={{ color: "#3A3A3A" }}>
                We reply to all messages within one business day (Monday–Friday, 9am–6pm ET).
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
