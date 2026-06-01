import { db } from "./db";
import { sectorQuestions, industrySectors } from "@shared/schema";
import { eq } from "drizzle-orm";
import { QUESTIONS_LOT1 } from "./questions-lot1";
import { QUESTIONS_LOT2 } from "./questions-lot2";
import { QUESTIONS_LOT3 } from "./questions-lot3";

const ALL_QUESTIONS = {
  ...QUESTIONS_LOT1,
  ...QUESTIONS_LOT2,
  ...QUESTIONS_LOT3,
};

async function reseedQuestions() {
  console.log("Re-seeding sector questions with enriched OiRA questionnaires...");

  const sectors = await db.select().from(industrySectors);
  const sectorMap: Record<string, string> = {};
  for (const s of sectors) {
    sectorMap[s.code] = s.id;
  }

  await db.delete(sectorQuestions);
  console.log("Cleared existing sector questions");

  let questionCount = 0;
  for (const [sectorCode, modules] of Object.entries(ALL_QUESTIONS)) {
    const sectorId = sectorMap[sectorCode];
    if (!sectorId) {
      console.log(`Sector ${sectorCode} not found in database, skipping`);
      continue;
    }
    let orderIndex = 0;
    for (const mod of modules) {
      for (const q of mod.questions) {
        await db.insert(sectorQuestions).values({
          sectorId,
          module: mod.module,
          question: q.q,
          description: q.d || null,
          preventionMeasure: q.p || null,
          orderIndex: orderIndex++,
        });
        questionCount++;
      }
    }
  }
  console.log(`Re-seeded ${questionCount} sector questions across ${Object.keys(ALL_QUESTIONS).length} sectors`);
  process.exit(0);
}

reseedQuestions().catch(console.error);
