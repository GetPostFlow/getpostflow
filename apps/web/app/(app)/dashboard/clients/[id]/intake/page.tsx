import { notFound } from "next/navigation";
import { requireOrgAuth } from "@/lib/auth-org";
import { createDb } from "@getpostflow/db";
import { clients, clientIntakeSubmissions } from "@getpostflow/db";
import { eq, and, desc } from "drizzle-orm";
import IntakeForm from "./_intake-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IntakePage({ params }: Props) {
  const { id } = await params;
  const { orgRow: org } = await requireOrgAuth();

  const db = createDb(process.env.DATABASE_URL!);

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.orgId, org.id)))
    .limit(1);

  if (!client) notFound();

  // If already submitted (not draft), redirect to strategy review
  const [latestIntake] = await db
    .select()
    .from(clientIntakeSubmissions)
    .where(eq(clientIntakeSubmissions.clientId, client.id))
    .orderBy(desc(clientIntakeSubmissions.id))
    .limit(1);

  // Load draft data if exists
  const initialData =
    latestIntake && latestIntake.isDraft
      ? flattenPayload(latestIntake.rawPayload as Record<string, unknown>)
      : { businessName: client.name, industry: client.industry ?? "" };

  return <IntakeForm clientId={client.id} initialData={initialData} />;
}

function flattenPayload(payload: Record<string, unknown>): Record<string, unknown> {
  if (!payload) return {};
  const bv = (payload.brandVoice as Record<string, number> | undefined) ?? {};
  const assets = (payload.existingAssets as Record<string, unknown> | undefined) ?? {};
  const cadence = (payload.preferredCadence as Record<string, string> | undefined) ?? {};
  const urls = assets.sampleContentUrls as string[] | undefined;

  return {
    businessName: (payload.businessName as string) ?? "",
    website: (payload.website as string) ?? "",
    industry: (payload.industry as string) ?? "",
    targetAudience: (payload.targetAudience as string) ?? "",
    brandVoiceFormalCasual: bv.formalCasual ?? 5,
    brandVoiceSeriousPlayful: bv.seriousPlayful ?? 5,
    brandVoiceConservativeBold: bv.conservativeBold ?? 5,
    uniqueSellingProps: (payload.uniqueSellingProps as string) ?? "",
    productsServices: (payload.productsServices as string) ?? "",
    competitors: (payload.competitors as string) ?? "",
    doNotMentionList: (payload.doNotMentionList as string) ?? "",
    contentGoals: (payload.contentGoals as string[]) ?? [],
    targetLocales: (payload.targetLocales as string[]) ?? ["en"],
    cadenceInstagram: cadence.instagram ?? "3x per week",
    cadenceFacebook: cadence.facebook ?? "3x per week",
    cadenceLinkedin: cadence.linkedin ?? "Weekly",
    cadenceTiktok: cadence.tiktok ?? "3x per week",
    colorHex: (assets.colorHex as string) ?? "",
    fonts: (assets.fonts as string) ?? "",
    sampleContentUrls: urls ? urls.join("\n") : "",
  };
}
