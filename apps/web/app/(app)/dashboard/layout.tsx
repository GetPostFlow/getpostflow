import { redirect } from "next/navigation";
import DashboardShell from "./shell";

// Stub/preview mode guard: if no real Clerk key is configured, redirect to sign-in
// rather than calling auth() which would throw with a placeholder key.
const STUB_CLERK_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const stubMode =
  !clerkKey ||
  clerkKey === STUB_CLERK_KEY ||
  clerkKey.length <= 30 ||
  (!clerkKey.startsWith("pk_live_") && !clerkKey.startsWith("pk_test_"));

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (stubMode) {
    redirect("/sign-in");
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <DashboardShell>{children}</DashboardShell>;
}
