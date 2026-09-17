import * as React from 'react';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TechIconName =
  | 'react'
  | 'react-19'
  | 'nextjs'
  | 'next-app-router'
  | 'typescript'
  | 'javascript'
  | 'javascript-typescript'
  | 'go'
  | 'nestjs'
  | 'nodejs'
  | 'python'
  | 'django'
  | 'architecture'
  | 'frontend-system-design'
  | string;

interface TechIconProps {
  name: TechIconName;
  className?: string;
}

export function TechIcon({ name, className = 'h-3.5 w-3.5' }: TechIconProps) {
  const normalized = name.toLowerCase().trim();

  switch (normalized) {
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

    case 'architecture':
    case 'frontend-system-design':
    default:
      return <Layers className={cn('shrink-0', className)} />;
  }
}
