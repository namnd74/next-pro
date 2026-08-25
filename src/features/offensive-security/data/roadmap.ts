import type { OffensiveSecurityPhaseId, OffensiveSecurityRoadmapPhase } from '../types';

/**
 * PRACTICE RANGE ROADMAP — lộ trình lab cũ thuộc Offensive Security Academy.
 * Thiết kế theo năng lực red-team thật (không dẫn xuất từ bất kỳ feature nào khác):
 * học tư duy → đánh injection → đánh danh tính → đánh race/logic → đánh hạ tầng
 * → total defense capstone. Thứ tự phase = thứ tự học khuyến nghị.
 */
export const OFFENSIVE_SECURITY_ROADMAP: OffensiveSecurityRoadmapPhase[] = [
  {
    id: 'phase-01',
    order: 1,
    title: 'Tư duy & Trinh sát',
    subtitle: 'Mindset & Recon',
    tagline:
      'Nhìn app bằng mắt attacker: đọc bundle, moi secret, vẽ bản đồ mục tiêu trước khi bắn phát đầu tiên.',
    iconName: 'Radar',
    color: 'from-slate-500 to-slate-700',
  },
  {
    id: 'phase-02',
    order: 2,
    title: 'Injection & Thực thi mã',
    subtitle: 'Injection & XSS',
    tagline:
      'Bắn payload vào đúng nơi app tin dữ liệu đầu vào: stored/DOM XSS, prototype pollution và hàng loạt biến thể chèn script.',
    iconName: 'Syringe',
    color: 'from-red-500 to-orange-600',
  },
  {
    id: 'phase-03',
    order: 3,
    title: 'Danh tính & Phiên làm việc',
    subtitle: 'Identity & Session',
    tagline:
      'Đánh cắp token, giả mạo hành động user, lừa click trong iframe — phá vỡ câu trả lời "bạn là ai, bạn được phép làm gì".',
    iconName: 'KeyRound',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'phase-04',
    order: 4,
    title: 'Race · Logic · State',
    subtitle: 'Race, Logic & State',
    tagline:
      'Khai thác thời gian, tham nhũng trạng thái, lách validation và đầu độc cache — những đòn không để lại stack trace.',
    iconName: 'Timer',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'phase-05',
    order: 5,
    title: 'Hạ tầng & Chuỗi cung ứng',
    subtitle: 'Infra & Supply Chain',
    tagline:
      'Drain tài nguyên, đè bẹp render pipeline và đầu độc dependencies — tấn công nơi app chạy thay vì code của app.',
    iconName: 'Boxes',
    color: 'from-amber-500 to-rose-600',
  },
  {
    id: 'phase-06',
    order: 6,
    title: 'Capstone: Phòng thủ toàn diện',
    subtitle: 'Blue Team Capstone',
    tagline:
      'Đảo ngược vai trò: tự tay bịt từng đường tấn công đã học, xây detection và chứng minh hàng phòng thủ chịu được chính mình.',
    iconName: 'ShieldCheck',
    color: 'from-emerald-500 to-teal-600',
  },
];

export function getPhaseById(
  id: OffensiveSecurityPhaseId
): OffensiveSecurityRoadmapPhase | undefined {
  return OFFENSIVE_SECURITY_ROADMAP.find((phase) => phase.id === id);
}

/** Các phase sắp xếp theo thứ tự học */
export const OFFENSIVE_SECURITY_PHASES_ORDERED: OffensiveSecurityRoadmapPhase[] = [
  ...OFFENSIVE_SECURITY_ROADMAP,
].sort((a, b) => a.order - b.order);
