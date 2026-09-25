import * as React from 'react';
import {
  Layers,
  Sparkles,
  Database,
  Cloud,
  Cpu,
  Network,
  Workflow,
  ShieldCheck,
  CheckCheck,
  Briefcase,
  Users,
  Boxes,
  Gauge,
  Wrench,
  SearchCheck,
  Webhook,
  Terminal,
  Globe,
  LayoutTemplate,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TechIconName =
  | 'all'
  | 'react'
  | 'react-19'
  | 'nextjs'
  | 'next-app-router'
  | 'typescript'
  | 'javascript'
  | 'javascript-typescript'
  | 'vue'
  | 'angular'
  | 'html'
  | 'html5'
  | 'css'
  | 'css3'
  | 'go'
  | 'golang'
  | 'nestjs'
  | 'nodejs'
  | 'node'
  | 'python'
  | 'django'
  | 'fastapi'
  | 'java'
  | 'spring'
  | 'csharp'
  | 'php'
  | 'laravel'
  | 'ruby'
  | 'rails'
  | 'cpp'
  | 'rust'
  | 'ios'
  | 'android'
  | 'flutter'
  | 'react-native'
  | 'graphql'
  | 'ai'
  | 'llm'
  | 'database'
  | 'devops-cloud'
  | 'devops'
  | 'cs-fundamentals'
  | 'dsa'
  | 'data-engineering'
  | 'cybersecurity'
  | 'testing-qa'
  | 'business-analyst'
  | 'behavioral-hr'
  | 'state-management'
  | 'state-data'
  | 'performance'
  | 'performance-optimization'
  | 'build-tools'
  | 'seo'
  | 'backend-api'
  | 'shell-linux'
  | 'browser-runtime-workers'
  | 'frontend-core'
  | 'backend-core'
  | 'design-patterns'
  | 'micro-frontend'
  | 'architecture'
  | 'frontend-system-design'
  | 'system-design'
  | string;

interface TechIconProps {
  name: TechIconName;
  className?: string;
}

export function TechIcon({ name, className = 'h-3.5 w-3.5' }: TechIconProps) {
  const normalized = name.toLowerCase().trim();

  switch (normalized) {
    case 'all':
      return <Globe className={cn('text-primary shrink-0', className)} />;

    case 'react':
    case 'react-19':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <circle cx="12" cy="12" r="2.2" fill="#00d8ff" />
          <g stroke="#00d8ff" strokeWidth="1.3">
            <ellipse cx="12" cy="12" rx="10" ry="4.2" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
          </g>
        </svg>
      );

    case 'nextjs':
    case 'next-app-router':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn('shrink-0', className)}
        >
          <circle cx="12" cy="12" r="11" fill="currentColor" />
          <path
            d="M14.9 16.5L9.6 9.2H8v8h1.4v-5.6l4.7 6.4a10.2 10.2 0 0 0 .8-1.5zm.3-1.4V9.2h1.4v4.3a10.4 10.4 0 0 0-1.4 1.6z"
            fill="#090d16"
          />
        </svg>
      );

    case 'typescript':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#3178C6" />
          <text
            x="4"
            y="16.5"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11"
            fontWeight="800"
          >
            TS
          </text>
        </svg>
      );

    case 'javascript':
    case 'javascript-typescript':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#F7DF1E" />
          <text
            x="5"
            y="16.5"
            fill="#000"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11"
            fontWeight="800"
          >
            JS
          </text>
        </svg>
      );

    case 'vue':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path d="M2 3h4.2l5.8 10 5.8-10H22L12 21 2 3z" fill="#42b883" />
          <path d="M6.2 3h3.8L12 6.5 14 3h3.8L12 13.5 6.2 3z" fill="#35495e" />
        </svg>
      );

    case 'angular':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path d="M12 2L2 5.5l1.6 12.5L12 22l8.4-4L22 5.5 12 2z" fill="#DD0031" />
          <path d="M12 2v20l8.4-4L22 5.5 12 2z" fill="#C3002F" />
          <path
            d="M12 5.5L7.2 16.5h2.1l1-2.5h3.4l1 2.5h2.1L12 5.5zm1.1 7h-2.2L12 9.2l1.1 3.3z"
            fill="#fff"
          />
        </svg>
      );

    case 'html':
    case 'html5':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path d="M3 2l1.7 18.5L12 23l7.3-2.5L21 2H3z" fill="#E34F26" />
          <path d="M12 3.8v17.3l5.8-2 1.4-15.3H12z" fill="#EF652A" />
          <path
            d="M7 6.5h10l-.3 3.3H10.5l.3 3.2h6.1l-.7 7.2-4.2 1.2-4.2-1.2-.3-3.2h2.2l.1 1.6 2.2.6 2.2-.6.2-2.7H7.3L7 6.5z"
            fill="#fff"
          />
        </svg>
      );

    case 'css':
    case 'css3':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path d="M3 2l1.7 18.5L12 23l7.3-2.5L21 2H3z" fill="#1572B6" />
          <path d="M12 3.8v17.3l5.8-2 1.4-15.3H12z" fill="#33A9DC" />
          <path
            d="M17 6.5H7l.3 3.3h9.4l-.4 3.2H7.6l.3 3.2h8.2l-.7 6.2-4.1 1.1-4.1-1.1-.3-2.6H4.6l.4 4.8L12 22l7-2 1-13.5H17z"
            fill="#fff"
          />
        </svg>
      );

    case 'go':
    case 'golang':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#00ADD8" />
          <text
            x="3.5"
            y="16.5"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11"
            fontWeight="900"
            fontStyle="italic"
          >
            GO
          </text>
        </svg>
      );

    case 'nestjs':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path
            d="M12.9 2.2a.8.8 0 0 0-1 .3l-2.6 4.6a.8.8 0 0 1-.7.4H5.3a.8.8 0 0 0-.7 1.2l2.6 4.5a.8.8 0 0 1 .1.8l-2.6 4.5a.8.8 0 0 0 .7 1.2h3.3a.8.8 0 0 1 .7.4l2.6 4.6c.3.4.9.4 1.1 0l4.3-7.5a.8.8 0 0 0 0-.8l-4.3-7.5a.8.8 0 0 1 0-.8l2.6-4.6a.8.8 0 0 0-.8-1.2h-1.9Z"
            fill="#E0234E"
          />
        </svg>
      );

    case 'nodejs':
    case 'node':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path d="M12 2l9 5.2v10.4l-9 5.2-9-5.2V7.2L12 2z" fill="#539E43" />
          <path
            d="M8.5 15.5c0 .8.6 1.5 1.5 1.5h1.5v-1.5h-1.5v-2h1.5V12h-3v3.5zm4-3.5v5h1.5v-2h1c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5h-2.5zm1.5 1.5h1c.3 0 .5.2.5.5s-.2.5-.5.5h-1v-1z"
            fill="white"
          />
        </svg>
      );

    case 'python':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path
            d="M11.9 2C8.6 2 8.8 3.4 8.8 3.4l.01 1.5h3.1v.5H5.9s-2 .2-2 3.1c0 2.9 1.8 3 1.8 3h1.1v-1.6s-.1-1.8 1.8-1.8h3.2s1.7 0 1.7-1.7V3.7S15.4 2 11.9 2zm-1.8 1.2a.65.65 0 1 1 0 1.3.65.65 0 0 1 0-1.3z"
            fill="#387EB8"
          />
          <path
            d="M12.1 22c3.3 0 3.1-1.4 3.1-1.4l-.01-1.5h-3.1v-.5h6s2-.2 2-3.1c0-2.9-1.8-3-1.8-3h-1.1v1.6s.1 1.8-1.8 1.8H12.3s-1.7 0-1.7 1.7v2.8S8.6 22 12.1 22zm1.8-1.2a.65.65 0 1 1 0-1.3.65.65 0 0 1 0 1.3z"
            fill="#FFE052"
          />
        </svg>
      );

    case 'django':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#092E20" />
          <text
            x="5"
            y="16.5"
            fill="#44B78B"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="12"
            fontWeight="800"
          >
            dj
          </text>
        </svg>
      );

    case 'fastapi':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <circle cx="12" cy="12" r="10" fill="#009688" />
          <path d="M13.5 4L7 13h5l-1.5 7L17 11h-5l1.5-7z" fill="white" />
        </svg>
      );

    case 'java':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#5382A1" />
          <text
            x="3.5"
            y="16"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="9"
            fontWeight="900"
          >
            JAVA
          </text>
        </svg>
      );

    case 'spring':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <circle cx="12" cy="12" r="10" fill="#6DB33F" />
          <path
            d="M6 14.5c2 4 8 3.5 11 1.5 2-1.5 2.5-4.5 1.5-6.5-1.5-3-5.5-4-8.5-4-3 0-5 2-5.5 4.5 1.5-1 3.5-1 5 .2s1.5 3 0 4.3z"
            fill="white"
          />
        </svg>
      );

    case 'csharp':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#68217A" />
          <text
            x="3.5"
            y="16.5"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11"
            fontWeight="800"
          >
            C#
          </text>
        </svg>
      );

    case 'php':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#777BB4" />
          <text
            x="3"
            y="16"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="9"
            fontWeight="900"
          >
            PHP
          </text>
        </svg>
      );

    case 'laravel':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#FF2D20" />
          <path
            d="M6 7l5-3 5 3v6l-5 3-5-3V7z"
            stroke="white"
            strokeWidth="1.6"
            fill="none"
          />
          <path d="M11 4v12" stroke="white" strokeWidth="1.6" />
        </svg>
      );

    case 'ruby':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="#CC342D" />
          <path
            d="M6 3l4 6-8 0 4-6zm12 0l-4 6 8 0-4-6zm-8 6l2 12-8-12h6zm4 0l-2 12 8-12h-6z"
            fill="#FF8080"
            opacity="0.6"
          />
        </svg>
      );

    case 'rails':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#D30001" />
          <text
            x="2.5"
            y="15.5"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="7"
            fontWeight="900"
          >
            RAILS
          </text>
        </svg>
      );

    case 'cpp':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#00599C" />
          <text
            x="2.5"
            y="16.5"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="9"
            fontWeight="800"
          >
            C++
          </text>
        </svg>
      );

    case 'rust':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect width="24" height="24" rx="4" fill="#000000" />
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="#DEA584"
            strokeWidth="1.8"
            strokeDasharray="3 1"
          />
          <text
            x="8"
            y="16"
            fill="#DEA584"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11"
            fontWeight="900"
          >
            R
          </text>
        </svg>
      );

    case 'ios':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn('shrink-0', className)}
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.92.04-2.02.61-2.67 1.38-.58.67-1.09 1.76-.95 2.81 1.03.08 2.06-.51 2.68-1.26z" />
        </svg>
      );

    case 'android':
      return (
        <svg viewBox="0 0 24 24" fill="#3DDC84" className={cn('shrink-0', className)}>
          <path d="M6 14h12v5H6z" />
          <path d="M6 12a6 6 0 0 1 12 0H6z" />
          <circle cx="9" cy="9.5" r="0.8" fill="white" />
          <circle cx="15" cy="9.5" r="0.8" fill="white" />
          <line
            x1="7.5"
            y1="5.5"
            x2="6.5"
            y2="3.5"
            stroke="#3DDC84"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="16.5"
            y1="5.5"
            x2="17.5"
            y2="3.5"
            stroke="#3DDC84"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'flutter':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <path d="M14 2L4 12l3.2 3.2L19.5 2H14z" fill="#02569B" />
          <path d="M14 13.5l-5.5 5.5 5.5 5.5h5.5l-5.5-5.5 5.5-5.5H14z" fill="#0175C2" />
          <path d="M11.2 16.3l2.8 2.8-2.8 2.8-2.8-2.8 2.8-2.8z" fill="#29B6F6" />
        </svg>
      );

    case 'react-native':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <rect
            x="5"
            y="2"
            width="14"
            height="20"
            rx="3"
            stroke="#00d8ff"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="11" r="1.5" fill="#00d8ff" />
          <ellipse
            cx="12"
            cy="11"
            rx="5"
            ry="2"
            stroke="#00d8ff"
            strokeWidth="1"
            transform="rotate(30 12 11)"
          />
          <ellipse
            cx="12"
            cy="11"
            rx="5"
            ry="2"
            stroke="#00d8ff"
            strokeWidth="1"
            transform="rotate(-30 12 11)"
          />
        </svg>
      );

    case 'graphql':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)}>
          <circle cx="12" cy="3.5" r="1.8" fill="#E10098" />
          <circle cx="19.5" cy="8" r="1.8" fill="#E10098" />
          <circle cx="19.5" cy="16" r="1.8" fill="#E10098" />
          <circle cx="12" cy="20.5" r="1.8" fill="#E10098" />
          <circle cx="4.5" cy="16" r="1.8" fill="#E10098" />
          <circle cx="4.5" cy="8" r="1.8" fill="#E10098" />
          <path
            d="M12 3.5l7.5 4.5v8L12 20.5 4.5 16V8L12 3.5z"
            stroke="#E10098"
            strokeWidth="1.2"
          />
          <path d="M12 3.5L19.5 16H4.5L12 3.5z" stroke="#E10098" strokeWidth="1.2" />
        </svg>
      );

    case 'ai':
    case 'llm':
      return <Sparkles className={cn('shrink-0 text-purple-400', className)} />;

    case 'database':
      return <Database className={cn('shrink-0 text-amber-500', className)} />;

    case 'devops-cloud':
    case 'devops':
    case 'cloud':
      return <Cloud className={cn('shrink-0 text-sky-400', className)} />;

    case 'cs-fundamentals':
    case 'cs':
      return <Cpu className={cn('shrink-0 text-slate-400', className)} />;

    case 'dsa':
      return <Network className={cn('shrink-0 text-indigo-400', className)} />;

    case 'data-engineering':
      return <Workflow className={cn('shrink-0 text-teal-400', className)} />;

    case 'cybersecurity':
      return <ShieldCheck className={cn('shrink-0 text-rose-500', className)} />;

    case 'testing-qa':
    case 'qa':
    case 'testing':
      return <CheckCheck className={cn('shrink-0 text-emerald-400', className)} />;

    case 'business-analyst':
    case 'ba':
      return <Briefcase className={cn('shrink-0 text-blue-400', className)} />;

    case 'behavioral-hr':
    case 'hr':
      return <Users className={cn('shrink-0 text-pink-400', className)} />;

    case 'state-management':
    case 'state-data':
      return <Boxes className={cn('shrink-0 text-indigo-400', className)} />;

    case 'performance':
    case 'performance-optimization':
      return <Gauge className={cn('shrink-0 text-lime-500', className)} />;

    case 'build-tools':
      return <Wrench className={cn('shrink-0 text-yellow-500', className)} />;

    case 'seo':
      return <SearchCheck className={cn('shrink-0 text-teal-400', className)} />;

    case 'backend-api':
      return <Webhook className={cn('shrink-0 text-indigo-400', className)} />;

    case 'shell-linux':
      return <Terminal className={cn('shrink-0 text-zinc-400', className)} />;

    case 'browser-runtime-workers':
    case 'browser':
      return <Globe className={cn('shrink-0 text-purple-400', className)} />;

    case 'frontend-core':
      return <LayoutTemplate className={cn('shrink-0 text-cyan-400', className)} />;

    case 'backend-core':
      return <Server className={cn('shrink-0 text-emerald-400', className)} />;

    case 'design-patterns':
      return <Boxes className={cn('shrink-0 text-violet-400', className)} />;

    case 'micro-frontend':
      return <Layers className={cn('shrink-0 text-fuchsia-400', className)} />;

    case 'architecture':
    case 'frontend-system-design':
    case 'system-design':
    default:
      return <Layers className={cn('shrink-0', className)} />;
  }
}
