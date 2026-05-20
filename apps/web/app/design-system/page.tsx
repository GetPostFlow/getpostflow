"use client";

import { useState } from "react";
import { Button } from "@getpostflow/ui/button";
import { Input } from "@getpostflow/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@getpostflow/ui/card";
import { Badge } from "@getpostflow/ui/badge";
import { Avatar } from "@getpostflow/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@getpostflow/ui/tabs";
import { StatTile } from "@getpostflow/ui/stat-tile";
import { EmptyState } from "@getpostflow/ui/empty-state";
import { Skeleton } from "@getpostflow/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@getpostflow/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@getpostflow/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@getpostflow/ui/select";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2
        className="text-lg font-semibold border-b pb-2"
        style={{ color: "var(--text-primary)", borderColor: "var(--border-soft)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [inputVal, setInputVal] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectVal, setSelectVal] = useState("");

  return (
    <div
      className="min-h-screen px-6 py-12"
      style={{ background: "var(--canvas)", color: "var(--text-primary)" }}
    >
      <div className="mx-auto max-w-4xl flex flex-col gap-12">
        {/* Header */}
        <div>
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans'), sans-serif", color: "var(--brand-primary)" }}
          >
            GetPostFlow Design System
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            All Phase 1 components in light context. Palette: canvas #F6F2EA · brand #2F5D62 · secondary #8C6A43
          </p>
        </div>

        {/* Typography */}
        <Section title="Typography">
          <p
            className="text-5xl font-bold"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans'), sans-serif" }}
          >
            Display — Plus Jakarta Sans
          </p>
          <p className="text-3xl font-semibold">Heading Large</p>
          <p className="text-xl font-semibold">Heading Medium</p>
          <p className="text-base">Body text — Inter. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Small / secondary text</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Caption / muted text</p>
        </Section>

        {/* Palette */}
        <Section title="Colour Tokens">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "canvas", val: "#F6F2EA" },
              { label: "surface", val: "#FFFDF9" },
              { label: "subtle", val: "#EFE7DA" },
              { label: "border-soft", val: "#D8CCBA" },
              { label: "brand.primary", val: "#2F5D62" },
              { label: "brand.secondary", val: "#8C6A43" },
              { label: "brand.accent", val: "#B9A28E" },
              { label: "brand.success", val: "#708B75" },
              { label: "brand.warning", val: "#A67C52" },
              { label: "brand.danger", val: "#A35D5D" },
              { label: "text.primary", val: "#1F2430" },
              { label: "text.secondary", val: "#5E6472" },
            ].map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-1.5">
                <div
                  className="h-12 w-12 rounded-xl border"
                  style={{ background: c.val, borderColor: "var(--border-soft)" }}
                />
                <span className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Button">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Input">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              hint="We'll never share your email."
            />
            <Input
              label="With error"
              placeholder="Enter value"
              error="This field is required."
            />
          </div>
        </Section>

        {/* Select */}
        <Section title="Select">
          <Select value={selectVal} onValueChange={setSelectVal}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select a role…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="org_admin">Admin</SelectItem>
              <SelectItem value="strategist">Strategist</SelectItem>
              <SelectItem value="content_manager">Content Manager</SelectItem>
              <SelectItem value="client_viewer">Client Viewer</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        {/* Badges */}
        <Section title="Badge">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        {/* Avatars */}
        <Section title="Avatar">
          <div className="flex items-center gap-4">
            <Avatar fallback="JD" size="sm" />
            <Avatar fallback="AB" size="md" />
            <Avatar fallback="XY" size="lg" />
            <Avatar src="https://i.pravatar.cc/96?img=5" fallback="PH" size="md" />
          </div>
        </Section>

        {/* Cards */}
        <Section title="Card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold">Default card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Card with header, content, and footer.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Action</Button>
              </CardFooter>
            </Card>
            <Card variant="flat">
              <CardContent className="py-5">
                <p className="text-sm font-medium">Flat variant</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>No shadow, same border.</p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Tabs */}
        <Section title="Tabs">
          <Tabs defaultValue="one">
            <TabsList>
              <TabsTrigger value="one">Overview</TabsTrigger>
              <TabsTrigger value="two">Analytics</TabsTrigger>
              <TabsTrigger value="three">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Overview tab content.</p>
            </TabsContent>
            <TabsContent value="two">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Analytics tab content.</p>
            </TabsContent>
            <TabsContent value="three">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Settings tab content.</p>
            </TabsContent>
          </Tabs>
        </Section>

        {/* StatTiles */}
        <Section title="StatTile">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Accounts" value="4 / 8" change="+2 this week" changePositive />
            <StatTile label="Posts" value="142" change="+18%" changePositive />
            <StatTile label="Impressions" value="12.4K" change="-3%" />
            <StatTile label="AI Credits" value="320 / 800" />
          </div>
        </Section>

        {/* Table */}
        <Section title="Table">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Alice Martin", status: "Active", role: "Admin", joined: "Jan 2025" },
                  { name: "Ben Cho", status: "Pending", role: "Strategist", joined: "Mar 2025" },
                  { name: "Clara Diaz", status: "Active", role: "Client Viewer", joined: "Apr 2025" },
                ].map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Active" ? "success" : "warning"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.joined}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Section>

        {/* EmptyState */}
        <Section title="EmptyState">
          <EmptyState
            icon={<span>📭</span>}
            title="No messages yet"
            description="When someone sends you a message, it will appear here."
            action={<Button>Compose</Button>}
          />
        </Section>

        {/* Skeleton */}
        <Section title="SkeletonLoader">
          <div className="flex flex-col gap-2 max-w-sm">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-24 w-full mt-2" />
          </div>
        </Section>

        {/* Dialog */}
        <Section title="Dialog">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>
                  This is a sample dialog. Are you sure you want to continue?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 mt-4 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
              </div>
            </DialogContent>
          </Dialog>
        </Section>
      </div>
    </div>
  );
}
