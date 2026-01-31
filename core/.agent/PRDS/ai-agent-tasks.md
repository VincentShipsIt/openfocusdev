# PRD: AI Agent Task System — Human + AI Collaboration

**Status:** Draft
**Priority:** Critical
**Created:** 2026-01-31
**Author:** Vincent (via Blaise)

---

## Vision

Transform the Todoist clone from a human-only task manager into an **AI-first collaboration platform** where AI agents and humans are equal task participants. AI agents autonomously work on tasks, create new tasks, and escalate to humans when takeover is needed.

**Tagline:** "Your AI team member that actually gets shit done"

## Core Concept: Two Types of Task Owners

| | Human Tasks | AI Agent Tasks |
|---|---|---|
| **Assigned to** | Human user | AI agent (Claude, GPT, custom) |
| **Execution** | Manual by human | Autonomous by AI |
| **Created by** | Human or AI | Human or AI |
| **Status flow** | Backlog → In Progress → Done | Queued → Processing → Review → Done |
| **Handoff** | Human can delegate to AI | AI creates human task when blocked |

## Key Flows

### 1. AI Agent Autonomous Execution
- User creates task: "Research competitors for GenFeed"
- Assigns to AI agent
- AI agent picks it up, executes, posts results as task comments
- Marks complete or escalates

### 2. AI-to-Human Handoff (Takeover)
- AI agent is working on "Write blog post about AI trends"
- AI hits a decision point: "Should we focus on enterprise or indie devs?"
- AI **creates a new human task**: "Decision needed: Blog post audience — enterprise vs indie"
- Links it as a blocker to the original AI task
- Human decides → AI resumes

### 3. Human-to-AI Delegation
- Human has task: "Organize my inbox emails"
- Human clicks "Delegate to AI" → selects agent
- AI takes over, processes, reports back

### 4. AI Task Generation
- AI analyzes project state and **proactively creates tasks**
- Example: AI notices a deadline approaching → creates subtasks to break it down
- Example: AI reviews completed work → creates follow-up tasks

## Use Cases

### Professional (Pro)
- **Project management** — AI agent handles research, drafts, data tasks
- **Code tasks** — AI writes code, creates PR, human reviews
- **Content pipeline** — AI drafts, human approves, AI publishes
- **Email/comms** — AI drafts responses, human sends
- **Meeting prep** — AI creates agenda, research briefs, action items

### Personal (Perso)
- **Daily planning** — AI reviews your day, suggests priorities, creates subtasks
- **Habit tracking** — AI monitors patterns, creates nudge tasks
- **Life admin** — AI handles research tasks (apartments, travel, shopping)
- **Learning** — AI creates study plans, tracks progress, adjusts difficulty
- **Health** — AI creates meal prep tasks, workout schedules

## Data Model Extensions

### Task Schema (extended)
```typescript
interface Task {
  // Existing fields...
  
  // New: Agent collaboration
  assigneeType: 'human' | 'agent';
  assignedAgent?: {
    id: string;
    name: string;
    provider: 'claude' | 'openai' | 'custom';
    model?: string;
  };
  
  // New: Task relationships
  parentTaskId?: string;        // Subtask of
  blockedBy?: string[];         // Blocked by these task IDs
  blocking?: string[];          // Blocking these task IDs
  delegatedFrom?: string;       // Was delegated from this task
  handoffReason?: string;       // Why AI created this for human
  
  // New: Agent execution
  agentStatus?: 'queued' | 'processing' | 'waiting_human' | 'completed' | 'failed';
  agentLogs?: AgentLog[];       // Execution history
  agentContext?: Record<string, any>; // Context passed to agent
  
  // New: Category
  realm: 'professional' | 'personal' | 'both';
}

interface AgentLog {
  timestamp: Date;
  action: string;
  details: string;
  tokensUsed?: number;
  cost?: number;
}
```

### Agent Configuration
```typescript
interface AgentConfig {
  id: string;
  name: string;
  provider: 'claude' | 'openai' | 'custom';
  model: string;
  apiKey: string;              // Encrypted
  systemPrompt?: string;
  capabilities: string[];      // ['research', 'writing', 'coding', 'analysis']
  maxConcurrentTasks: number;
  costLimitDaily: number;      // USD
  autoAssignRules?: AutoAssignRule[];
}
```

## UI/UX Concepts

### Task Views
- **My Tasks** — Human's tasks only
- **AI Working** — Tasks AI agents are processing (live status)
- **Needs My Input** — AI-created tasks waiting for human decision
- **All Tasks** — Combined view with filters

### Task Card Enhancements
- 🤖 Agent badge on AI-assigned tasks
- 🔄 Live status indicator when AI is processing
- ⚠️ "Needs your input" badge for handoff tasks
- 💰 Cost tracker for AI task execution
- 📎 Agent work log expandable section

### Agent Dashboard
- Active agents and their current tasks
- Daily/weekly cost breakdown
- Task completion rates (human vs AI)
- Handoff frequency and reasons

## OSS Core vs SaaS Split

### Core (OSS — free)
- Human task management (full Todoist clone)
- Single AI agent integration (bring your own API key)
- Basic human ↔ AI task handoff
- Self-hosted

### Cloud (SaaS — paid)
- Multiple AI agents with different specializations
- Advanced auto-assignment rules
- Team collaboration (multiple humans + agents)
- Managed AI agents (no API key needed)
- Analytics dashboard
- Priority queue for AI execution
- Integrations (Slack, email, calendar, GitHub)

## Success Metrics

- [ ] AI agent can pick up and execute a task autonomously
- [ ] AI agent can create a human task when blocked
- [ ] Human can delegate a task to AI with one click
- [ ] Pro and personal task separation with realm filter
- [ ] Agent execution logs visible on task
- [ ] Cost tracking per task and per agent
- [ ] At least 3 agent capabilities: research, writing, analysis

## Competitive Edge

No task manager does this today:
- **Todoist** — Human only, basic AI for natural language input
- **Linear** — Dev-focused, no AI execution
- **Notion** — AI assists writing, doesn't own tasks
- **KaibanBoard** — Dev-only, agent task board (our own project, dev-focused)

**TaskFlow** = The first task manager where AI is a team member, not a feature.
