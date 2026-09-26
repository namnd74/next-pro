import fs from 'node:fs';
import path from 'node:path';

const jsonDir = path.resolve('src/features/interview/data/json');

if (!fs.existsSync(jsonDir)) {
  console.error(`Directory not found: ${jsonDir}`);
  process.exit(1);
}

const files = fs.readdirSync(jsonDir).filter((file) => file.endsWith('.json'));

let totalQuestions = 0;
let totalDiagrams = 0;
let totalPipelines = 0;
const errors = [];

const bankDiagramCounts = {};

for (const file of files) {
  const filePath = path.join(jsonDir, file);
  const bankName = file.replace('.json', '');
  let questions = [];

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    questions = JSON.parse(raw);
  } catch (err) {
    errors.push(`[${file}] JSON Parse Error: ${err.message}`);
    continue;
  }

  if (!Array.isArray(questions)) {
    errors.push(`[${file}] Expected JSON array of questions.`);
    continue;
  }

  let bankDiagramCount = 0;

  for (const q of questions) {
    totalQuestions++;
    const senior = q.seniorAnswer;
    if (!senior) continue;

    if (senior.diagram) {
      const diag = senior.diagram;
      if (!diag.type || !['mermaid', 'pipeline', 'svg'].includes(diag.type)) {
        errors.push(`[${bankName}:${q.id}] Invalid diagram.type: "${diag.type}"`);
      }

      if (diag.type === 'mermaid') {
        if (!diag.code || typeof diag.code !== 'string' || diag.code.trim().length === 0) {
          errors.push(`[${bankName}:${q.id}] Diagram type 'mermaid' missing valid 'code' string.`);
        }
      }

      if (diag.type === 'pipeline') {
        if (!Array.isArray(diag.stages) || diag.stages.length === 0) {
          errors.push(`[${bankName}:${q.id}] Diagram type 'pipeline' missing non-empty 'stages' array.`);
        } else {
          totalPipelines++;
          for (let i = 0; i < diag.stages.length; i++) {
            const stage = diag.stages[i];
            if (!stage.name || !stage.description) {
              errors.push(`[${bankName}:${q.id}] Stage ${i} missing name or description.`);
            }
          }
        }
      }

      totalDiagrams++;
      bankDiagramCount++;
    }
  }

  if (bankDiagramCount > 0) {
    bankDiagramCounts[bankName] = bankDiagramCount;
  }
}

console.log('='.repeat(60));
console.log('🚀 VALIDATION REPORT: INTERVIEW DIAGRAMS & PIPELINES');
console.log('='.repeat(60));
console.log(`Total questions checked: ${totalQuestions}`);
console.log(`Total structured diagrams: ${totalDiagrams} (Pipelines: ${totalPipelines})`);
console.log('Diagrams by Question Bank:');
console.table(bankDiagramCounts);

if (errors.length > 0) {
  console.error('\n❌ DIAGRAM VALIDATION FAILED WITH ERRORS:');
  for (const err of errors) {
    console.error(` - ${err}`);
  }
  process.exit(1);
} else {
  console.log('\n✅ ALL DIAGRAMS AND PIPELINES ARE VALID!');
  process.exit(0);
}
