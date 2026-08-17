---
name: learning-mastery
description: Accelerated learning engine using Mental Model Mapping, 80/20 Roadmap, Practical Labs, 3-Question 60s Micro-Quiz, and Progress Persistence.
---

# Skill: Learning & Mastery Engine

Accelerate technical skill acquisition through 4 core pillars:

## 1. Mental Model Mapping & Time-Bound 80/20 Roadmap (`ROADMAP.md` & `CHEATSHEET.md`)

- Ask for background and target duration/daily commitment when missing; infer from conversation when already clear.
- Compare new tech against background and tailor 80/20 pacing to available timeframe.
- Focus on the 20% syntax and core concepts used in 80% of real-world projects.
- Generate checkable `ROADMAP.md` and concise `CHEATSHEET.md`.

## 2. 3-Question 60s Rapid Blitz Quiz

- When the user asks to learn/practice or resumes a learning track, present a 3-question rapid quiz (20s/question):
  - Q1: Easy Syntax / Concept Recall.
  - Q2: Medium Code Snippet Output / Bug Spotting.
  - Q3: Hard Idiomatic Choice / Best Practice.
- Accept single-line answers (e.g. `1A 2B 3C`), evaluate immediately, and update `.agents/learning/<tech>/quiz-bank.md` only when workspace memory is available.

## 3. Challenge-Driven Labs (`labs/`)

- Assign progressive hands-on projects (Level 1: Basic CLI/Syntax, Level 2: API/State, Level 3: Architecture).
- Conduct senior peer code reviews focusing on idiomatic conventions.

## 4. State & Knowledge Persistence (`PROGRESS.md` & `knowledge-base.md`)

- Log active progress, mastered concepts, and personal weak spots in `PROGRESS.md` (< 40 lines).
- Save only reusable, verified snippets into `knowledge-base.md`; avoid storing secrets, private project data, or throwaway attempts.
