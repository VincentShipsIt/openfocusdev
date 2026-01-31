# PRD: TaskFlow MVP - Complete Todoist Clone

**Version:** 1.0
**Date:** 2026-01-02
**Status:** In Progress

---

## Overview

TaskFlow is a full-featured task management application that replicates Todoist's core functionality across web and mobile platforms. This PRD defines the complete MVP scope with all features, interactions, and quality requirements.

---

## Platforms

| Platform | Tech Stack | Status |
|----------|------------|--------|
| **Web** | Next.js 14, React, Tailwind, @shipshitdev/ui | 70% |
| **Mobile** | Expo (React Native), Clerk auth | 20% |
| **API** | NestJS, MongoDB, Clerk | 90% |
| **Desktop** | Electron (wrapping web) | Scaffolded |

---

## Core Features

### 1. Task Management

#### 1.1 Create Task
- **Quick Add**: Inline input at top of task list, submit with Enter
- **Full Form**: Modal with all fields (title, description, project, due date, priority)
- **Keyboard Shortcut**: `Q` opens quick add anywhere

#### 1.2 Edit Task
- **Inline Edit**: Click task title to edit in place
- **Enter to Save**: Submit changes with Enter key
- **Escape to Cancel**: Cancel edit with Escape key
- **Full Edit**: Click edit icon for modal with all fields

#### 1.3 Complete Task
- **Checkbox**: Click checkbox to toggle complete/incomplete
- **Strikethrough**: Completed tasks show strikethrough
- **Animation**: Smooth transition on completion
- **Undo**: Toast notification with undo option (5 seconds)

#### 1.4 Delete Task
- **Confirmation**: Confirm before delete
- **Bulk Delete**: Multi-select and delete multiple tasks

#### 1.5 Task Properties
| Property | Type | Required | Default |
|----------|------|----------|---------|
| title | string | Yes | - |
| description | string | No | null |
| projectId | string | No | null (Inbox) |
| dueDate | datetime | No | null |
| priority | enum | No | medium |
| labels | string[] | No | [] |
| order | number | Auto | increment |

---

### 2. Project Management

#### 2.1 Create Project
- **Modal Form**: Name, color picker, icon selector
- **Quick Create**: Inline input in sidebar

#### 2.2 Edit Project
- **Click to Edit**: Edit name inline
- **Settings**: Modal for color, icon, delete

#### 2.3 Delete Project
- **Confirmation**: Warn about tasks in project
- **Option**: Move tasks to Inbox or delete

#### 2.4 Project Properties
| Property | Type | Required |
|----------|------|----------|
| name | string | Yes |
| color | hex string | No |
| icon | string | No |
| order | number | Auto |

---

### 3. Views

#### 3.1 Today View (Default)
- Tasks due today
- Overdue tasks (highlighted in red)
- Quick add with today's date pre-filled

#### 3.2 Inbox View
- Tasks without a project
- Default destination for quick add

#### 3.3 Upcoming View
- Tasks grouped by date
- Next 7 days + later sections
- Calendar mini-view (optional)

#### 3.4 Project View
- Tasks in specific project
- Project header with color
- List or Kanban toggle

#### 3.5 History View
- Completed tasks
- Filter by date range
- Filter by project

---

### 4. Sidebar

#### 4.1 Navigation
- Today (with count of due tasks)
- Inbox (with count)
- Upcoming
- History

#### 4.2 Projects List
- All user projects
- Color indicator
- Task count per project
- Drag to reorder
- Add project button

#### 4.3 Collapse/Expand
- Collapsible sidebar on mobile
- Hover to expand on desktop (optional)

---

### 5. Mobile-Specific Features

#### 5.1 Bottom Tab Navigation
- Today
- Inbox
- Upcoming
- Projects
- History

#### 5.2 Swipe Actions
- Swipe right: Complete task
- Swipe left: Delete task

#### 5.3 Pull to Refresh
- All list views support pull-to-refresh

#### 5.4 Add Task FAB
- Floating action button on all views
- Opens task creation modal

---

## User Interactions

### Keyboard Shortcuts (Web)

| Shortcut | Action |
|----------|--------|
| `Q` | Quick add task |
| `Enter` | Submit task / Save edit |
| `Escape` | Cancel edit / Close modal |
| `Space` | Toggle task complete (when selected) |
| `Delete` | Delete selected task |
| `↑` / `↓` | Navigate tasks |

### Touch Gestures (Mobile)

| Gesture | Action |
|---------|--------|
| Tap checkbox | Toggle complete |
| Tap task | Edit task |
| Swipe right | Complete task |
| Swipe left | Delete task |
| Long press | Multi-select mode |
| Pull down | Refresh list |

---

## API Endpoints

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List tasks (with filters) |
| GET | /api/tasks/:id | Get single task |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/tasks/bulk/complete | Bulk complete |
| POST | /api/tasks/bulk/delete | Bulk delete |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List projects |
| GET | /api/projects/:id | Get single project |
| POST | /api/projects | Create project |
| PATCH | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |

### Filters (Query Params)
- `projectId`: Filter by project
- `completed`: true/false
- `dueDate`: ISO date string
- `dueBefore`: Tasks due before date
- `dueAfter`: Tasks due after date

---

## Quality Requirements

### Test Coverage

| Area | Target | Type |
|------|--------|------|
| API Services | 80%+ | Unit |
| API Controllers | 80%+ | Integration |
| Web Components | 80%+ | Unit |
| Web Pages | 70%+ | Integration |
| Mobile Components | 80%+ | Unit |
| User Flows | 100% | E2E |

### E2E Test Scenarios

#### Authentication
- [ ] User can sign up
- [ ] User can sign in
- [ ] User can sign out
- [ ] Protected routes redirect to login

#### Tasks
- [ ] User can create task via quick add
- [ ] User can create task via modal
- [ ] User can edit task inline
- [ ] User can edit task via modal
- [ ] User can complete task
- [ ] User can uncomplete task
- [ ] User can delete task
- [ ] Enter submits task
- [ ] Escape cancels edit

#### Projects
- [ ] User can create project
- [ ] User can edit project
- [ ] User can delete project
- [ ] User can view tasks in project

#### Views
- [ ] Today view shows due tasks
- [ ] Inbox shows tasks without project
- [ ] Upcoming shows future tasks
- [ ] History shows completed tasks
- [ ] Sidebar shows all projects

#### Mobile
- [ ] User can navigate all tabs
- [ ] User can create task
- [ ] User can complete task via swipe
- [ ] User can delete task via swipe
- [ ] Pull to refresh works

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Page load time | < 2s |
| API response time | < 200ms |
| Test coverage | > 80% |
| Lighthouse score | > 90 |
| Mobile usability | No errors |

---

## Out of Scope (V1)

- Labels/tags management
- Recurring tasks
- Subtasks
- Comments
- File attachments
- Team collaboration
- Notifications/reminders
- Offline support
- Calendar integration
- Natural language date parsing

---

## Technical Notes

### Shared Package
- Types exported from `@todoist/shared`
- Utility functions for date formatting
- Validation schemas

### State Management
- Web: React Query for server state, useState for UI
- Mobile: React Query + Zustand for offline-first (future)

### Authentication
- Clerk for both web and mobile
- JWT tokens passed to API

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-02 | 1.0 | Initial PRD |
