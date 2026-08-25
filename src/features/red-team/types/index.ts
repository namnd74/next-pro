export type SeverityLevel = 'critical' | 'high' | 'medium';

export type RedTeamDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Một vector tấn công trong collection Red Team.
 * `payloadCode`  : code "lỗi" / cách attacker khai thác.
 * `impactLog`    : các dòng terminal mô phỏng hậu quả khi launch attack.
 * `defenseCode`  : bản vá chuẩn enterprise.
 */
export interface AttackVector {
  id: string;
  /** Tên chiêu tấn công, ví dụ: "XSS Injection Strike" */
  name: string;
  severity: SeverityLevel;
  /** Nhóm kỹ thuật, ví dụ: "Injection", "Race Condition", "Info Disclosure" */
  category: string;
  /** Mục tiêu bị đánh, ví dụ: "Comment rendering pipeline" */
  target: string;
  /** Diễn biến câu chuyện: attacker làm gì, tại sao dangerous */
  story: string;
  payloadCode: string;
  /** Mô phỏng output terminal khi attack được kích hoạt */
  impactLog: string[];
  /** Hậu quả thực tế trong production */
  blastRadius: string[];
  defenseName: string;
  defenseCode: string;
  defenseTakeaway: string;
}

/** Id của một phase trong lộ trình Red Team (thứ tự học chuẩn) */
export type RtPhaseId =
  'phase-01' | 'phase-02' | 'phase-03' | 'phase-04' | 'phase-05' | 'phase-06';

/**
 * Một phase trong lộ trình Red Team — đơn vị tổ chức của roadmap.
 * Lộ trình là tài sản của feature RT, KHÔNG dẫn xuất từ /learn.
 */
export interface RtRoadmapPhase {
  id: RtPhaseId;
  /** Thứ tự học chuẩn, bắt đầu từ 1 */
  order: number;
  title: string;
  /** Nhãn tiếng Anh ngắn (phong cách ops) */
  subtitle: string;
  tagline: string;
  iconName: string;
  /** Gradient Tailwind cho header phase */
  color: string;
}

/** Một khái niệm trong tài liệu học tập của collection */
export interface DossierConcept {
  term: string;
  definition: string;
}

/** Một bước trong playbook tấn công (tài liệu học) */
export interface DossierPlaybookStep {
  title: string;
  detail: string;
}

/**
 * Tài liệu học tập riêng của Red Team ("học liệu") — lý thuyết nền để hiểu
 * và thực hành collection này mà KHÔNG cần đi đâu khác.
 */
export interface StudyDossier {
  /** Thời gian đọc ước tính */
  readingTimeMinutes: number;
  /** Sau khi học xong, học viên làm được gì */
  objectives: string[];
  concepts: DossierConcept[];
  /** Các bước tấn công chuẩn của domain này */
  attackerPlaybook: DossierPlaybookStep[];
  /** Nguyên tắc phòng thủ đúc kết */
  defensePrinciples: string[];
}

/**
 * Một collection Red Team — chủ đề tấn công thuộc quyền của feature RT.
 * `slug` là namespace RIÊNG của Red Team, tổ chức theo `phaseId` của lộ trình.
 */
export interface RedTeamCollection {
  id: string;
  /** Slug owned bởi Red Team — dùng cho route /rt/[collectionSlug] */
  slug: string;
  /** Phase của lộ trình RT mà collection này thuộc về */
  phaseId: RtPhaseId;
  /** Thứ tự trong phase (bắt đầu từ 1) */
  orderInPhase: number;
  title: string;
  tagline: string;
  missionBriefing: string;
  difficulty: RedTeamDifficulty;
  /** Icon hiển thị ở sidebar (tên trong lucide map của sidebar) */
  iconName: string;
  /** Gradient Tailwind làm màu nhận diện, ví dụ 'from-emerald-500 to-teal-600' */
  color?: string;
  /** Học liệu độc lập — lý thuyết nền của collection này */
  dossier?: StudyDossier;
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
 * Mission Red Team — một chiến dịch tấn công sâu, gắn với 1+ vector
 * trong CÙNG collection.
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
  /** Vector ids trong collection này mà mission khai thác */
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

/**
 * Toàn bộ nội dung một collection trong MỘT file JSON:
 * metadata + học liệu + vectors + missions (không còn tách 2 file).
 */
export interface RedTeamCollectionFile extends RedTeamCollection {
  missions: RedTeamMission[];
}

export const SEVERITY_META: Record<
  SeverityLevel,
  {
    label: string;
    badgeVariant: 'destructive' | 'warning' | 'info';
    ring: string;
    text: string;
  }
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
