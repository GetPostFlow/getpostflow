import { NextResponse } from "next/server";

// White-label feature flag — OFF in v1 for all plans.
const WHITE_LABEL_ENABLED = false;

export async function GET() {
  if (!WHITE_LABEL_ENABLED) {
    return NextResponse.json(
      { error: "Feature not available", code: "FEATURE_DISABLED" },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true, profile: null });
}

export async function PUT() {
  if (!WHITE_LABEL_ENABLED) {
    return NextResponse.json(
      { error: "Feature not available", code: "FEATURE_DISABLED" },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true });
}
