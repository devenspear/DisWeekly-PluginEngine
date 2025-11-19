/**
 * Quick test script for fact verification system
 *
 * Run with: npx tsx scripts/test-verification.ts
 */

import { quickVerify } from "../lib/fact-verification";

// Example 1: Clean bullets that should pass
console.log("\n" + "=".repeat(80));
console.log("TEST 1: Clean bullets (should PASS)");
console.log("=".repeat(80));

const sourceArticle1 = `
OpenAI announced a major funding round today, raising $500 million in Series C funding
led by Sequoia Capital. The company plans to use the funds to expand its AI research
team and scale infrastructure. CEO Sam Altman stated that the company will hire 200
new engineers by the end of 2025. OpenAI currently serves over 2 million active users
and processes 10 billion API requests per month.
`;

const goodBullets = [
  "OpenAI raised $500 million in Series C funding led by Sequoia Capital",
  "The company plans to hire 200 new engineers by end of 2025",
  "OpenAI currently serves over 2 million active users on the platform",
  "The platform processes approximately 10 billion API requests each month",
  "CEO Sam Altman announced plans to expand the AI research team",
  "Funding will be used to scale infrastructure and expand research capabilities",
];

quickVerify(goodBullets, sourceArticle1);

// Example 2: Hallucinated bullets that should fail
console.log("\n\n" + "=".repeat(80));
console.log("TEST 2: Hallucinated bullets (should FAIL)");
console.log("=".repeat(80));

const sourceArticle2 = `
Tesla announced quarterly earnings today. The company reported strong sales growth
in the electric vehicle market. CEO Elon Musk highlighted progress on autonomous
driving features and mentioned plans to expand manufacturing capacity.
`;

const badBullets = [
  "Tesla raised $2 billion in Series D funding round", // HALLUCINATED - no funding mentioned
  "The company reported revenue of $50 billion for the quarter", // HALLUCINATED - no revenue number
  "Tesla plans to build 5 new factories in Asia by 2026", // HALLUCINATED - no specific factory numbers
  "CEO Elon Musk announced partnership with Toyota and Honda", // HALLUCINATED - no partnerships mentioned
  "The company's stock price surged 45% following the announcement", // HALLUCINATED - no stock info
  "Tesla delivered 500,000 vehicles in the quarter", // HALLUCINATED - no delivery numbers
];

quickVerify(badBullets, sourceArticle2);

// Example 3: Mixed results (some good, some bad)
console.log("\n\n" + "=".repeat(80));
console.log("TEST 3: Mixed bullets (should PASS with moderate confidence)");
console.log("=".repeat(80));

const sourceArticle3 = `
Microsoft launched Azure AI Studio, a new platform for enterprise AI development.
The platform integrates with existing Azure services and supports multiple LLM providers.
Microsoft VP Sarah Bond stated the platform is designed for businesses with 500+ employees.
The company expects 1 million developers to adopt the platform within the first year.
`;

const mixedBullets = [
  "Microsoft launched Azure AI Studio platform for enterprise AI development", // GOOD
  "The platform integrates with existing Azure services and supports multiple LLMs", // GOOD
  "Microsoft VP Sarah Bond announced the platform targets mid-market businesses", // GOOD (paraphrased)
  "The company raised $300 million to fund platform development", // BAD - hallucinated
  "Microsoft expects 1 million developers to adopt within the first year", // GOOD
  "Platform pricing starts at $5,000 per month for enterprise customers", // BAD - hallucinated
];

quickVerify(mixedBullets, sourceArticle3);

console.log("\n\n" + "=".repeat(80));
console.log("Testing complete!");
console.log("=".repeat(80) + "\n");
