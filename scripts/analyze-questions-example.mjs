import fs from 'node:fs';
import path from 'node:path';

const jsonDir = path.join(process.cwd(), 'src/features/interview/data/json');
const files = fs.readdirSync(jsonDir).filter((f) => f.endsWith('.json'));

let totalQuestions = 0;
let withExample = 0;
let withoutExample = 0;
const categoryStats = {};
const levelStats = {
  junior: { total: 0, withExample: 0, withoutExample: 0 },
  middle: { total: 0, withExample: 0, withoutExample: 0 },
  senior: { total: 0, withExample: 0, withoutExample: 0 },
  lead: { total: 0, withExample: 0, withoutExample: 0 },
};

const allMissingQuestions = [];

for (const file of files) {
  const content = JSON.parse(fs.readFileSync(path.join(jsonDir, file), 'utf-8'));
  if (!Array.isArray(content)) continue;

  for (const q of content) {
    totalQuestions++;
    const cat = q.category || file.replace('-bank.json', '').replace('.json', '');
    if (!categoryStats[cat]) {
      categoryStats[cat] = {
        file,
        total: 0,
        withExample: 0,
        withoutExample: 0,
        missingQuestions: [],
      };
    }
    categoryStats[cat].total++;

    const lvl = q.level || 'middle';
    if (!levelStats[lvl]) {
      levelStats[lvl] = { total: 0, withExample: 0, withoutExample: 0 };
    }
    levelStats[lvl].total++;

    const codeEx = q.seniorAnswer && q.seniorAnswer.codeExample;
    const hasExample = typeof codeEx === 'string' && codeEx.trim().length > 0;

    if (hasExample) {
      withExample++;
      categoryStats[cat].withExample++;
      levelStats[lvl].withExample++;
    } else {
      withoutExample++;
      categoryStats[cat].withoutExample++;
      levelStats[lvl].withoutExample++;

      const item = {
        id: q.id,
        category: cat,
        file,
        level: q.level,
        question: q.question,
        expectedKeywords: q.expectedKeywords,
      };
      categoryStats[cat].missingQuestions.push(item);
      allMissingQuestions.push(item);
    }
  }
}

// Check mock-interview-bank.ts as well
const mockBankPath = path.join(process.cwd(), 'src/features/interview/data/mock-interview-bank.ts');
let _mockCount = 0;
if (fs.existsSync(mockBankPath)) {
  const mockContent = fs.readFileSync(mockBankPath, 'utf-8');
  // Simple regex heuristic for mock questions
  const idMatches = mockContent.match(/id:\s*['"][^'"]+['"]/g) || [];
  _mockCount = idMatches.length;
}

console.log('--- SUMMARY STATS ---');
console.log(`Total Questions in JSON banks: ${totalQuestions}`);
console.log(`Questions WITH codeExample: ${withExample} (${((withExample / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`Questions WITHOUT codeExample: ${withoutExample} (${((withoutExample / totalQuestions) * 100).toFixed(1)}%)`);
console.log('\n--- BY LEVEL ---');
for (const [lvl, stat] of Object.entries(levelStats)) {
  console.log(`${lvl}: Total ${stat.total} | With: ${stat.withExample} | Without: ${stat.withoutExample} (${((stat.withoutExample / (stat.total || 1)) * 100).toFixed(1)}%)`);
}

console.log('\n--- CATEGORIES WITH MISSING EXAMPLES ---');
const sortedCategories = Object.entries(categoryStats).sort(
  (a, b) => b[1].withoutExample - a[1].withoutExample
);

for (const [cat, stat] of sortedCategories) {
  if (stat.withoutExample > 0) {
    console.log(
      `[${cat}] (${stat.file}): ${stat.withoutExample}/${stat.total} missing (${((stat.withoutExample / stat.total) * 100).toFixed(1)}%)`
    );
  }
}

// Output detailed missing count to a temporary JSON report for comprehensive analysis
fs.writeFileSync(
  path.join(process.cwd(), 'scripts/missing-examples-report.json'),
  JSON.stringify({
    totalQuestions,
    withExample,
    withoutExample,
    levelStats,
    sortedCategories: sortedCategories.map(([cat, stat]) => ({
      category: cat,
      file: stat.file,
      total: stat.total,
      withExample: stat.withExample,
      withoutExample: stat.withoutExample,
      percentageWithout: ((stat.withoutExample / stat.total) * 100).toFixed(1),
      samples: stat.missingQuestions.slice(0, 3),
    })),
    allMissingQuestions,
  }, null, 2)
);
console.log('\nDetailed report written to scripts/missing-examples-report.json');
