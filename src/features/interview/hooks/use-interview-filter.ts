'use client';

import * as React from 'react';
import type { InterviewCategory, InterviewQuestion } from '../types';
import { useInterviewStore } from '../stores/use-interview-store';
import { MOCK_INTERVIEW_QUESTIONS } from '../data/mock-interview-bank';
import { STATIC_CATEGORY_COUNTS, loadCategoryQuestions } from '../data/json-loader';
import type { FilterChipItem } from '@/components/shared';

export interface UseInterviewFilterReturn {
  selectedCategory: InterviewCategory;
  setSelectedCategory: React.Dispatch<React.SetStateAction<InterviewCategory>>;
  selectedLevel: string;
  setSelectedLevel: React.Dispatch<React.SetStateAction<string>>;
  onlyBookmarked: boolean;
  setOnlyBookmarked: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isPendingSearch: boolean;
  isLoadingCategory: boolean;
  allQuestions: InterviewQuestion[];
  categoryCounts: Record<string, number>;
  levelCounts: { all: number; junior: number; middle: number; senior: number };
  levelFilterItems: FilterChipItem[];
  filteredQuestions: InterviewQuestion[];
  bookmarkedQuestionIds: string[];
}

export function useInterviewFilter(): UseInterviewFilterReturn {
  const { bookmarkedQuestionIds, customQuestions } = useInterviewStore();

  const [selectedCategory, setSelectedCategory] =
    React.useState<InterviewCategory>('all');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const isPendingSearch = searchQuery !== deferredSearchQuery;

  const [loadedQuestions, setLoadedQuestions] = React.useState<InterviewQuestion[]>(
    MOCK_INTERVIEW_QUESTIONS
  );
  const [isLoadingCategory, setIsLoadingCategory] = React.useState(false);

  // Load domain question bank on-demand when user selects a category
  React.useEffect(() => {
    if (selectedCategory === 'all') return;
    let active = true;
    setIsLoadingCategory(true);

    loadCategoryQuestions(selectedCategory)
      .then((questions) => {
        if (!active || !questions || questions.length === 0) return;
        setLoadedQuestions((prev) => {
          const existingIds = new Set(prev.map((q) => q.id));
          const toAdd = questions.filter((q) => !existingIds.has(q.id));
          if (toAdd.length === 0) return prev;
          return [...prev, ...toAdd];
        });
      })
      .finally(() => {
        if (active) setIsLoadingCategory(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory]);

  const allQuestions = React.useMemo(() => {
    const map = new Map<string, InterviewQuestion>();
    for (const q of loadedQuestions) map.set(q.id, q);
    for (const q of customQuestions) map.set(q.id, q);
    return Array.from(map.values());
  }, [loadedQuestions, customQuestions]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { ...STATIC_CATEGORY_COUNTS };
    for (const q of customQuestions) {
      counts.all = (counts.all || 0) + 1;
      counts[q.category] = (counts[q.category] || 0) + 1;
    }
    return counts;
  }, [customQuestions]);

  const matchesCategory = React.useCallback(
    (q: InterviewQuestion, category: InterviewCategory): boolean => {
      if (category === 'all') return true;
      if (category === 'react')
        return q.category === 'react' || q.category === 'react-19';
      if (category === 'nextjs')
        return q.category === 'nextjs' || q.category === 'next-app-router';
      if (category === 'typescript')
        return q.category === 'typescript' || q.category === 'javascript-typescript';
      if (category === 'javascript')
        return (
          q.category === 'javascript' ||
          q.category === 'javascript-typescript' ||
          q.category === 'browser-runtime-workers'
        );
      if (category === 'system-design')
        return q.category === 'system-design' || q.category === 'frontend-system-design';
      if (category === 'backend-api')
        return q.category === 'backend-api' || q.category === 'backend-core';
      if (category === 'performance')
        return q.category === 'performance' || q.category === 'performance-optimization';
      if (category === 'testing-qa')
        return q.category === 'testing-qa' || (q.category as string) === 'qa-testing';
      return q.category === category;
    },
    []
  );

  const levelCounts = React.useMemo(() => {
    const langSubset = allQuestions.filter((q) => matchesCategory(q, selectedCategory));

    return {
      all: langSubset.length,
      junior: langSubset.filter((q) => q.level === 'junior').length,
      middle: langSubset.filter((q) => q.level === 'middle').length,
      senior: langSubset.filter((q) => q.level === 'senior').length,
    };
  }, [allQuestions, selectedCategory, matchesCategory]);

  const levelFilterItems: FilterChipItem[] = React.useMemo(
    () => [
      { id: 'all', label: 'Tất cả', count: levelCounts.all },
      {
        id: 'junior',
        label: '🟢 Cơ bản (Junior)',
        count: levelCounts.junior,
        activeColorClass: 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20',
      },
      {
        id: 'middle',
        label: '🟡 Trung bình (Middle)',
        count: levelCounts.middle,
        activeColorClass: 'bg-amber-600 text-white shadow-xs shadow-amber-600/20',
      },
      {
        id: 'senior',
        label: '🔴 Nâng cao (Senior)',
        count: levelCounts.senior,
        activeColorClass: 'bg-rose-600 text-white shadow-xs shadow-rose-600/20',
      },
    ],
    [levelCounts]
  );

  const filteredQuestions = React.useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const bookmarkSet = onlyBookmarked ? new Set(bookmarkedQuestionIds) : null;

    return allQuestions.filter((q) => {
      const matchCategory = matchesCategory(q, selectedCategory);
      const matchLevel = selectedLevel === 'all' || q.level === selectedLevel;
      const matchBookmark = !bookmarkSet || bookmarkSet.has(q.id);

      const matchSearch =
        !query ||
        q.question.toLowerCase().includes(query) ||
        q.interviewerIntent.toLowerCase().includes(query) ||
        q.seniorAnswer.summary.toLowerCase().includes(query) ||
        q.expectedKeywords.some((kw) => kw.toLowerCase().includes(query));

      return matchCategory && matchLevel && matchBookmark && matchSearch;
    });
  }, [
    allQuestions,
    selectedCategory,
    selectedLevel,
    onlyBookmarked,
    deferredSearchQuery,
    bookmarkedQuestionIds,
    matchesCategory,
  ]);

  return {
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
    onlyBookmarked,
    setOnlyBookmarked,
    searchQuery,
    setSearchQuery,
    isPendingSearch,
    isLoadingCategory,
    allQuestions,
    categoryCounts,
    levelCounts,
    levelFilterItems,
    filteredQuestions,
    bookmarkedQuestionIds,
  };
}
