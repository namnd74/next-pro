'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option...',
  className = '',
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = React.useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 320),
      });
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen, updateCoords]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation (Escape to close)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn('relative inline-block w-full', className)}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          'border-border bg-card text-foreground hover:bg-muted/70 hover:border-primary/50 focus:border-primary/60 focus:ring-primary/40 flex h-10 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-xs transition-all focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800/90',
          isOpen && 'border-primary ring-primary/40 ring-2'
        )}
      >
        <span
          className={cn('truncate text-left', !selectedOption && 'text-muted-foreground')}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'text-primary rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu rendered via React Portal directly onto document.body */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxWidth: '90vw',
              zIndex: 99999,
            }}
            className="animate-in fade-in-50 zoom-in-95 border-border bg-popover text-popover-foreground max-h-64 overflow-y-auto rounded-xl border p-1.5 opacity-100 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-950 dark:ring-white/10"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'text-foreground hover:bg-muted/80 hover:text-foreground relative flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors select-none disabled:pointer-events-none disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white',
                    isSelected &&
                      'bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 font-semibold'
                  )}
                >
                  <span className="flex-1 text-left leading-relaxed break-words whitespace-normal">
                    {option.label}
                  </span>
                  {isSelected && <Check className="text-primary ml-2 h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
