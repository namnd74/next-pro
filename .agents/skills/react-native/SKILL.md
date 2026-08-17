---
name: react-native
description: Expert guidelines for React Native, Expo, mobile performance, navigation, and native modules.
---

# Skill: React Native & Expo Expert

## 0. Context & App Shape

- Inspect `app.json`, `app.config.*`, navigation files, state management, and native module usage before changing structure.
- Match Expo managed/bare workflow and existing Router/React Navigation conventions.

## 1. Mobile Performance

- Use `FlashList` over `FlatList` for long data lists.
- Optimize images using `expo-image` with caching support.
- Avoid anonymous inline objects in props to prevent unnecessary renders.
- Keep animations on the UI thread with Reanimated when gesture/scroll performance matters.

## 2. Architecture & Native Code

- Use Expo Router for new Expo apps; preserve React Navigation if already established.
- Platform-specific code should use `.ios.ts` and `.android.ts` file extensions rather than inline runtime checks.
- Handle safe areas, keyboard avoidance, offline/loading/error states, and accessibility labels for touch targets.
