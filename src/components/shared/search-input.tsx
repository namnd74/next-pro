'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  isPending?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      isPending = false,
      onClear,
      placeholder = 'Tìm kiếm...',
      containerClassName,
      className,
      ...props
    },
    ref
  ) {
    const handleClear = React.useCallback(() => {
      onChange('');
      onClear?.();
    }, [onChange, onClear]);

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
          {isPending ? (
            <Loader2 className="text-primary h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2 pr-9 pl-9 text-xs transition-colors focus:ring-2 focus:outline-hidden',
            className
          )}
          {...props}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-0.5 transition-colors active:scale-90"
            aria-label="Xóa nội dung tìm kiếm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);
