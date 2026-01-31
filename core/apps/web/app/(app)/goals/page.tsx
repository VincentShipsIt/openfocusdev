'use client';

import { Goal, GoalCategory } from '@todoist/shared';
import { Plus, Target } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import GoalCard from '@/components/goal-card';
import GoalForm from '@/components/goal-form';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';

type TimelineRange = '5-year' | '10-year';

export default function GoalsPage() {
  const { goals: goalsApi } = useApi();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [timelineRange, setTimelineRange] = useState<TimelineRange>('10-year');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GoalCategory>('all');

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const allGoals = await goalsApi.getAll();
      setGoals(allGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  }, [goalsApi]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const maxYear = timelineRange === '5-year' ? 2030 : 2035;

  const filteredGoals = goals.filter((goal) => {
    if (categoryFilter !== 'all' && goal.category !== categoryFilter) return false;
    return goal.targetYear <= maxYear;
  });

  const totalGoals = goals.length;
  const businessGoals = goals.filter((g) => g.category === 'business').length;
  const personalGoals = goals.filter((g) => g.category === 'personal').length;
  const totalMilestones = goals.reduce((sum, g) => sum + g.milestones.length, 0);
  const completedMilestones = goals.reduce(
    (sum, g) => sum + g.milestones.filter((m) => m.completed).length,
    0
  );

  const handleGoalCreated = () => {
    setShowGoalForm(false);
    setEditingGoal(undefined);
    loadGoals();
  };

  const handleGoalUpdated = () => {
    setShowGoalForm(false);
    setEditingGoal(undefined);
    loadGoals();
  };

  const handleGoalDeleted = () => {
    loadGoals();
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  const handleMilestoneToggle = async (goalId: string, milestoneId: string) => {
    try {
      await goalsApi.toggleMilestone(goalId, milestoneId);
      loadGoals();
    } catch (error) {
      console.error('Failed to toggle milestone:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6" />
              Goals
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your business and personal goals for 2026-2036
            </p>
          </div>
          <Button onClick={() => setShowGoalForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">Total Goals</div>
            <div className="text-2xl font-bold">{totalGoals}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">Milestones</div>
            <div className="text-2xl font-bold">
              {completedMilestones}/{totalMilestones}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">Business</div>
            <div className="text-2xl font-bold">{businessGoals}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">Personal</div>
            <div className="text-2xl font-bold">{personalGoals}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setTimelineRange('5-year')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timelineRange === '5-year'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted-foreground/20'
              }`}
            >
              5-Year
            </button>
            <button
              onClick={() => setTimelineRange('10-year')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timelineRange === '10-year'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted-foreground/20'
              }`}
            >
              10-Year
            </button>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | GoalCategory)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="business">Business</option>
            <option value="personal">Personal</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg mb-2">No goals yet</p>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first goal to get started on your journey!
            </p>
            <Button onClick={() => setShowGoalForm(true)}>Create Your First Goal</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleGoalDeleted}
                onMilestoneToggle={handleMilestoneToggle}
              />
            ))}
          </div>
        )}
      </div>

      {showGoalForm && (
        <GoalForm
          goal={editingGoal}
          onClose={() => {
            setShowGoalForm(false);
            setEditingGoal(undefined);
          }}
          onSuccess={editingGoal ? handleGoalUpdated : handleGoalCreated}
        />
      )}
    </div>
  );
}
