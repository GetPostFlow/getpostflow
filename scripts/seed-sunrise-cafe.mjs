/**
 * Seed script: Create "Sunrise Cafe" demo client with client_pending brand strategy
 * Run: node scripts/seed-sunrise-cafe.mjs
 */

import { neon } from "/Users/lish/Projects/getpostflow/node_modules/.pnpm/node_modules/@neondatabase/serverless/index.mjs";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_Q3m7CMGrZSDJ@ep-dawn-night-apntem4m.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

const draftPayload = {
  positioningStatement:
    "Sunrise Cafe is the neighborhood coffee shop that fuels morning routines with locally roasted beans and fresh pastries.",
  brandVoiceGuide:
    'Warm, welcoming, slightly playful. Use "you" and "your" liberally.',
  audiencePersonas: [
    {
      name: "Morning Commuter",
      description:
        "Grabs coffee on the way to work, values speed and consistency",
    },
    {
      name: "Remote Worker",
      description: "Sets up laptop for 2-3 hours, needs WiFi and outlets",
    },
    {
      name: "Weekend Bruncher",
      description: "Comes for pastries and Instagram-worthy lattes",
    },
  ],
  contentPillars: [
    "Behind the Brew",
    "Pastry of the Day",
    "Customer Spotlights",
    "Local Partnerships",
    "Morning Motivation",
  ],
  samplePostsByPlatform: {
    instagram: [
      {
        headline: "Fresh out the oven",
        body: "Our almond croissants are baked at 6AM every morning. Come grab yours before they're gone!",
      },
      {
        headline: "Meet the team",
        body: "Barista Sarah has been with us for 3 years. Ask her for the secret menu!",
      },
    ],
    facebook: [
      {
        headline: "Weekend brunch special",
        body: "Every Saturday and Sunday: buy one pastry, get one half off. Tag a friend who needs a coffee date!",
      },
    ],
  },
  doNotMention: ["competitors by name", "negative reviews", "politics"],
  hashtagStrategy: {
    instagram: ["#sunrisecafe", "#localcoffee", "#freshpastry", "#morningfuel"],
  },
  postingCadenceRecommendation:
    "Instagram: daily stories, 3x/week feed. Facebook: 2x/week.",
  kpiTargets: { engagementRate: 4.5, reachGrowth: 15 },
};

const aiMetadata = {
  model: "stub",
  generatedAt: new Date().toISOString(),
};

async function main() {
  console.log("Looking up Demo Agency org...");

  // Try to find the org by name
  const orgs = await sql`
    SELECT id, name FROM orgs 
    WHERE name ILIKE '%Demo Agency%' OR name ILIKE '%demo%'
    LIMIT 5
  `;
  console.log("Found orgs:", orgs);

  if (orgs.length === 0) {
    // List all orgs to pick one
    const allOrgs = await sql`SELECT id, name FROM orgs LIMIT 10`;
    console.log("All orgs:", allOrgs);
    if (allOrgs.length === 0) {
      throw new Error("No orgs found in database.");
    }
  }

  const orgRow = orgs.length > 0 ? orgs[0] : null;

  if (!orgRow) {
    // Use first available org
    const [firstOrg] = await sql`SELECT id, name FROM orgs LIMIT 1`;
    if (!firstOrg) throw new Error("No orgs available.");
    console.warn(`Warning: 'Demo Agency' not found. Using org: ${firstOrg.name}`);
    return seedClient(firstOrg.id, firstOrg.name);
  }

  return seedClient(orgRow.id, orgRow.name);
}

async function seedClient(orgId, orgName) {
  console.log(`Using org: ${orgName} (${orgId})`);

  // Check if Sunrise Cafe already exists
  const existing = await sql`
    SELECT id, name, status FROM clients WHERE name = 'Sunrise Cafe' LIMIT 1
  `;
  if (existing.length > 0) {
    console.log("Sunrise Cafe already exists:", existing[0]);
    const strat = await sql`
      SELECT id, status FROM client_brand_strategies
      WHERE client_id = ${existing[0].id}
      LIMIT 1
    `;
    console.log("Existing strategy:", strat);
    return { client: existing[0], strategy: strat[0] };
  }

  console.log("Inserting Sunrise Cafe client...");
  const [client] = await sql`
    INSERT INTO clients (
      org_id,
      name,
      slug,
      status,
      primary_contact_email,
      target_locales,
      primary_locale,
      industry,
      permissions
    )
    VALUES (
      ${orgId},
      'Sunrise Cafe',
      'sunrise-cafe',
      'client_review',
      'owner@sunrisecafe.com',
      '["en"]'::jsonb,
      'en',
      'Food & Beverage',
      '{}'::jsonb
    )
    RETURNING id, name, status, slug
  `;
  console.log("Client inserted:", client);

  console.log("Inserting brand strategy (client_pending)...");
  const [strategy] = await sql`
    INSERT INTO client_brand_strategies (
      client_id,
      version_int,
      status,
      draft_payload,
      edited_payload,
      ai_metadata,
      strategist_comments,
      client_comments
    )
    VALUES (
      ${client.id},
      1,
      'client_pending',
      ${JSON.stringify(draftPayload)}::jsonb,
      '{}'::jsonb,
      ${JSON.stringify(aiMetadata)}::jsonb,
      '[]'::jsonb,
      '[]'::jsonb
    )
    RETURNING id, status
  `;
  console.log("Strategy inserted:", strategy);

  return { client, strategy };
}

main()
  .then((result) => {
    console.log("\nSeed complete!");
    console.log("Client:", result.client);
    console.log("Strategy:", result.strategy);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
