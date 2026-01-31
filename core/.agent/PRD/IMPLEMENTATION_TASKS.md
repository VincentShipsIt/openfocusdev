# TaskFlow Implementation Tasks

## Epic 1: Gamification Foundation

### 1.1 User Gamification Schema & Service
- [ ] Create `UserGamification` schema (karma, xp, level, streak, trophies)
- [ ] Create `GamificationService` with karma/xp calculation logic
- [ ] Create level progression algorithm (XP thresholds)
- [ ] Add gamification profile to user creation flow
- [ ] Create `GET /api/users/me/gamification` endpoint
- [ ] Create `GET /api/users/:id/gamification` endpoint (public stats)

### 1.2 Karma System
- [ ] Define karma rules configuration (points per action)
- [ ] Hook into task completion → award karma
- [ ] Hook into task overdue → deduct karma
- [ ] Hook into goal milestone completion → award karma
- [ ] Create karma history log for transparency
- [ ] Add karma display to task completion feedback

### 1.3 Streak Tracking
- [ ] Create streak calculation service
- [ ] Track last active date on any task completion
- [ ] Calculate current streak on login/activity
- [ ] Detect streak break and apply penalty
- [ ] Create streak recovery grace period (optional)
- [ ] Add streak display to dashboard

### 1.4 Trophy System
- [ ] Create `Trophy` schema with criteria definitions
- [ ] Create `TrophyService` to check/award trophies
- [ ] Define 20 initial trophies with criteria
- [ ] Create trophy checking hooks (on task complete, daily, etc.)
- [ ] Create `GET /api/users/me/trophies` endpoint
- [ ] Create trophy unlock notification/animation
- [ ] Add trophy showcase to profile

### 1.5 Profile & Stats Page
- [ ] Design profile page UI (level, karma, streak, trophies)
- [ ] Create stats summary component
- [ ] Create trophy grid component
- [ ] Create level progress bar component
- [ ] Add "recent activity" section
- [ ] Add "stats over time" charts

---

## Epic 2: AI Task Creation (NLP)

### 2.1 NLP Parsing Service
- [ ] Create `AIService` with Claude API integration
- [ ] Design task parsing prompt with examples
- [ ] Create `parseTaskFromText(input: string)` method
- [ ] Extract: title, dueDate, priority, project, labels, recurring
- [ ] Return confidence scores for each field
- [ ] Handle timezone-aware date parsing

### 2.2 Quick Add Enhancement
- [ ] Create "smart add" input component
- [ ] Show real-time parsing preview as user types (debounced)
- [ ] Display extracted fields with edit capability
- [ ] Add keyboard shortcut for quick add (Cmd+K or similar)
- [ ] Create "confirm" vs "edit" flow for parsed task
- [ ] Log parsing results for model improvement

### 2.3 Context Awareness
- [ ] Fetch recent projects/labels for context
- [ ] Include user's common patterns in prompt
- [ ] Fuzzy match project names ("money maker" → "money-maker")
- [ ] Learn from user corrections (store feedback)

---

## Epic 3: AI Task Breakdown

### 3.1 Breakdown Service
- [ ] Create `breakdownTask(task: Task)` method in AIService
- [ ] Design prompt for subtask generation
- [ ] Return array of suggested subtasks
- [ ] Include estimated time per subtask (optional)
- [ ] Handle different task types (dev, planning, creative, etc.)

### 3.2 Breakdown UI
- [ ] Add "Break down with AI" button to task detail
- [ ] Create subtask preview/edit modal
- [ ] Allow selecting which subtasks to create
- [ ] Allow editing subtask titles before creation
- [ ] Bulk create selected subtasks
- [ ] Show loading state during AI processing

### 3.3 Auto-Breakdown Suggestions
- [ ] Detect complex tasks (long titles, vague scope)
- [ ] Suggest breakdown proactively
- [ ] "This looks like a big task. Want me to break it down?"

---

## Epic 4: Smart Scheduling

### 4.1 Focus Mode - "What Should I Do?"
- [ ] Create `getNextTask(userId, context)` method
- [ ] Consider: time available, energy, deadlines, priorities
- [ ] Create prompt for task recommendation
- [ ] Return ranked list of suggested tasks with reasons
- [ ] Create "Focus" button in header

### 4.2 Focus Mode UI
- [ ] Create focus mode overlay/page
- [ ] Show AI-recommended task with context
- [ ] Add "Start working" → timer integration
- [ ] Add "Skip" → next recommendation
- [ ] Add "Not now" → snooze task
- [ ] Track focus sessions for stats

### 4.3 Daily Planning Assistant
- [ ] Create "Plan my day" feature
- [ ] AI suggests optimal task order
- [ ] Drag to reorder/customize
- [ ] Set time blocks for tasks
- [ ] Morning notification with daily plan

---

## Epic 5: Productivity Insights

### 5.1 Analytics Collection
- [ ] Track task completion times
- [ ] Track task creation → completion duration
- [ ] Track postponement count per task
- [ ] Track completion by hour/day/project
- [ ] Store weekly aggregates

### 5.2 Weekly Report Generation
- [ ] Create `generateWeeklyInsights(userId)` method
- [ ] Analyze completion patterns
- [ ] Identify bottlenecks (frequently postponed)
- [ ] Compare to previous weeks
- [ ] Generate personalized tips with AI

### 5.3 Insights UI
- [ ] Create weekly report email/notification
- [ ] Create insights page in app
- [ ] Visualize productivity patterns (charts)
- [ ] Show AI-generated recommendations
- [ ] Track insight → action conversions

---

## Epic 6: Social - Friends

### 6.1 Friend System Backend
- [ ] Create `Friendship` schema
- [ ] Create `POST /api/friends/request` endpoint
- [ ] Create `POST /api/friends/accept` endpoint
- [ ] Create `DELETE /api/friends/:id` endpoint
- [ ] Create `GET /api/friends` endpoint
- [ ] Add friend search by username/email

### 6.2 Friend System UI
- [ ] Create "Add friend" modal
- [ ] Create friend requests list
- [ ] Create friends list page
- [ ] Add friend profile preview
- [ ] Create "Compare stats" view

### 6.3 Activity Feed
- [ ] Create `ActivityItem` schema
- [ ] Log significant events (level up, trophy, streak milestone)
- [ ] Create `GET /api/feed` endpoint (friends' activities)
- [ ] Create feed UI component
- [ ] Add reactions to activities (emoji)
- [ ] Privacy controls for activity visibility

---

## Epic 7: Leaderboards

### 7.1 Leaderboard Service
- [ ] Create leaderboard calculation service
- [ ] Calculate rankings (karma, tasks, streak)
- [ ] Cache leaderboard results (refresh hourly)
- [ ] Create `GET /api/leaderboards/:type` endpoint
- [ ] Types: global, friends, weekly, monthly, all-time

### 7.2 Leaderboard UI
- [ ] Create leaderboard page
- [ ] Show top 100 + user's position
- [ ] Toggle between ranking types
- [ ] Show user cards with level/stats
- [ ] Highlight friends on global board
- [ ] Add "Challenge" button next to users

---

## Epic 8: Challenges

### 8.1 Solo Challenges
- [ ] Create `Challenge` schema
- [ ] Define daily/weekly challenge templates
- [ ] Create challenge assignment service (daily rotation)
- [ ] Track challenge progress
- [ ] Award rewards on completion
- [ ] Create `GET /api/challenges/active` endpoint

### 8.2 Head-to-Head Challenges
- [ ] Create challenge invitation flow
- [ ] Define challenge types (most tasks, best streak, etc.)
- [ ] Track both participants' progress
- [ ] Determine winner at end date
- [ ] Award karma to winner
- [ ] Create challenge history

### 8.3 Challenges UI
- [ ] Create active challenges widget on dashboard
- [ ] Create challenge detail page
- [ ] Show progress vs opponent (H2H)
- [ ] Create "Challenge a friend" flow
- [ ] Create challenge completion celebration

---

## Epic 9: Advanced AI Features

### 9.1 Auto-Categorization
- [ ] Analyze task title/description
- [ ] Suggest project based on content
- [ ] Suggest labels based on patterns
- [ ] Learn from user corrections
- [ ] Apply automatically with high confidence

### 9.2 AI Search
- [ ] Create semantic search endpoint
- [ ] Index tasks with embeddings
- [ ] Natural language queries ("overdue client tasks")
- [ ] Search UI with AI-powered results

### 9.3 Smart Reminders (Future)
- [ ] Location-based reminder triggers
- [ ] App-open triggers
- [ ] Context-aware reminder timing

---

## Epic 10: Teams (Future)

### 10.1 Team Schema & Management
- [ ] Create `Team` schema
- [ ] Create team CRUD endpoints
- [ ] Team invitation flow
- [ ] Team roles (admin, member)

### 10.2 Team Features
- [ ] Team leaderboard
- [ ] Team karma pool
- [ ] Team challenges
- [ ] Shared projects within team

---

## Technical Infrastructure

### API Rate Limiting
- [ ] Add rate limits to AI endpoints
- [ ] Implement usage tracking per user
- [ ] Create upgrade prompts for heavy users

### Caching
- [ ] Cache leaderboard results (Redis)
- [ ] Cache user gamification stats
- [ ] Invalidate on relevant actions

### Background Jobs
- [ ] Daily streak calculation job
- [ ] Weekly insights generation job
- [ ] Leaderboard refresh job
- [ ] Trophy check job (batch)

### Notifications
- [ ] Push notification infrastructure
- [ ] Email notification templates
- [ ] In-app notification system
- [ ] Notification preferences

---

## Priority Order (Suggested)

1. **Week 1-2:** Gamification schemas, karma on task complete, basic streak
2. **Week 3-4:** Trophy system (10 trophies), profile page, level progression
3. **Week 5-6:** NLP task creation, AI service setup
4. **Week 7-8:** Friends system, activity feed
5. **Week 9-10:** Leaderboards (friends first, then global)
6. **Week 11-12:** Solo challenges, AI task breakdown
7. **Week 13-14:** Head-to-head challenges, smart scheduling
8. **Week 15-16:** Weekly insights, productivity analytics

---

## Dependencies

```
Epic 2 (NLP) → requires Claude API key, AI service
Epic 3 (Breakdown) → depends on Epic 2
Epic 4 (Scheduling) → depends on Epic 2
Epic 5 (Insights) → depends on Epic 1 (stats collection)
Epic 6 (Friends) → standalone
Epic 7 (Leaderboards) → depends on Epic 1
Epic 8 (Challenges) → depends on Epic 6, Epic 7
```
