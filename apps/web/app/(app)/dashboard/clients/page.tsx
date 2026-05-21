"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@getpostflow/ui";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data.clients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Clients</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Clients</h1>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#2F5D62" }}
          >
            + New Client
          </Link>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No clients yet. Create your first client to get started.</p>
            <Link
              href="/dashboard/clients/new"
              className="mt-4 inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "#2F5D62" }}
            >
              Create Client
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "#2F5D62" }}
        >
          + New Client
        </Link>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <Link key={client.id} href={`/dashboard/clients/${client.slug}`}>
            <Card className="hover:shadow-md transition">
              <CardHeader>
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.status}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
