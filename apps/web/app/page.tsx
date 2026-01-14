import { auth } from '@clerk/nextjs/server';
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  Inbox,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/today');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Start for free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Organize your work
          <br />
          and life, finally.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Become focused, organized, and calm with TaskFlow. The world's #1 task
          manager and to-do list app.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Start for free
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Free forever. No credit card required.
        </p>
      </section>

      {/* App Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
          <div className="flex">
            {/* Sidebar Preview */}
            <div className="w-64 border-r border-border p-4 hidden md:block">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 bg-primary/20 rounded-full" />
                <span className="text-sm font-medium">Your Name</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-primary">
                  <Inbox className="w-4 h-4" />
                  <span>Inbox</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 bg-accent rounded-md text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Today</span>
                  <span className="ml-auto text-xs text-muted-foreground">5</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Upcoming</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">
                  My Projects
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
                    <span className="text-blue-500">#</span>
                    <span>Work</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
                    <span className="text-green-500">#</span>
                    <span>Personal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Preview */}
            <div className="flex-1 p-6">
              <h2 className="text-2xl font-bold mb-1">Today</h2>
              <p className="text-sm text-muted-foreground mb-6">5 tasks</p>
              <div className="space-y-3">
                {[
                  { title: 'Review project proposal', color: '#f97316' },
                  { title: 'Send weekly report', color: '#3b82f6' },
                  { title: 'Team standup at 10am', color: '#3b82f6', time: '10:00 AM' },
                  { title: 'Prepare presentation slides', color: '#ef4444' },
                  { title: 'Respond to client emails', color: '#6b7280' },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: task.color }}
                    />
                    <div className="flex-1">
                      <span className="text-sm">{task.title}</span>
                      {task.time && (
                        <div className="text-xs text-muted-foreground mt-0.5">{task.time}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Everything you need to stay organized
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          TaskFlow helps you manage tasks, track habits, and achieve your goals with
          powerful features designed for productivity.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Inbox,
              title: 'Capture everything',
              description:
                'Add tasks on the go with Quick Add. Set due dates, priorities, and reminders in seconds.',
            },
            {
              icon: FolderKanban,
              title: 'Organize your way',
              description:
                'Create projects and sections to organize your tasks. Use labels and filters for quick access.',
            },
            {
              icon: Calendar,
              title: 'Plan your day',
              description:
                'See your tasks by day, week, or custom filter. Never miss a deadline with smart scheduling.',
            },
            {
              icon: Target,
              title: 'Set & track goals',
              description:
                'Define your long-term goals with milestones. Track progress and celebrate achievements.',
            },
            {
              icon: Zap,
              title: 'Stay focused',
              description:
                'Prioritize what matters most. Focus on one task at a time with minimal distractions.',
            },
            {
              icon: Sparkles,
              title: 'Build habits',
              description:
                'Create recurring tasks to build productive habits. Track your streaks and stay consistent.',
            },
          ].map((feature, i) => (
            <div key={i} className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get more done?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join millions of people who organize their work and life with TaskFlow.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Get started — it's free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">TaskFlow</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with care. Free forever.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
