# Task Workflow: TaskFlow MVP Implementation

**PRD Reference:** PRD-TASKFLOW-MVP.md
**Date:** 2026-01-02

---

## Implementation Order

Execute tasks in this order to minimize dependencies and maximize testability.

---

## Phase 1: Web App - Core UX Improvements

### Task 1.1: Inline Task Editing
**Priority:** P0 | **Estimate:** Medium

**Files to modify:**
- `apps/web/components/task-item.tsx` - Add inline edit mode
- `apps/web/components/task-list.tsx` - Handle edit state

**Requirements:**
- [ ] Click task title enters edit mode
- [ ] Input replaces text, focused automatically
- [ ] Enter key saves changes
- [ ] Escape key cancels edit
- [ ] Click outside saves changes
- [ ] Loading state while saving

**Test files:**
- `apps/web/components/__tests__/task-item.test.tsx`

---

### Task 1.2: Quick Add Task Input
**Priority:** P0 | **Estimate:** Medium

**Files to create:**
- `apps/web/components/quick-add-task.tsx`

**Files to modify:**
- `apps/web/app/(app)/today/page.tsx`
- `apps/web/app/(app)/inbox/page.tsx`
- `apps/web/app/(app)/projects/[id]/page.tsx`

**Requirements:**
- [ ] Inline input at top of task list
- [ ] Placeholder: "Add a task..."
- [ ] Enter submits task
- [ ] Escape clears input
- [ ] Auto-assigns current context (project, today's date)
- [ ] Input clears after submit
- [ ] Focus remains for continuous entry

**Test files:**
- `apps/web/components/__tests__/quick-add-task.test.tsx`

---

### Task 1.3: Projects in Sidebar
**Priority:** P0 | **Estimate:** Medium

**Files to modify:**
- `apps/web/components/layout.tsx` - Add projects list
- `apps/web/components/project-form.tsx` - Inline create option

**Files to create:**
- `apps/web/components/sidebar-projects.tsx`

**Requirements:**
- [ ] Projects section in sidebar below navigation
- [ ] Each project shows: color dot, name, task count
- [ ] Click navigates to project view
- [ ] "Add project" button opens inline input or modal
- [ ] Active project highlighted
- [ ] Collapsible projects section

**Test files:**
- `apps/web/components/__tests__/sidebar-projects.test.tsx`

---

### Task 1.4: Task Completion UX
**Priority:** P1 | **Estimate:** Small

**Files to modify:**
- `apps/web/components/task-item.tsx`

**Requirements:**
- [ ] Smooth checkbox animation
- [ ] Brief delay before removing from list (500ms)
- [ ] Strikethrough animation
- [ ] Toast with undo option

**Test files:**
- `apps/web/components/__tests__/task-item.test.tsx` (extend)

---

## Phase 2: Mobile App - Full Implementation

### Task 2.1: API Client Setup
**Priority:** P0 | **Estimate:** Small

**Files to create:**
- `apps/mobile/lib/api.ts`
- `apps/mobile/lib/auth.ts`

**Requirements:**
- [ ] Mirror web API client structure
- [ ] Use Clerk Expo SDK for auth tokens
- [ ] Error handling with user feedback

**Test files:**
- `apps/mobile/lib/__tests__/api.test.ts`

---

### Task 2.2: Task List Component
**Priority:** P0 | **Estimate:** Medium

**Files to create:**
- `apps/mobile/components/task-list.tsx`
- `apps/mobile/components/task-item.tsx`

**Requirements:**
- [ ] FlatList with task items
- [ ] Checkbox for completion
- [ ] Swipe right to complete
- [ ] Swipe left to delete
- [ ] Tap to edit (opens modal)
- [ ] Pull to refresh

**Test files:**
- `apps/mobile/components/__tests__/task-list.test.tsx`
- `apps/mobile/components/__tests__/task-item.test.tsx`

---

### Task 2.3: Task Form Modal
**Priority:** P0 | **Estimate:** Medium

**Files to create:**
- `apps/mobile/components/task-form.tsx`

**Requirements:**
- [ ] Modal presentation
- [ ] Title input (required)
- [ ] Description input
- [ ] Project picker
- [ ] Date picker
- [ ] Priority picker
- [ ] Save/Cancel buttons

**Test files:**
- `apps/mobile/components/__tests__/task-form.test.tsx`

---

### Task 2.4: Inbox Screen
**Priority:** P0 | **Estimate:** Small

**Files to modify:**
- `apps/mobile/app/(tabs)/inbox.tsx`

**Requirements:**
- [ ] Fetch tasks without projectId
- [ ] Display task list component
- [ ] FAB for new task
- [ ] Empty state

**Test files:**
- `apps/mobile/app/(tabs)/__tests__/inbox.test.tsx`

---

### Task 2.5: Today Screen
**Priority:** P0 | **Estimate:** Small

**Files to modify:**
- `apps/mobile/app/(tabs)/index.tsx`

**Requirements:**
- [ ] Fetch tasks due today
- [ ] Show overdue tasks section
- [ ] Display task list component
- [ ] FAB for new task (pre-fill today)

**Test files:**
- `apps/mobile/app/(tabs)/__tests__/index.test.tsx`

---

### Task 2.6: Upcoming Screen
**Priority:** P1 | **Estimate:** Medium

**Files to modify:**
- `apps/mobile/app/(tabs)/upcoming.tsx`

**Requirements:**
- [ ] Fetch tasks with future due dates
- [ ] Group by date (Today, Tomorrow, This Week, Later)
- [ ] Section headers
- [ ] Display task list component

**Test files:**
- `apps/mobile/app/(tabs)/__tests__/upcoming.test.tsx`

---

### Task 2.7: Projects Screen
**Priority:** P1 | **Estimate:** Medium

**Files to modify:**
- `apps/mobile/app/(tabs)/projects.tsx`

**Files to create:**
- `apps/mobile/app/project/[id].tsx`
- `apps/mobile/components/project-list.tsx`
- `apps/mobile/components/project-form.tsx`

**Requirements:**
- [ ] List all projects with colors
- [ ] Tap to view project tasks
- [ ] FAB for new project
- [ ] Project detail view with tasks

**Test files:**
- `apps/mobile/app/(tabs)/__tests__/projects.test.tsx`
- `apps/mobile/components/__tests__/project-list.test.tsx`

---

### Task 2.8: History Screen
**Priority:** P2 | **Estimate:** Small

**Files to modify:**
- `apps/mobile/app/(tabs)/history.tsx`

**Requirements:**
- [ ] Fetch completed tasks
- [ ] Date filter (optional)
- [ ] Display task list (read-only)

**Test files:**
- `apps/mobile/app/(tabs)/__tests__/history.test.tsx`

---

### Task 2.9: Tab Icons
**Priority:** P1 | **Estimate:** Small

**Files to modify:**
- `apps/mobile/app/(tabs)/_layout.tsx`

**Requirements:**
- [ ] Install @expo/vector-icons
- [ ] Add proper icons for each tab
- [ ] Badge count on Today/Inbox

---

## Phase 3: Testing

### Task 3.1: Web Unit Tests
**Priority:** P0 | **Estimate:** Large

**Test files to create:**
- `apps/web/components/__tests__/task-item.test.tsx`
- `apps/web/components/__tests__/task-list.test.tsx`
- `apps/web/components/__tests__/task-form.test.tsx`
- `apps/web/components/__tests__/quick-add-task.test.tsx`
- `apps/web/components/__tests__/sidebar-projects.test.tsx`
- `apps/web/components/__tests__/layout.test.tsx`
- `apps/web/components/__tests__/kanban-board.test.tsx`
- `apps/web/lib/__tests__/api.test.ts`

**Coverage target:** 80%+

---

### Task 3.2: Web E2E Tests
**Priority:** P0 | **Estimate:** Large

**Test files to create/modify:**
- `apps/web/e2e/auth.spec.ts`
- `apps/web/e2e/tasks.spec.ts`
- `apps/web/e2e/projects.spec.ts`
- `apps/web/e2e/views.spec.ts`

**Scenarios:**
- [ ] Complete authentication flow
- [ ] Create task via quick add
- [ ] Create task via modal
- [ ] Edit task inline
- [ ] Complete/uncomplete task
- [ ] Delete task
- [ ] Create/edit/delete project
- [ ] Navigate all views
- [ ] Sidebar project navigation

---

### Task 3.3: API Unit Tests
**Priority:** P0 | **Estimate:** Medium

**Test files to create:**
- `apps/api/src/tasks/__tests__/tasks.service.spec.ts`
- `apps/api/src/tasks/__tests__/tasks.controller.spec.ts`
- `apps/api/src/projects/__tests__/projects.service.spec.ts`
- `apps/api/src/projects/__tests__/projects.controller.spec.ts`

**Coverage target:** 80%+

---

### Task 3.4: Mobile Unit Tests
**Priority:** P1 | **Estimate:** Medium

**Test files to create:**
- `apps/mobile/components/__tests__/task-list.test.tsx`
- `apps/mobile/components/__tests__/task-item.test.tsx`
- `apps/mobile/components/__tests__/task-form.test.tsx`
- `apps/mobile/lib/__tests__/api.test.ts`

**Coverage target:** 80%+

---

## Phase 4: Polish

### Task 4.1: Loading States
- Skeleton loaders for lists
- Button loading indicators
- Optimistic updates

### Task 4.2: Error Handling
- Toast notifications for errors
- Retry buttons
- Offline detection (web)

### Task 4.3: Empty States
- Custom illustrations
- Helpful messages
- Action buttons

### Task 4.4: Keyboard Shortcuts (Web)
- `Q` for quick add
- Navigation with arrows
- Space to complete

---

## Dependency Graph

```
Phase 1 (Web UX)
├── 1.1 Inline Edit
├── 1.2 Quick Add ──────────┐
├── 1.3 Sidebar Projects    │
└── 1.4 Completion UX       │
                            │
Phase 2 (Mobile)            │
├── 2.1 API Client ─────────┤
│   └── 2.2 Task List       │
│       ├── 2.3 Task Form   │
│       ├── 2.4 Inbox ──────┤
│       ├── 2.5 Today       │
│       ├── 2.6 Upcoming    │
│       └── 2.7 Projects    │
│           └── 2.8 History │
└── 2.9 Tab Icons           │
                            │
Phase 3 (Tests)             │
├── 3.1 Web Unit ───────────┤
├── 3.2 Web E2E             │
├── 3.3 API Unit            │
└── 3.4 Mobile Unit         │
                            │
Phase 4 (Polish)            │
└── 4.1-4.4 ────────────────┘
```

---

## Checklist

### Phase 1: Web
- [ ] 1.1 Inline task editing
- [ ] 1.2 Quick add input
- [ ] 1.3 Sidebar projects
- [ ] 1.4 Completion UX

### Phase 2: Mobile
- [ ] 2.1 API client
- [ ] 2.2 Task list component
- [ ] 2.3 Task form modal
- [ ] 2.4 Inbox screen
- [ ] 2.5 Today screen
- [ ] 2.6 Upcoming screen
- [ ] 2.7 Projects screen
- [ ] 2.8 History screen
- [ ] 2.9 Tab icons

### Phase 3: Tests
- [ ] 3.1 Web unit tests (80%+)
- [ ] 3.2 Web E2E tests
- [ ] 3.3 API unit tests (80%+)
- [ ] 3.4 Mobile unit tests

### Phase 4: Polish
- [ ] 4.1 Loading states
- [ ] 4.2 Error handling
- [ ] 4.3 Empty states
- [ ] 4.4 Keyboard shortcuts

---

## Definition of Done

A task is complete when:
1. Feature works as specified
2. Unit tests written and passing
3. No TypeScript errors
4. Code follows project patterns
5. Tested manually in browser/simulator
