import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;

const sql = readFileSync('packages/db/drizzle/0001_blueprint_rebuild_phases_1_to_8.sql', 'utf8');
// Split by statement breakpoint marker and filter empty
const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
console.log('Connected to DB');

let ok = 0, skipped = 0, failed = 0;
for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  try {
    await client.query(stmt);
    console.log(`OK [${i+1}/${statements.length}]`);
    ok++;
  } catch (e) {
    const msg = e.message || '';
    if (
      msg.includes('already exists') ||
      msg.includes('duplicate column') ||
      msg.includes('column') && msg.includes('already exists')
    ) {
      console.log(`SKIP (already exists) [${i+1}/${statements.length}]`);
      skipped++;
    } else {
      console.error(`FAILED [${i+1}/${statements.length}]: ${msg}`);
      console.error('SQL:', stmt.substring(0, 300));
      failed++;
    }
  }
}

await client.end();
console.log(`Done. OK=${ok} SKIPPED=${skipped} FAILED=${failed}`);
