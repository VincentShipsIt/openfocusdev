'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApi } from '@/hooks/use-api';

interface StatsData {
  totalCompleted: number;
  todayCompleted: number;
  weekCompleted: number;
  weeklyData: { date: string; count: number }[];
  streak: number;
  bestStreak: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMostProductiveDay(weeklyData: { date: string; count: number }[]) {
  const dayTotals: Record<string, number> = {};
  for (const { date, count } of weeklyData) {
    const d = new Date(date + 'T00:00:00');
    const dayName = DAYS[d.getDay()];
    dayTotals[dayName] = (dayTotals[dayName] || 0) + count;
  }
  let best = '';
  let bestCount = 0;
  for (const [day, count] of Object.entries(dayTotals)) {
    if (count > bestCount) {
      bestCount = count;
      best = day;
    }
  }
  return best || '—';
}

function formatChartData(weeklyData: { date: string; count: number }[]) {
  return weeklyData.map(({ date, count }) => {
    const d = new Date(date + 'T00:00:00');
    return {
      label: `${DAYS[d.getDay()]} ${d.getDate()}`,
      count,
    };
  });
}

export default function StatsPage() {
  const { tasks: tasksApi } = useApi();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksApi
      .getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tasksApi]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-muted-foreground animate-pulse">Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-muted-foreground">Failed to load stats.</div>
      </div>
    );
  }

  const chartData = formatChartData(stats.weeklyData);
  const mostProductiveDay = getMostProductiveDay(stats.weeklyData);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Productivity Stats</h1>

      {/* Header row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="🔥 Streak" value={`${stats.streak} days`} />
        <StatCard label="Today" value={String(stats.todayCompleted)} />
        <StatCard label="This Week" value={String(stats.weekCompleted)} />
        <StatCard label="All Time" value={String(stats.totalCompleted)} />
      </div>

      {/* Bar chart: last 28 days */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Completions (Last 28 Days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval={3}
            />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'hsl(var(--accent))' }}
            />
            <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Streak cards + most productive day */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="🔥 Current Streak" value={`${stats.streak} days`} accent />
        <StatCard label="⭐ Best Streak (28d)" value={`${stats.bestStreak} days`} />
        <StatCard label="📅 Most Productive Day" value={mostProductiveDay} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-1 ${
        accent ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-card'
      }`}
    >
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  );
}
