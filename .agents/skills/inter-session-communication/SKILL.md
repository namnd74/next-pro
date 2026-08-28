---
name: inter-session-communication
description: Multi-agent and inter-session orchestration protocol. Enables asynchronous message passing, distributed blackboard memory, subagent synchronization, and event-driven task delegation.
---

# Inter-Session Communication & Swarm Protocol

> Protocol for cross-session message exchange, blackboard state synchronization, and multi-agent coordination.

## Core Architecture

1. **Shared Blackboard Pattern**:
   - Central state repository stored in `.agents/local/SESSION_BUS.json` or Zustand reactive stores.
   - Sessions publish events (`EVENT_EMITTED`) and query state snapshots on demand.

2. **Point-to-Point Messaging (`send_message`)**:
   - Directed communication between parent agent and subagents using unique `conversationId`.
   - Message structure:
     ```json
     {
       "senderId": "agent-lead",
       "recipientId": "subagent-worker-01",
       "type": "DELEGATE_TASK | SYNC_STATE | HEARTBEAT | HANDOFF",
       "payload": { ... }
     }
     ```

3. **Reactive Wakeup & Event Loops**:
   - Avoid busy polling. Rely on message hooks and reactive triggers.
   - Parent agent remains idle or continues unrelated work until the background session delivers completed results.

4. **Multi-Session Lifecycle Rules**:
   - **Branch Isolation**: Subagents working on deep experiments use isolated workspaces (`share` or `branch`).
   - **Convergence**: Results are distilled and merged back into master state via atomic commits.
