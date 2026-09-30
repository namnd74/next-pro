import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const jsonDir = path.join(projectRoot, 'src', 'features', 'interview', 'data', 'json');

console.log('============================================================');
console.log('🔍 AUDIT SUITE: INTERVIEW QUESTIONS, ANSWERS & FOLLOW-UPS');
console.log('============================================================\n');

const files = fs.readdirSync(jsonDir).filter((f) => f.endsWith('.json'));

let totalQuestions = 0;
let totalFollowUps = 0;
const errors = [];
const warnings = [];

const allQuestionsMap = new Map();

for (const file of files) {
  const filePath = path.join(jsonDir, file);
  let questions = [];

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    questions = JSON.parse(raw);
  } catch (err) {
    errors.push(`[${file}] Lỗi phân tích cú pháp JSON: ${err.message}`);
    continue;
  }

  if (!Array.isArray(questions)) {
    errors.push(`[${file}] Dữ liệu gốc không phải là mảng câu hỏi.`);
    continue;
  }

  const seenIdsInBank = new Set();
  const seenCodesInBank = new Map();

  questions.forEach((q, idx) => {
    totalQuestions++;
    const prefix = `[${file} #${idx + 1} (${q.id || 'NO-ID'})]`;

    // 1. Kiểm tra ID
    if (!q.id) {
      errors.push(`${prefix} Thiếu thuộc tính 'id'.`);
    } else if (seenIdsInBank.has(q.id)) {
      errors.push(`${prefix} Trùng ID '${q.id}' trong cùng một bank.`);
    } else {
      seenIdsInBank.add(q.id);
    }

    // 2. Kiểm tra câu hỏi & trùng lặp chéo giữa các bank
    if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 5) {
      errors.push(`${prefix} Thuộc tính 'question' trống hoặc quá ngắn.`);
    } else {
      const normQ = q.question.trim().toLowerCase().replace(/\s+/g, ' ');
      if (allQuestionsMap.has(normQ)) {
        const existing = allQuestionsMap.get(normQ);
        errors.push(
          `${prefix} Trùng lặp câu hỏi với [${existing.file} (${existing.id})]: "${q.question}"`
        );
      } else {
        allQuestionsMap.set(normQ, { file, id: q.id, question: q.question });
      }
    }

    // 3. Kiểm tra Senior Answer
    if (!q.seniorAnswer) {
      errors.push(`${prefix} Thiếu đối tượng 'seniorAnswer'.`);
    } else {
      const summary = (q.seniorAnswer.summary || '').trim();
      const deepDive = (q.seniorAnswer.deepDive || '').trim();
      const code = (q.seniorAnswer.codeExample || '').trim();

      if (!summary || summary.length < 20) {
        errors.push(`${prefix} 'seniorAnswer.summary' trống hoặc quá ngắn (<20 ký tự).`);
      }
      if (!deepDive || deepDive.length < 40) {
        errors.push(`${prefix} 'seniorAnswer.deepDive' trống hoặc quá ngắn (<40 ký tự).`);
      }
      if (summary === deepDive) {
        errors.push(`${prefix} 'summary' và 'deepDive' có nội dung giống hệt nhau.`);
      }

      // Kiểm tra placeholder text
      if (/\b(todo|tbd|đang cập nhật|lorem ipsum)\b/i.test(summary) || /\b(todo|tbd|đang cập nhật|lorem ipsum)\b/i.test(deepDive)) {
        errors.push(`${prefix} Chứa placeholder text chưa hoàn thiện.`);
      }

      // Kiểm tra trùng code trong cùng bank
      if (code && code.length > 50) {
        if (seenCodesInBank.has(code)) {
          warnings.push(
            `${prefix} Trùng đoạn codeExample với câu [${seenCodesInBank.get(code)}] trong cùng bank.`
          );
        } else {
          seenCodesInBank.set(code, q.id);
        }
      }
    }

    // 4. Kiểm tra Pitfalls
    if (!q.pitfalls || !Array.isArray(q.pitfalls) || q.pitfalls.length === 0) {
      errors.push(`${prefix} Thiếu mảng 'pitfalls' hoặc mảng rỗng.`);
    }

    // 5. Kiểm tra Follow-up Questions
    if (q.followUpQuestions && Array.isArray(q.followUpQuestions)) {
      const seenFollowUpsInQ = new Set();
      q.followUpQuestions.forEach((f, fIdx) => {
        totalFollowUps++;
        const fText = (typeof f === 'string' ? f : f?.question || '').trim();
        const normF = fText.toLowerCase();

        if (!fText || fText.length < 5) {
          errors.push(`${prefix} Follow-up #${fIdx + 1} trống hoặc quá ngắn.`);
        }

        if (normF === q.question?.trim().toLowerCase()) {
          errors.push(`${prefix} Follow-up #${fIdx + 1} trùng hệt câu hỏi cha.`);
        }

        if (seenFollowUpsInQ.has(normF)) {
          errors.push(`${prefix} Follow-up #${fIdx + 1} bị trùng lặp với follow-up khác trong cùng câu hỏi.`);
        }
        seenFollowUpsInQ.add(normF);
      });
    }
  });
}

// 6. Kiểm tra hợp đồng kiến trúc (Architectural Safety Contract) của Follow-up Resolver
const resolverPath = path.join(
  projectRoot,
  'src',
  'features',
  'interview',
  'data',
  'followup-resolver.ts'
);
if (fs.existsSync(resolverPath)) {
  const resolverContent = fs.readFileSync(resolverPath, 'utf8');
  if (resolverContent.includes('codeExample: parentQuestion.seniorAnswer?.codeExample')) {
    errors.push(
      `[followup-resolver.ts] Vi phạm quy tắc: Không được gán lại codeExample của câu hỏi cha cho follow-up question.`
    );
  }
}

// 7. Kiểm tra hợp đồng bảo vệ giao diện trong Question Card
const cardPath = path.join(
  projectRoot,
  'src',
  'features',
  'interview',
  'components',
  'question-card.tsx'
);
if (fs.existsSync(cardPath)) {
  const cardContent = fs.readFileSync(cardPath, 'utf8');
  if (!cardContent.includes('resolved.codeExample !== question.seniorAnswer?.codeExample')) {
    errors.push(
      `[question-card.tsx] Vi phạm quy tắc: Cần có điều kiện kiểm tra ngăn chặn hiển thị trùng code của câu hỏi chính trong follow-up.`
    );
  }
}

console.log(`Đã kiểm tra ${files.length} tệp Question Banks.`);
console.log(`Tổng số câu hỏi: ${totalQuestions.toLocaleString()}`);
console.log(`Tổng số câu hỏi mở rộng (Follow-ups): ${totalFollowUps.toLocaleString()}\n`);

if (warnings.length > 0) {
  console.log(`⚠️ CẢNH BÁO (${warnings.length}):`);
  warnings.slice(0, 10).forEach((w) => console.log('  -', w));
  if (warnings.length > 10) {
    console.log(`  ... và ${warnings.length - 10} cảnh báo khác.`);
  }
  console.log('');
}

if (errors.length > 0) {
  console.error(`❌ PHÁT HIỆN ${errors.length} LỖI KỸ THUẬT:`);
  errors.forEach((e) => console.error('  -', e));
  console.log('\nAudit thất bại! Vui lòng khắc phục các lỗi trên.');
  process.exit(1);
} else {
  console.log('✅ TOÀN BỘ DỮ LIỆU CÂU HỎI VÀ ĐÁP ÁN ĐẠT TIÊU CHUẨN 100%!');
  process.exit(0);
}
