'use client';

import * as React from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { InterviewQuestion } from '../types';
import { QuestionCard } from './question-card';
import { ArrowUp } from 'lucide-react';

interface VirtualQuestionListProps {
  questions: InterviewQuestion[];
  overscan?: number;
  estimatedItemHeight?: number;
}

// 195px closely matches real collapsed question card height (prevents measurement shift)
const DEFAULT_ESTIMATED_HEIGHT = 195;
// Overscan 12 items pre-renders ~2,500px in advance to eliminate fast-scroll jitter
const DEFAULT_OVERSCAN = 12;

export function VirtualQuestionList({
  questions,
  overscan = DEFAULT_OVERSCAN,
  estimatedItemHeight = DEFAULT_ESTIMATED_HEIGHT,
}: VirtualQuestionListProps) {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollMargin, setScrollMargin] = React.useState(0);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  // Persistent expanded state across virtual unmounts
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  const toggleExpand = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Measure true absolute offset from top of document (rect.top + window.scrollY)
  const updateScrollMargin = React.useCallback(() => {
    if (listRef.current) {
      const rect = listRef.current.getBoundingClientRect();
      const docTop = Math.round(rect.top + window.scrollY);
      setScrollMargin(docTop);
    }
  }, []);

  React.useEffect(() => {
    updateScrollMargin();

    const handleScrollAndResize = () => {
      setShowScrollTop(window.scrollY > 400);
      updateScrollMargin();
    };

    window.addEventListener('scroll', handleScrollAndResize, { passive: true });
    window.addEventListener('resize', handleScrollAndResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, [updateScrollMargin]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // TanStack Window Virtualizer configuration
  const rowVirtualizer = useWindowVirtualizer({
    count: questions.length,
    estimateSize: React.useCallback(
      (index: number) => {
        const q = questions[index];
        if (q && expandedIds.has(q.id)) {
          return 650; // Accurate estimation for expanded accordion
        }
        return estimatedItemHeight;
      },
      [questions, expandedIds, estimatedItemHeight]
    ),
    overscan,
    scrollMargin,
    gap: 16, // 16px gap between questions (matches space-y-4)
    getItemKey: React.useCallback(
      (index: number) => questions[index]?.id ?? index,
      [questions]
    ),
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="space-y-4">
      {/* Outer Virtual Container */}
      <div ref={listRef} className="w-full">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const question = questions[virtualRow.index];
            if (!question) return null;

            const isExpanded = expandedIds.has(question.id);

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${
                    virtualRow.start - rowVirtualizer.options.scrollMargin
                  }px)`,
                  contain: 'layout paint',
                  willChange: 'transform',
                }}
              >
                <QuestionCard
                  question={question}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleExpand(question.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Scroll-to-Top Button (Symbol only) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
          className="border-primary/30 bg-background/85 text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary/40 animate-in fade-in zoom-in fixed right-6 bottom-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
