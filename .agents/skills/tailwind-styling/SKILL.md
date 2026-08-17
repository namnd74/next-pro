---
name: tailwind-styling
description: Expert guidelines for TailwindCSS, responsive design, dark mode, design tokens, and smooth UI animations.
---

# Skill: TailwindCSS & Modern Styling Expert

## 0. Context & Design System

- Inspect `tailwind.config.*`, global CSS, component library, tokens, and existing class merge helpers before styling.
- Match established spacing, radius, typography, and color semantics instead of introducing a new visual language.

## 1. Design System & Tokens

- Prefer semantic color tokens (e.g., `bg-background`, `text-foreground`, `border-border`) over arbitrary values; use arbitrary utilities only for intentional one-off constraints.
- Ensure dark mode compatibility using `dark:` variants.
- Keep focus, hover, disabled, loading, and error states accessible.

## 2. Responsive & Dynamic Layouts

- Mobile-first approach: Write default utility classes for mobile, then `md:`, `lg:` for desktop layouts.
- Use `clsx` or `tailwind-merge` (`cn()` helper) for conditional class merges.
- Prevent layout shift with stable dimensions for images, grids, toolbars, cards, and dynamic labels.
