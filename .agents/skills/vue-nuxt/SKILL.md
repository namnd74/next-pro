---
name: vue-nuxt
description: Expert guidelines for Vue 3 Composition API, Script Setup, Nuxt 3 auto-imports, Pinia, and SSR.
---

# Skill: Vue 3 & Nuxt 3 Expert

## 0. Context & App Shape

- Inspect `nuxt.config.*`, `package.json`, `pages/`, `app/`, `components/`, stores, and existing composables before editing.
- Match established Nuxt modules, auto-import conventions, and SSR/SPA mode.

## 1. Composition API & Script Setup

- Use `<script setup lang="ts">` for all Vue components.
- Prefer `ref()` for primitives and explicit object reassignments; use `reactive()` selectively.
- Keep composables side-effect-light and return typed state/actions.

## 2. Nuxt 3 Conventions

- Leverage Nuxt auto-imports (`useFetch`, `useAsyncData`, `useState`, `navigateTo`).
- Place global state in `stores/` using Pinia with Composition API syntax.
- Use `server/api/` for SSR API endpoints.
- Avoid hydration mismatches: gate browser-only APIs behind `process.client`, `onMounted`, or `.client` plugins/components.
