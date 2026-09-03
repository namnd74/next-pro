import type { WebContainerGuardResult } from './types';

/**
 * Checks whether the current browser runtime environment supports WebContainers.
 * WebContainers require SharedArrayBuffer and Cross-Origin Isolation (COOP/COEP headers).
 */
export function checkWebContainerSupport(): WebContainerGuardResult {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      reason: 'SERVER_UNSUPPORTED',
      message: 'WebContainer chỉ có thể chạy trên trình duyệt client-side.',
    };
  }

  // 1. Check window.crossOriginIsolated
  if (!window.crossOriginIsolated) {
    return {
      supported: false,
      reason: 'MISSING_HEADERS',
      message:
        'Trình duyệt chưa bật chế độ Cross-Origin Isolation (cần header Cross-Origin-Opener-Policy & Cross-Origin-Embedder-Policy).',
    };
  }

  // 2. Check SharedArrayBuffer
  if (typeof SharedArrayBuffer === 'undefined') {
    return {
      supported: false,
      reason: 'UNSUPPORTED_BROWSER',
      message:
        'Trình duyệt của bạn không hỗ trợ SharedArrayBuffer cho WebAssembly đa luồng.',
    };
  }

  return { supported: true };
}
