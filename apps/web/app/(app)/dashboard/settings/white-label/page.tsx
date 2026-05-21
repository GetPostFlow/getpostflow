import { redirect } from "next/navigation";

// White-label feature flag — OFF in v1 for all plans.
// Redirects to dashboard if not enabled.
const WHITE_LABEL_ENABLED = false;

export default function WhiteLabelPage() {
  if (!WHITE_LABEL_ENABLED) {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">White Label</h1>
      <p className="text-sm text-muted-foreground">
        White-label customization is not yet available. Contact your account manager for early access.
      </p>
    </div>
  );
}
