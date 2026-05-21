import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--canvas)" }}
    >
      <div className="w-full max-w-md px-4">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), 'Plus Jakarta Sans', sans-serif", color: "var(--brand-primary)" }}
          >
            GetPostFlow
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            AI-powered social community management
          </p>
        </div>

        <SignIn
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#2F5D62",
              colorBackground: "#FFFDF9",
              colorInputBackground: "#FFFDF9",
              colorText: "#1F2430",
              colorTextSecondary: "#5E6472",
              colorInputText: "#1F2430",
              borderRadius: "12px",
              fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            },
            elements: {
              rootBox: "w-full",
              card: "shadow-lg border border-[#D8CCBA] rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
