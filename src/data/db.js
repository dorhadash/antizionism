// src/data/db.js

/**
 * This file loads ALL claims and examples from the JSON structure:
 *
 * tweets/
 *   tweets_1_antizionism/
 *     1_totalizingIdeology/
 *       claim.json
 *       examples.json
 *     2_selfJustifyingHate/
 *       claim.json
 *       examples.json
 *
 * It builds:
 * - claims (array)
 * - claimMap (id → claim object)
 * - allExamples (flattened example list)
 * - examplesByClaimId (id → array of examples)
 */

console.log("[db.js] Loading data…");

/* -------------------------------------------------------
 * 1. Load all claims.json files
 * -----------------------------------------------------*/

const claimModules = import.meta.glob("/tweets/**/claim.json", { eager: true });

// Convert modules → array of claims
const parentNames = {
  tweets_1_anti_zionism: 'Antizionism', tweets_2_libels: 'Libels',
  tweets_3_narratives: 'Narratives', tweets_4_tactics: 'Tactics',
  tweets_5_rhetorical: 'Rhetorical', tweets_6_palestinians: 'Palestinians',
  tweets_7_other: 'Other',
};
const correctSpelling = text => (text || '').replace(/Propoganda/g, 'Propaganda')
  .replace(/Harrassment/g, 'Harassment').replace(/Intiidation/g, 'Intimidation')
  .replace(/Naziism/g, 'Nazism');
export const claims = Object.entries(claimModules).map(([path, module]) => {
  const claim = module.default ?? module;
  const parentKey = path.split('/')[2];
  return { ...claim, claimId: String(claim.claimId),
    claimShortText: correctSpelling(claim.claimShortText || claim.keyword),
    parentKey, parentName: parentNames[parentKey] || 'Other' };
});
export const categoryGroups = Object.entries(parentNames).map(([key, name]) => ({
  key, name, claims: claims.filter(claim => claim.parentKey === key),
}));

// Build fast lookup map: claimId → claim object
export const claimMap = Object.fromEntries(
  claims.map(c => [c.claimId, c])
);

/* -------------------------------------------------------
 * 2. Load all examples.json files
 * -----------------------------------------------------*/

const exampleModules = import.meta.glob("/tweets/**/examples.json", { eager: true });

// Flatten all example arrays
export const allExamples = Object.values(exampleModules)
  .flatMap(m => (m.default ?? m))
  .map(ex => ({
    ...ex,
    // Normalize date for consistent sorting (optional)
    date: ex.date.split("-").map((part, index) => part.padStart(index === 0 ? 4 : 2, "0")).join("-")
  }));

/* -------------------------------------------------------
 * 3. Index examples by claimId
 * -----------------------------------------------------*/

export const examplesByClaimId = allExamples.reduce((acc, ex) => {
  const list = Array.isArray(ex.claimIds) ? ex.claimIds : [];

  for (const id of list) {
    if (!acc[id]) acc[id] = [];
    acc[id].push(ex);
  }
  return acc;
}, {});

/* -------------------------------------------------------
 * 4. Log dataset stats (optional but helpful)
 * -----------------------------------------------------*/

console.log(`[db.js] Loaded ${claims.length} claims`);
console.log(`[db.js] Loaded ${allExamples.length} examples`);
console.log("[db.js] Database initialized.");
