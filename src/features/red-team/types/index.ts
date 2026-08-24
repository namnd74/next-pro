export type SeverityLevel = 'critical' | 'high' | 'medium';

export type RedTeamDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Một vector tấn công trong kịch bản Red Team của một track.
 * `payloadCode`  : code "lỗi" / cách attacker khai thác.
 * `impactLog`    : các dòng terminal mô phỏng hậu quả khi launch attack.
 * `defenseCode`  : bản vá chuẩn enterprise.
 */
export interface AttackVector {
  id: string;
  /** Tên chiêu tấn công, ví dụ: "XSS Injection Strike" */
  name: string;
  severity: SeverityLevel;
  /** Nhóm kỹ thuật, ví dụ: "Injection", "Race Condition", "Memory Leak" */
  category: string;
  /** Mục tiêu bị đánh, ví dụ: "Comment rendering pipeline" */
  target: string;
  /** Diễn biến câu chuyện: attacker làm gì, tại sao dangerous */
  story: string;
  /**
   * Lesson ids mà vector này gắn liền (phục vụ tab Practice trong lesson view).
   * Không có / rỗng → vector chỉ hiển thị ở topic console.
   */
  relatedLessons?: string[];
  payloadCode: string;
  /** Mô phỏng output terminal khi attack được kích hoạt */
  impactLog: string[];
  /** Hậu quả thực tế trong production */
  blastRadius: string[];
  defenseName: string;
  defenseCode: string;
  defenseTakeaway: string;
}

/**
 * Kịch bản Red Team cho một learning track (map qua `trackSlug`).
 */
export interface RedTeamScenario {
  id: string;
  /** Trùng với `slug` của LearningTrack tương ứng */
  trackSlug: string;
  title: string;
  tagline: string;
  missionBriefing: string;
  difficulty: RedTeamDifficulty;
  vectors: AttackVector[];
}

/** Một bước trong kill chain của mission */
export interface MissionKillStep {
  title: string;
  detail: string;
  code?: string;
}

/** Câu hỏi tổng kết sau mission (debrief) */
export interface MissionDebrief {
  question: string;
  answer: string;
}

/**
 * "Bài học" riêng của Red Team — một chiến dịch tấn công sâu
 * (không mượn lesson từ /learn). Mỗi mission gắn với 1+ vector.
 */
export interface RedTeamMission {
  id: string; // 'ws-mis-01'
  slug: string; // 'stored-xss-session-heist'
  title: string;
  summary: string;
  /** Mục tiêu chiến dịch: attacker muốn đạt được gì */
  objective: string;
  difficulty: RedTeamDifficulty;
  estimatedMinutes: number;
  /** Vector ids trong scenario cùng track mà mission này khai thác */
  vectorIds: string[];
  /** Lý thuyết sâu: nguyên nhân gốc khiến lỗ hổng tồn tại */
  rootCause: string;
  /** Attacker thu thập/đánh giá gì trước khi đánh */
  reconNotes: string[];
  killChain: MissionKillStep[];
  /** Checklist phòng chống sau khi hiểu lỗ hổng */
  hardeningChecklist: string[];
  debrief: MissionDebrief[];
}

export const SEVERITY_META: Record<
  SeverityLevel,
  { label: string; badgeVariant: 'destructive' | 'warning' | 'info'; ring: string; text: string }
> = {
  critical: {
    label: 'CRITICAL',
    badgeVariant: 'destructive',
    ring: 'border-destructive/40',
    text: 'text-destructive',
  },
  high: {
    label: 'HIGH',
    badgeVariant: 'warning',
    ring: 'border-amber-500/40',
    text: 'text-amber-600 dark:text-amber-400',
  },
  medium: {
    label: 'MEDIUM',
    badgeVariant: 'info',
    ring: 'border-sky-500/40',
    text: 'text-sky-600 dark:text-sky-400',
  },
};
