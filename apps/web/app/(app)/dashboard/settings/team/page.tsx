"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@getpostflow/ui/card";
import { Input } from "@getpostflow/ui/input";
import { Badge } from "@getpostflow/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@getpostflow/ui/table";
import { EmptyState } from "@getpostflow/ui/empty-state";
import { Avatar } from "@getpostflow/ui/avatar";

export default function TeamSettingsPage() {
  const { organization, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"org:admin" | "org:member">("org:member");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!organization || !inviteEmail) return;
    setInviting(true);
    setError("");
    setSuccess("");
    try {
      await organization.inviteMember({ emailAddress: inviteEmail, role: inviteRole });
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }

  const memberList = memberships?.data ?? [];
  const inviteList = invitations?.data ?? [];

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          Team
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage members and invitations for your organization.
        </p>
      </div>

      {/* Invite form */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Invite member
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
            <Input
              label="Email address"
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 min-w-48"
              required
            />
            <div className="flex flex-col gap-1.5 min-w-36">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "org:admin" | "org:member")}
                className="rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface)", borderColor: "var(--border-soft)", color: "var(--text-primary)" }}
              >
                <option value="org:member">Member</option>
                <option value="org:admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={inviting}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--brand-primary)" }}
              >
                {inviting ? "Sending…" : "Send invite"}
              </button>
            </div>
          </form>
          {error && <p className="mt-2 text-xs" style={{ color: "var(--brand-danger)" }}>{error}</p>}
          {success && <p className="mt-2 text-xs" style={{ color: "var(--brand-success)" }}>{success}</p>}
        </CardContent>
      </Card>

      {/* Members table */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Members ({memberList.length})
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {memberList.length === 0 ? (
            <EmptyState
              title="No members yet"
              description="Invite someone above to get started."
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberList.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={m.publicUserData?.imageUrl}
                          fallback={m.publicUserData?.firstName?.[0] ?? m.publicUserData?.identifier?.[0] ?? "?"}
                          size="sm"
                        />
                        <span>{m.publicUserData?.firstName} {m.publicUserData?.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{m.publicUserData?.identifier}</TableCell>
                    <TableCell>
                      <Badge variant={m.role === "org:admin" ? "warning" : "default"}>
                        {m.role === "org:admin" ? "Admin" : "Member"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending invites */}
      {inviteList.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Pending Invitations ({inviteList.length})
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inviteList.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.emailAddress}</TableCell>
                    <TableCell>
                      <Badge variant="default">{inv.role}</Badge>
                    </TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      <button
                        className="text-xs hover:underline"
                        style={{ color: "var(--brand-danger)" }}
                        onClick={() => inv.revoke()}
                      >
                        Revoke
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
