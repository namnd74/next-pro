import type { InterviewCategory } from '../types';
import type { TechIconName } from '@/components/common/tech-icon';

export interface CategoryFilterItem {
  id: InterviewCategory;
  label: string;
  iconName?: TechIconName;
  activeColor: string;
}

export interface CategoryBadgeInfo {
  iconName?: TechIconName;
  label: string;
  className: string;
}

export const CATEGORY_ITEMS: CategoryFilterItem[] = [
  {
    id: 'all',
    label: 'Tất cả',
    iconName: 'all',
    activeColor: 'bg-primary text-primary-foreground shadow-sm',
  },
  {
    id: 'react',
    label: 'React',
    iconName: 'react',
    activeColor: 'bg-cyan-600 text-white shadow-xs shadow-cyan-600/20',
  },
  {
    id: 'nextjs',
    label: 'Next.js',
    iconName: 'nextjs',
    activeColor: 'bg-zinc-800 text-white shadow-xs dark:bg-zinc-200 dark:text-zinc-900',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    iconName: 'typescript',
    activeColor: 'bg-blue-600 text-white shadow-xs shadow-blue-600/20',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    iconName: 'javascript',
    activeColor: 'bg-amber-600 text-white shadow-xs shadow-amber-600/20',
  },
  {
    id: 'vue',
    label: 'Vue.js',
    iconName: 'vue',
    activeColor: 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20',
  },
  {
    id: 'angular',
    label: 'Angular',
    iconName: 'angular',
    activeColor: 'bg-red-600 text-white shadow-xs shadow-red-600/20',
  },
  {
    id: 'html',
    label: 'HTML5',
    iconName: 'html',
    activeColor: 'bg-orange-600 text-white shadow-sm shadow-orange-600/20',
  },
  {
    id: 'css',
    label: 'CSS3',
    iconName: 'css',
    activeColor: 'bg-sky-600 text-white shadow-sm shadow-sky-600/20',
  },
  {
    id: 'go',
    label: 'Go (Golang)',
    iconName: 'go',
    activeColor: 'bg-sky-600 text-white shadow-xs shadow-sky-600/20',
  },
  {
    id: 'nestjs',
    label: 'NestJS',
    iconName: 'nestjs',
    activeColor: 'bg-rose-600 text-white shadow-xs shadow-rose-600/20',
  },
  {
    id: 'nodejs',
    label: 'Node.js',
    iconName: 'nodejs',
    activeColor: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
  },
  {
    id: 'python',
    label: 'Python',
    iconName: 'python',
    activeColor: 'bg-yellow-600 text-white shadow-sm shadow-yellow-600/20',
  },
  {
    id: 'django',
    label: 'Django',
    iconName: 'django',
    activeColor: 'bg-teal-600 text-white shadow-sm shadow-teal-600/20',
  },
  {
    id: 'fastapi',
    label: 'FastAPI',
    iconName: 'fastapi',
    activeColor: 'bg-teal-600 text-white shadow-sm shadow-teal-600/20',
  },
  {
    id: 'java',
    label: 'Java',
    iconName: 'java',
    activeColor: 'bg-amber-700 text-white shadow-sm shadow-amber-700/20',
  },
  {
    id: 'spring',
    label: 'Spring Boot',
    iconName: 'spring',
    activeColor: 'bg-green-600 text-white shadow-sm shadow-green-600/20',
  },
  {
    id: 'csharp',
    label: 'C# (.NET)',
    iconName: 'csharp',
    activeColor: 'bg-purple-600 text-white shadow-sm shadow-purple-600/20',
  },
  {
    id: 'php',
    label: 'PHP',
    iconName: 'php',
    activeColor: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
  },
  {
    id: 'laravel',
    label: 'Laravel',
    iconName: 'laravel',
    activeColor: 'bg-rose-600 text-white shadow-sm shadow-rose-600/20',
  },
  {
    id: 'ruby',
    label: 'Ruby',
    iconName: 'ruby',
    activeColor: 'bg-red-600 text-white shadow-sm shadow-red-600/20',
  },
  {
    id: 'rails',
    label: 'Rails',
    iconName: 'rails',
    activeColor: 'bg-red-700 text-white shadow-sm shadow-red-700/20',
  },
  {
    id: 'cpp',
    label: 'C++',
    iconName: 'cpp',
    activeColor: 'bg-blue-700 text-white shadow-sm shadow-blue-700/20',
  },
  {
    id: 'rust',
    label: 'Rust',
    iconName: 'rust',
    activeColor: 'bg-orange-700 text-white shadow-sm shadow-orange-700/20',
  },
  {
    id: 'ios',
    label: 'iOS (Swift)',
    iconName: 'ios',
    activeColor: 'bg-orange-600 text-white shadow-sm shadow-orange-600/20',
  },
  {
    id: 'android',
    label: 'Android',
    iconName: 'android',
    activeColor: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
  },
  {
    id: 'flutter',
    label: 'Flutter',
    iconName: 'flutter',
    activeColor: 'bg-sky-500 text-white shadow-sm shadow-sky-500/20',
  },
  {
    id: 'react-native',
    label: 'React Native',
    iconName: 'react-native',
    activeColor: 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/20',
  },
  {
    id: 'system-design',
    label: 'System Design',
    iconName: 'architecture',
    activeColor: 'bg-rose-600 text-white shadow-sm shadow-rose-600/20',
  },
  {
    id: 'design-patterns',
    label: 'Design Patterns',
    iconName: 'design-patterns',
    activeColor: 'bg-violet-600 text-white shadow-sm shadow-violet-600/20',
  },
  {
    id: 'micro-frontend',
    label: 'Micro-Frontend',
    iconName: 'micro-frontend',
    activeColor: 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/20',
  },
  {
    id: 'ai',
    label: 'AI & LLM',
    iconName: 'ai',
    activeColor: 'bg-purple-600 text-white shadow-sm shadow-purple-600/20',
  },
  {
    id: 'database',
    label: 'Database',
    iconName: 'database',
    activeColor: 'bg-amber-600 text-white shadow-sm shadow-amber-600/20',
  },
  {
    id: 'devops-cloud',
    label: 'DevOps & Cloud',
    iconName: 'devops-cloud',
    activeColor: 'bg-sky-600 text-white shadow-sm shadow-sky-600/20',
  },
  {
    id: 'cs-fundamentals',
    label: 'CS Fundamentals',
    iconName: 'cs-fundamentals',
    activeColor: 'bg-slate-700 text-white shadow-sm shadow-slate-700/20',
  },
  {
    id: 'data-engineering',
    label: 'Data Engineering',
    iconName: 'data-engineering',
    activeColor: 'bg-teal-700 text-white shadow-sm shadow-teal-700/20',
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    iconName: 'cybersecurity',
    activeColor: 'bg-rose-700 text-white shadow-sm shadow-rose-700/20',
  },
  {
    id: 'dsa',
    label: 'DSA & Algorithms',
    iconName: 'dsa',
    activeColor: 'bg-indigo-700 text-white shadow-sm shadow-indigo-700/20',
  },
  {
    id: 'testing-qa',
    label: 'Testing & QA',
    iconName: 'testing-qa',
    activeColor: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
  },
  {
    id: 'business-analyst',
    label: 'Business Analyst',
    iconName: 'business-analyst',
    activeColor: 'bg-blue-600 text-white shadow-sm shadow-blue-600/20',
  },
  {
    id: 'behavioral-hr',
    label: 'Behavioral & STAR',
    iconName: 'behavioral-hr',
    activeColor: 'bg-pink-600 text-white shadow-sm shadow-pink-600/20',
  },
  {
    id: 'graphql',
    label: 'GraphQL',
    iconName: 'graphql',
    activeColor: 'bg-pink-600 text-white shadow-sm shadow-pink-600/20',
  },
  {
    id: 'state-management',
    label: 'State Management',
    iconName: 'state-management',
    activeColor: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
  },
  {
    id: 'performance',
    label: 'Web Performance',
    iconName: 'performance',
    activeColor: 'bg-lime-600 text-white shadow-sm shadow-lime-600/20',
  },
  {
    id: 'build-tools',
    label: 'Build Tools',
    iconName: 'build-tools',
    activeColor: 'bg-yellow-600 text-white shadow-sm shadow-yellow-600/20',
  },
  {
    id: 'seo',
    label: 'SEO',
    iconName: 'seo',
    activeColor: 'bg-teal-600 text-white shadow-sm shadow-teal-600/20',
  },
  {
    id: 'backend-api',
    label: 'Backend API',
    iconName: 'backend-api',
    activeColor: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
  },
  {
    id: 'shell-linux',
    label: 'Shell & Linux',
    iconName: 'shell-linux',
    activeColor: 'bg-zinc-700 text-white shadow-sm shadow-zinc-700/20',
  },
];

const CATEGORY_LOOKUP_MAP: Record<string, CategoryBadgeInfo> = {
  react: {
    iconName: 'react',
    label: 'React',
    className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25',
  },
  'react-19': {
    iconName: 'react',
    label: 'React 19',
    className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25 font-semibold',
  },
  nextjs: {
    iconName: 'nextjs',
    label: 'Next.js',
    className: 'bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/25 font-semibold',
  },
  'next-app-router': {
    iconName: 'nextjs',
    label: 'Next App Router',
    className: 'bg-zinc-500/10 text-zinc-900 dark:text-zinc-100 border-zinc-500/25 font-semibold',
  },
  typescript: {
    iconName: 'typescript',
    label: 'TypeScript',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
  },
  javascript: {
    iconName: 'javascript',
    label: 'JavaScript',
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/25',
  },
  go: {
    iconName: 'go',
    label: 'Go (Golang)',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25 font-semibold',
  },
  nestjs: {
    iconName: 'nestjs',
    label: 'NestJS',
    className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25 font-semibold',
  },
  nodejs: {
    iconName: 'nodejs',
    label: 'Node.js',
    className: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/25 font-semibold',
  },
  python: {
    iconName: 'python',
    label: 'Python',
    className: 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-500/25 font-semibold',
  },
  django: {
    iconName: 'django',
    label: 'Django',
    className: 'bg-teal-500/10 text-teal-800 dark:text-teal-400 border-teal-500/25 font-semibold',
  },
  'javascript-typescript': {
    iconName: 'typescript',
    label: 'JS / TS',
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/25',
  },
  'browser-runtime-workers': {
    iconName: 'browser-runtime-workers',
    label: 'Browser & Workers',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
  },
  'performance-optimization': {
    iconName: 'performance',
    label: 'Performance & Security',
    className: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/25',
  },
  html: {
    iconName: 'html',
    label: 'HTML5 & Web',
    className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/25 font-semibold',
  },
  css: {
    iconName: 'css',
    label: 'CSS3 & Styling',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25 font-semibold',
  },
  'design-patterns': {
    iconName: 'design-patterns',
    label: 'Design Patterns',
    className: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/25 font-semibold',
  },
  'micro-frontend': {
    iconName: 'micro-frontend',
    label: 'Micro-Frontend',
    className: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/25 font-semibold',
  },
  'system-design': {
    iconName: 'architecture',
    label: 'System Design',
    className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 font-semibold',
  },
  'frontend-system-design': {
    iconName: 'architecture',
    label: 'Frontend System Design',
    className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 font-semibold',
  },
  'state-data': {
    iconName: 'state-management',
    label: 'State Management',
    className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
  },
  'state-management': {
    iconName: 'state-management',
    label: 'State Management',
    className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
  },
  'business-analyst': {
    iconName: 'business-analyst',
    label: 'Business Analyst',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25 font-semibold',
  },
  ai: {
    iconName: 'ai',
    label: 'AI & LLM',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25 font-semibold',
  },
  database: {
    iconName: 'database',
    label: 'Database',
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25 font-semibold',
  },
  'devops-cloud': {
    iconName: 'devops-cloud',
    label: 'DevOps & Cloud',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25 font-semibold',
  },
  ios: {
    iconName: 'ios',
    label: 'iOS (Swift)',
    className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25 font-semibold',
  },
  'testing-qa': {
    iconName: 'testing-qa',
    label: 'Testing & QA',
    className: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25 font-semibold',
  },
  dsa: {
    iconName: 'dsa',
    label: 'DSA & Algorithms',
    className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 font-semibold',
  },
  'cs-fundamentals': {
    iconName: 'cs-fundamentals',
    label: 'CS Fundamentals',
    className: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25 font-semibold',
  },
  'data-engineering': {
    iconName: 'data-engineering',
    label: 'Data Engineering',
    className: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/25 font-semibold',
  },
  cybersecurity: {
    iconName: 'cybersecurity',
    label: 'Cybersecurity',
    className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 font-semibold',
  },
  'behavioral-hr': {
    iconName: 'behavioral-hr',
    label: 'Behavioral & STAR',
    className: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/25 font-semibold',
  },
  rust: {
    iconName: 'rust',
    label: 'Rust',
    className: 'bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/25 font-semibold',
  },
  'shell-linux': {
    iconName: 'shell-linux',
    label: 'Shell & Linux',
    className: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/25 font-semibold',
  },
  vue: {
    iconName: 'vue',
    label: 'Vue.js',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 font-semibold',
  },
  angular: {
    iconName: 'angular',
    label: 'Angular',
    className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25 font-semibold',
  },
  java: {
    iconName: 'java',
    label: 'Java',
    className: 'bg-amber-600/10 text-amber-800 dark:text-amber-400 border-amber-600/25 font-semibold',
  },
  spring: {
    iconName: 'spring',
    label: 'Spring Boot',
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/25 font-semibold',
  },
  csharp: {
    iconName: 'csharp',
    label: 'C# (.NET)',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25 font-semibold',
  },
  php: {
    iconName: 'php',
    label: 'PHP',
    className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25 font-semibold',
  },
  laravel: {
    iconName: 'laravel',
    label: 'Laravel',
    className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 font-semibold',
  },
  ruby: {
    iconName: 'ruby',
    label: 'Ruby',
    className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25 font-semibold',
  },
  rails: {
    iconName: 'rails',
    label: 'Rails',
    className: 'bg-red-600/10 text-red-800 dark:text-red-400 border-red-600/25 font-semibold',
  },
  cpp: {
    iconName: 'cpp',
    label: 'C++',
    className: 'bg-blue-600/10 text-blue-800 dark:text-blue-400 border-blue-600/25 font-semibold',
  },
  flutter: {
    iconName: 'flutter',
    label: 'Flutter',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25 font-semibold',
  },
  android: {
    iconName: 'android',
    label: 'Android',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 font-semibold',
  },
  'react-native': {
    iconName: 'react-native',
    label: 'React Native',
    className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25 font-semibold',
  },
  graphql: {
    iconName: 'graphql',
    label: 'GraphQL',
    className: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/25 font-semibold',
  },
  fastapi: {
    iconName: 'fastapi',
    label: 'FastAPI',
    className: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/25 font-semibold',
  },
  performance: {
    iconName: 'performance',
    label: 'Web Performance',
    className: 'bg-lime-500/10 text-lime-800 dark:text-lime-400 border-lime-500/25 font-semibold',
  },
  'build-tools': {
    iconName: 'build-tools',
    label: 'Build Tools',
    className: 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-500/25 font-semibold',
  },
  seo: {
    iconName: 'seo',
    label: 'SEO',
    className: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/25 font-semibold',
  },
  'backend-api': {
    iconName: 'backend-api',
    label: 'Backend API',
    className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25 font-semibold',
  },
  'frontend-core': {
    iconName: 'react',
    label: 'Frontend Core',
    className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25 font-semibold',
  },
  'backend-core': {
    iconName: 'nodejs',
    label: 'Backend Core',
    className: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/25 font-semibold',
  },
};

export function getCategoryBadge(category: string): CategoryBadgeInfo {
  const found = CATEGORY_LOOKUP_MAP[category];
  if (found) return found;

  return {
    iconName: undefined,
    label: category.toUpperCase(),
    className: 'bg-muted text-muted-foreground border-border/50',
  };
}
