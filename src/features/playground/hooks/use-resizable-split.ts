'use client';

import * as React from 'react';

interface UseResizableSplitOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  bodyRef: React.RefObject<HTMLDivElement | null>;
  isHorizontal: boolean;
  onResize?: () => void;
  defaultSplit?: number;
  defaultSidebarWidth?: number;
}

export function useResizableSplit({
  containerRef,
  bodyRef,
  isHorizontal,
  onResize,
  defaultSplit = 50,
  defaultSidebarWidth = 220,
}: UseResizableSplitOptions) {
  const [splitPercent, setSplitPercent] = React.useState<number>(defaultSplit);
  const [isDraggingSplit, setIsDraggingSplit] = React.useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = React.useState<number>(defaultSidebarWidth);
  const [isDraggingSidebar, setIsDraggingSidebar] = React.useState<boolean>(false);
  const [isNarrowViewport, setIsNarrowViewport] = React.useState(false);

  // Responsive mobile viewport listener
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncViewport = () => setIsNarrowViewport(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  // Sidebar drag handler
  React.useEffect(() => {
    if (!isDraggingSidebar) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const offset = e.clientX - rect.left - 44; // 44px activity bar
      setSidebarWidth(Math.min(Math.max(offset, 160), 450));
    };

    const handlePointerUp = () => {
      setIsDraggingSidebar(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSidebar, bodyRef]);

  // Main split (Editor vs Preview/Terminal) drag handler
  React.useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isHorizontal) {
        const offset = e.clientX - rect.left;
        const newPercent = (offset / rect.width) * 100;
        setSplitPercent(Math.min(Math.max(newPercent, 20), 80));
      } else {
        const offset = e.clientY - rect.top;
        const newPercent = (offset / rect.height) * 100;
        setSplitPercent(Math.min(Math.max(newPercent, 20), 80));
      }

      onResize?.();
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
      onResize?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit, isHorizontal, containerRef, onResize]);

  const effectiveHorizontal = isHorizontal && !isNarrowViewport;

  return {
    splitPercent,
    setSplitPercent,
    isDraggingSplit,
    setIsDraggingSplit,
    sidebarWidth,
    setSidebarWidth,
    isDraggingSidebar,
    setIsDraggingSidebar,
    isNarrowViewport,
    effectiveHorizontal,
  };
}
