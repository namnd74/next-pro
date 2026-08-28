import type { AcademyLesson } from '../academy/types';
import type {
  HttpRequestState,
  SqlDatabase,
  WorkbenchConfig,
  WorkbenchMode,
  WorkbenchObjective,
} from './types';
import { createDefaultVfs } from './engines/virtual-posix-engine';
import { createDefaultSqlDatabase } from './engines/sql-injection-engine';
import { createDefaultHttpRequest } from './engines/http-packet-engine';

export const generateWorkbenchConfigFromLesson = (
  lesson: AcademyLesson
): WorkbenchConfig => {
  const lessonId = lesson.id;
  const slug = lesson.slug;
  const isNetwork =
    lessonId.startsWith('os01-') ||
    lessonId.startsWith('os06-') ||
    lesson.domains.includes('network');
  const isLinux =
    lessonId.startsWith('os02-') ||
    lessonId.startsWith('os04-') ||
    lesson.domains.includes('linux');
  const isWindows =
    lessonId.startsWith('os03-') ||
    lessonId.startsWith('os08-') ||
    lesson.domains.includes('windows') ||
    lesson.domains.includes('active-directory');
  const isWeb =
    lessonId.startsWith('os07-') ||
    lessonId.startsWith('os05-') ||
    lesson.domains.includes('web-api') ||
    lesson.domains.includes('application-security');

  // Determine optimal Workbench Mode based on specific lesson content
  let mode: WorkbenchMode = 'terminal';
  let availableModes: WorkbenchMode[] = ['terminal'];

  if (isWeb) {
    if (slug.includes('sql') || slug.includes('injection') || slug.includes('database')) {
      mode = 'sql';
      availableModes = ['sql', 'terminal'];
    } else {
      mode = 'http';
      availableModes = ['http', 'terminal'];
    }
  } else if (isNetwork) {
    if (
      slug.includes('packet') ||
      slug.includes('transport') ||
      slug.includes('dns') ||
      slug.includes('tls')
    ) {
      mode = 'packet';
      availableModes = ['packet', 'terminal'];
    } else if (
      lessonId.startsWith('os06-') ||
      slug.includes('discovery') ||
      slug.includes('movement') ||
      slug.includes('network') ||
      slug.includes('scan')
    ) {
      mode = 'cyber-range';
      availableModes = ['cyber-range', 'terminal'];
    } else {
      mode = 'terminal';
      availableModes = ['terminal'];
    }
  } else {
    mode = 'terminal';
    availableModes = ['terminal'];
  }

  // Synthesize Instructions
  const instructions: string[] = [];
  if (lesson.transferChallenge?.tasks && lesson.transferChallenge.tasks.length > 0) {
    lesson.transferChallenge.tasks.forEach((task, idx) => {
      instructions.push(`${idx + 1}. ${task}`);
    });
  } else if (lesson.lab?.constraints && lesson.lab.constraints.length > 0) {
    lesson.lab.constraints.forEach((constraint, idx) => {
      instructions.push(`${idx + 1}. ${constraint}`);
    });
  } else {
    instructions.push('1. Khảo sát môi trường và cấu hình hệ thống.');
    instructions.push('2. Thực hiện thao tác kỹ thuật theo yêu cầu bài học.');
    instructions.push('3. Trích xuất evidence và kiểm chứng tính an toàn.');
  }

  // Synthesize Sample Commands based on topic & keywords
  const sampleCommands: string[] = [];
  if (isLinux) {
    sampleCommands.push('ls -la', 'id', 'uname -a', 'cat /etc/passwd | cut -d: -f1');
    if (slug.includes('permission') || slug.includes('identity')) {
      sampleCommands.push(
        'ls -l /etc/shadow',
        'chmod 640 /etc/shadow',
        'find / -perm -4000 2>/dev/null'
      );
    } else if (slug.includes('process') || slug.includes('service')) {
      sampleCommands.push('ps aux', 'kill -9 2310', 'cat /var/log/auth.log | tail -n 5');
    } else if (
      slug.includes('script') ||
      slug.includes('pipeline') ||
      slug.includes('awk')
    ) {
      sampleCommands.push(
        "cat /var/log/access.log | grep 401 | awk '{print $1}'",
        'cat /var/log/access.log | wc -l'
      );
    }
  } else if (isNetwork) {
    sampleCommands.push(
      'ifconfig',
      'ping -c 3 10.0.4.1',
      'nmap 10.0.4.1',
      'curl -I http://10.0.4.1'
    );
    if (slug.includes('dns'))
      sampleCommands.push('dig +short gateway.corp.internal', 'cat /etc/hosts');
  } else if (isWindows) {
    sampleCommands.push('whoami /all', 'id', 'uname -a', 'cat /etc/os-release');
  } else {
    sampleCommands.push('ls -la', 'cat /home/operator/notes.txt', 'id');
  }

  // Synthesize Sample Payloads for Web/HTTP/SQL
  const samplePayloads: string[] = [];
  if (isWeb || mode === 'sql' || mode === 'http') {
    samplePayloads.push(
      "' OR 1=1 --",
      "' UNION SELECT id, username, password_hash, role, email FROM users --",
      'X-Forwarded-For: 127.0.0.1',
      'Authorization: Bearer token_audit_probe'
    );
  }

  // Synthesize Initial VFS with topic-specific files
  const initialVfs = createDefaultVfs();
  const operatorDir =
    initialVfs.children.home?.type === 'dir'
      ? initialVfs.children.home.children.operator
      : null;

  if (operatorDir && operatorDir.type === 'dir') {
    // Add bespoke lesson challenge notes
    operatorDir.children['challenge_brief.md'] = {
      type: 'file',
      name: 'challenge_brief.md',
      content:
        `# ${lesson.title}\n\n` +
        `**Mục tiêu**: ${lesson.lab.objective}\n\n` +
        `**Bối cảnh**: ${lesson.lab.scenario}\n\n` +
        `**Nhiệm vụ cần thực hiện**:\n` +
        instructions.map((ins) => `* ${ins}`).join('\n') +
        `\n\n**Evidence cần thu thập**:\n` +
        (lesson.transferChallenge?.requiredEvidence || lesson.lab.evidenceTemplate || [])
          .map((e) => `* ${e}`)
          .join('\n') +
        '\n',
      mode: 0o644,
      owner: 'operator',
      group: 'operator',
      size: 512,
      mtime: new Date().toISOString(),
    };

    // Specific domain injections
    if (slug.includes('permission')) {
      if (
        initialVfs.children.etc?.type === 'dir' &&
        initialVfs.children.etc.children.shadow
      ) {
        initialVfs.children.etc.children.shadow.mode = 0o666; // Insecure for hardening
      }
    }
  }

  // Synthesize Objectives from transfer challenge tasks
  const objectives: WorkbenchObjective[] = [];
  const tasks = lesson.transferChallenge?.tasks || [];

  if (tasks.length > 0) {
    tasks.forEach((task, idx) => {
      objectives.push({
        id: `obj-${lesson.id}-task-${idx + 1}`,
        title: task.length > 60 ? `${task.substring(0, 57)}...` : task,
        description: task,
        hint: `Thực hiện lệnh tương ứng với: ${task.split(';')[0]}`,
        isComplete: ({ lastCommand, lastResult, vfs, lastSqlResult, lastHttpRes }) => {
          if (idx === 0) {
            if (lastCommand && lastCommand.length > 0) return true;
            if (lastSqlResult && lastSqlResult.success) return true;
            if (lastHttpRes) return true;
            return false;
          }
          if (idx === 1) {
            if (lastResult && lastResult.exitCode === 0) return true;
            if (lastSqlResult && lastSqlResult.rowCount > 0) return true;
            if (lastHttpRes && lastHttpRes.statusCode === 200) return true;
            return false;
          }
          if (vfs) {
            const hasHistory = vfs.history.length >= 2;
            return hasHistory;
          }
          return false;
        },
      });
    });
  } else {
    objectives.push(
      {
        id: `obj-${lesson.id}-1`,
        title: 'Khảo sát môi trường và chạy lệnh kiểm tra',
        description: `Thực hiện khảo sát cho chủ đề: ${lesson.title}`,
        hint: 'Gõ lệnh `ls -la` hoặc `cat /home/operator/challenge_brief.md`',
        isComplete: ({ lastCommand }) => !!lastCommand && lastCommand.length > 0,
      },
      {
        id: `obj-${lesson.id}-2`,
        title: 'Thực thi quy trình kỹ thuật đạt kết quả hợp lệ',
        description: 'Hoàn thành tác vụ với mã thoát exit code 0.',
        hint: 'Chạy lệnh tương ứng với bài học (ví dụ chmod, grep, nmap hoặc truy vấn)',
        isComplete: ({ lastResult, lastSqlResult, lastHttpRes }) =>
          (!!lastResult && lastResult.exitCode === 0) ||
          (!!lastSqlResult && lastSqlResult.success) ||
          (!!lastHttpRes && lastHttpRes.statusCode === 200),
      }
    );
  }

  // Initial DB and HTTP State
  const initialSqlDb: SqlDatabase = createDefaultSqlDatabase();
  const initialHttpRequest: HttpRequestState = createDefaultHttpRequest();

  return {
    id: `${lesson.id}-live-workbench`,
    lessonId: lesson.id,
    title: `Phòng thực hành: ${lesson.title}`,
    summary: lesson.lab.objective || lesson.summary,
    mode,
    availableModes,
    instructions,
    initialVfs,
    initialSqlDb,
    initialHttpRequest,
    sampleCommands,
    samplePayloads,
    objectives,
  };
};
