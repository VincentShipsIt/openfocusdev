# TaskFlow AI + Gamification PRD

## Vision

Transform TaskFlow from a todo app into an AI-powered productivity game where completing tasks feels rewarding, addictive, and competitive.

---

## Part 1: AI Features

### 1.1 Smart Task Creation (NLP)

**What:** Natural language task input that understands context, dates, priorities, and projects.

**Examples:**
- "Call mom tomorrow at 3pm" → Task with reminder
- "Review PR for auth feature high priority" → Task in correct project, priority: high
- "Every monday morning prepare weekly report" → Recurring task
- "Finish landing page by friday for money-maker project" → Task with deadline, assigned to project

**Technical approach:**
- LLM-based parsing (Claude API or local model)
- Context awareness (recent projects, labels, patterns)
- Confidence scoring with user confirmation for ambiguous inputs

---

### 1.2 AI Task Breakdown

**What:** Complex tasks automatically broken into subtasks.

**Example:**
- Input: "Launch product on Product Hunt"
- AI generates:
  - [ ] Prepare launch assets (screenshots, logo)
  - [ ] Write tagline and description
  - [ ] Create maker comment
  - [ ] Schedule launch date
  - [ ] Prepare social media posts
  - [ ] Set up analytics tracking
  - [ ] Draft follow-up email for upvoters

**Technical approach:**
- LLM with task decomposition prompt
- Learn from user's past task structures
- Allow editing/regenerating subtasks

---

### 1.3 Smart Scheduling & Focus Mode

**What:** AI suggests what to work on NOW based on:
- Time available ("I have 30 minutes")
- Energy level ("I'm tired" → suggest easy tasks)
- Deadlines and priorities
- Your productivity patterns (when you're most productive)
- Context (location, time of day)

**Features:**
- "What should I do next?" button
- Focus session with AI-curated task queue
- Smart reordering of today's tasks
- Pomodoro integration with task suggestions

---

### 1.4 Predictive Priority & Auto-categorization

**What:** AI automatically:
- Assigns priority based on language, deadlines, project importance
- Suggests project/labels based on task content
- Detects urgency from context ("ASAP", "blocking", "client waiting")

---

### 1.5 Productivity Insights (AI Coach)

**What:** Weekly AI-generated productivity report with:
- Completion patterns (best days, times)
- Bottleneck detection (tasks that keep getting postponed)
- Goal progress analysis
- Personalized tips based on your behavior
- Burnout detection and recommendations

**Example insight:**
> "You complete 73% more tasks before noon. Consider scheduling deep work in the morning.
> Your 'Landing Page' task has been postponed 5 times - want me to break it down?"

---

### 1.6 Smart Reminders

**What:** Context-aware reminders instead of just time-based:
- "Remind me when I'm near the grocery store"
- "Remind me when I open Slack"
- "Remind me when [person] messages me"
- "Remind me when I'm done with my focus session"

---

### 1.7 Email/Calendar → Task Extraction

**What:** Connect email/calendar and AI extracts action items:
- Meeting notes → tasks
- Email commitments → tasks
- Calendar events → preparation tasks

---

### 1.8 AI Search & Query

**What:** Semantic search across all tasks:
- "What did I work on last week for the API project?"
- "Show me all client-related tasks that are overdue"
- "Find tasks I keep postponing"

---

## Part 2: Gamification

### 2.1 Karma Points System

**Earning Karma:**
| Action | Points |
|--------|--------|
| Complete a task | 10 |
| Complete high priority task | 20 |
| Complete before deadline | +5 bonus |
| Complete overdue task | 5 (reduced) |
| Complete task same day created | 15 |
| Maintain daily streak | 20/day |
| Complete all daily tasks | 50 |
| Complete a goal milestone | 100 |
| Complete entire goal | 500 |
| Help teammate (assign completed) | 25 |

**Losing Karma:**
| Action | Points |
|--------|--------|
| Task overdue | -5/day |
| Break streak | -50 |
| Delete overdue task (shame delete) | -20 |
| Postpone same task 3+ times | -10 |

---

### 2.2 Levels & XP Progression

**Level System:**
- Level 1-10: Novice (0-1,000 XP)
- Level 11-25: Apprentice (1,000-5,000 XP)
- Level 26-50: Achiever (5,000-15,000 XP)
- Level 51-75: Master (15,000-35,000 XP)
- Level 76-99: Grandmaster (35,000-75,000 XP)
- Level 100: Enlightened (75,000+ XP)

**Level Rewards:**
- New themes unlock
- Avatar customization options
- Feature unlocks (advanced AI features)
- Title/flair for leaderboards

---

### 2.3 Trophies & Achievements

**Categories:**

**Streaks:**
- 🔥 On Fire - 7 day streak
- 🔥🔥 Unstoppable - 30 day streak
- 🔥🔥🔥 Legendary - 100 day streak
- 💎 Diamond Streak - 365 day streak

**Completion:**
- ✅ First Blood - Complete first task
- 💯 Centurion - Complete 100 tasks
- 🏆 Thousand Club - Complete 1,000 tasks
- 👑 Task Slayer - Complete 10,000 tasks

**Speed:**
- ⚡ Speed Demon - Complete 10 tasks in 1 hour
- 🚀 Productivity Beast - Complete 50 tasks in 1 day
- 🏎️ Quick Draw - Complete task within 1 minute of creation

**Goals:**
- 🎯 Goal Getter - Complete first goal
- 🌟 Dream Achiever - Complete 10 goals
- 🏔️ Mountain Climber - Complete a goal with 10+ milestones

**Social:**
- 🤝 Team Player - Help complete 10 team tasks
- 👊 Rival - Win 5 head-to-head challenges
- 🏅 Champion - Reach #1 on weekly leaderboard

**Special:**
- 🌙 Night Owl - Complete 100 tasks after midnight
- 🌅 Early Bird - Complete 100 tasks before 7am
- 📅 Perfect Week - Complete all tasks for 7 days
- 🧘 Zen Master - Zero overdue tasks for 30 days

---

### 2.4 Leaderboards

**Types:**
- **Global** - All users, weekly/monthly/all-time
- **Friends** - Your connected friends
- **Team** - Workspace members
- **Challenge** - Specific challenge participants

**Ranking Metrics:**
- Karma points (default)
- Tasks completed
- Streak length
- Goals achieved

**Privacy:** Opt-in for global, auto for friends/team

---

### 2.5 Challenges & Competitions

**Solo Challenges:**
- Daily: "Complete 10 tasks today" → bonus XP
- Weekly: "Maintain zero overdue tasks" → trophy
- Monthly: "Complete a goal" → special badge

**Head-to-Head:**
- Challenge a friend to complete more tasks this week
- Wager karma points
- Winner gets bragging rights + bonus XP

**Community Challenges:**
- "Productivity January" - Global challenge
- Themed events (Focus February, Goal March)
- Limited-time trophies

---

### 2.6 Social Features

**Friend System:**
- Add friends by username/email
- See friend activity feed
- Send encouragement/reactions
- Compare stats

**Accountability Partners:**
- Pair up with someone
- Get notified of each other's progress
- Shared goals support
- Mutual streak tracking

**Teams/Guilds:**
- Create or join a team
- Team leaderboards
- Collaborative challenges
- Team karma pool

---

### 2.7 Rewards & Unlocks

**Themes:**
- Dark themes unlock at level 10
- Seasonal themes from events
- Custom accent colors at level 25

**Avatars:**
- Starter avatars free
- Unlock frames/borders with trophies
- Animated avatars at high levels

**Features:**
- Advanced AI features unlock progressively
- More focus mode options
- Custom trophy showcase

---

## Part 3: Data Models

### New Schemas Required

```typescript
// User Gamification Profile
interface UserGamification {
  odiserId: string;
  karma: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  trophies: Trophy[];
  unlockedThemes: string[];
  unlockedAvatars: string[];
  avatar: string;
  title: string;
  privacySettings: {
    showOnGlobalLeaderboard: boolean;
    showActivityToFriends: boolean;
  };
}

// Trophy
interface Trophy {
  id: string;
  slug: string;
  earnedAt: Date;
  progress?: number; // for progressive trophies
}

// Challenge
interface Challenge {
  id: string;
  type: 'solo' | 'head-to-head' | 'community';
  title: string;
  description: string;
  criteria: ChallengeCriteria;
  startDate: Date;
  endDate: Date;
  participants: Participant[];
  rewards: Reward[];
}

// Friendship
interface Friendship {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: Date;
  accountabilityPartner: boolean;
}

// Activity Feed Item
interface ActivityItem {
  userId: string;
  type: 'task_completed' | 'trophy_earned' | 'level_up' | 'streak' | 'goal_completed';
  data: any;
  createdAt: Date;
  visibility: 'public' | 'friends' | 'private';
}

// AI Interaction Log (for learning)
interface AIInteraction {
  userId: string;
  type: 'task_parse' | 'breakdown' | 'scheduling' | 'insight';
  input: string;
  output: any;
  userFeedback?: 'accepted' | 'rejected' | 'edited';
  createdAt: Date;
}
```

---

## Part 4: Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Karma points system (earn on complete)
- [ ] XP and level progression
- [ ] Basic streak tracking
- [ ] 10 starter trophies
- [ ] Profile page with stats
- [ ] Basic NLP task creation

### Phase 2: Social
- [ ] Friend system
- [ ] Friends leaderboard
- [ ] Activity feed
- [ ] Basic challenges (solo daily/weekly)

### Phase 3: AI Enhancement
- [ ] AI task breakdown
- [ ] Smart scheduling / "What should I do?"
- [ ] Productivity insights (weekly report)
- [ ] Auto-categorization

### Phase 4: Competition
- [ ] Global leaderboards
- [ ] Head-to-head challenges
- [ ] Teams/Guilds
- [ ] Community events

### Phase 5: Advanced AI
- [ ] Email/calendar integration
- [ ] Context-aware reminders
- [ ] AI search
- [ ] Personalized AI coach

---

## Part 5: Success Metrics

**Engagement:**
- DAU/MAU ratio > 40%
- Average session length > 5 min
- Tasks completed per user per week

**Retention:**
- D1 retention > 60%
- D7 retention > 40%
- D30 retention > 25%

**Gamification:**
- % users with active streak
- Trophy unlock rate
- Challenge participation rate
- Friend connections per user

**AI:**
- NLP parsing accuracy > 90%
- AI suggestion acceptance rate > 70%
- Feature engagement (breakdown, scheduling used)

---

## Competitive Differentiation

| Feature | Todoist | TickTick | TaskFlow |
|---------|---------|----------|----------|
| NLP Input | Basic | Good | AI-powered |
| Task Breakdown | Manual | Manual | AI-generated |
| Smart Scheduling | No | Basic | AI + context |
| Gamification | Karma only | Habits | Full RPG system |
| Social | No | No | Friends + compete |
| Leaderboards | No | No | Yes |
| AI Insights | No | No | Weekly AI coach |
| Challenges | No | No | Solo + PvP |

---

## Open Questions

1. **Monetization:** Which AI features are free vs paid?
2. **Anti-gaming:** How to prevent karma farming (create/complete trivial tasks)?
3. **Privacy:** How much activity to share by default?
4. **AI costs:** Rate limits on AI features?
5. **Accessibility:** How to make gamification optional for users who find it distracting?
