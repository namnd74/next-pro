'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  className?: string;
}

const MAX_WIDTH_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const ModalDialog = React.memo(function ModalDialog({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
  className,
}: ModalDialogProps) {
  // Handle Escape key to close
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="animate-in fade-in fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'border-border bg-card relative max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl border p-4 text-left shadow-2xl transition-all sm:p-6',
          'animate-in fade-in zoom-in-95 duration-150',
          MAX_WIDTH_MAP[maxWidth] ?? 'max-w-lg',
          className
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-lg p-1.5 transition-colors active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {(title || icon || description) && (
          <div className="mb-5 space-y-1.5 pr-6">
            <div className="flex items-center gap-2">
              {icon && <span className="shrink-0">{icon}</span>}
              {title && (
                <h2 className="text-foreground text-lg font-bold tracking-tight break-words sm:text-xl">
                  {title}
                </h2>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground text-xs leading-relaxed break-words">
                {description}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
});
