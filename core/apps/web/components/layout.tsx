'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Inbox,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import SearchModal from './search-modal';
import SidebarProjects from './sidebar-projects';

interface NavCounts {
  inbox: number;
  today: number;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const { tasks: tasksApi } = useApi();
  const [counts, setCounts] = useState<NavCounts>({ inbox: 0, today: 0 });
  const [showMore, setShowMore] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const loadCounts = useCallback(async () => {
    try {
      const allTasks = await tasksApi.getAll({ completed: false });
      const today = format(new Date(), 'yyyy-MM-dd');

      const inboxCount = allTasks.filter((task) => !task.projectId).length;
      const todayCount = allTasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = format(new Date(task.dueDate), 'yyyy-MM-dd');
        return taskDate === today;
      }).length;

      setCounts({ inbox: inboxCount, today: todayCount });
    } catch (error) {
      console.error('Failed to load counts:', error);
    }
  }, [tasksApi]);

  useEffect(() => {
    if (isSignedIn) {
      loadCounts();
    }
  }, [isSignedIn, loadCounts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isSignedIn) {
    return <>{children}</>;
  }

  const mainNavigation = [
    { name: 'Inbox', href: '/inbox', icon: Inbox, count: counts.inbox },
    {
      name: 'Today',
      href: '/today',
      icon: Calendar,
      count: counts.today,
      badge: format(new Date(), 'd'),
    },
    { name: 'Upcoming', href: '/upcoming', icon: Calendar },
    { name: 'Completed', href: '/history', icon: CheckCircle2 },
  ];

  const moreNavigation = [
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Stats', href: '/stats', icon: BarChart2 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-[280px] border-r border-border bg-card flex flex-col">
        {/* User Header */}
        <div className="flex items-center gap-3 p-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-7 h-7',
              },
            }}
          />
          <button className="flex items-center gap-1 text-sm font-medium hover:text-foreground/80 transition-colors">
            <span>{user?.firstName || 'User'}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Add Task Button */}
        <div className="px-3 py-1">
          <Link
            href="/today"
            className="flex items-center gap-3 px-3 py-2 text-primary font-medium hover:bg-accent rounded-md transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add task</span>
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 py-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-between w-full px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-md transition-colors"
          >
            <span className="flex items-center gap-3">
              <Search className="h-5 w-5" />
              <span>Search</span>
            </span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-auto px-3 py-2">
          <div className="space-y-0.5">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      active ? 'bg-accent text-foreground' : 'text-foreground/80 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Icon
                          className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        {item.badge && (
                          <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold text-primary">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span>{item.name}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-xs text-muted-foreground">{item.count}</span>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* More Section */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-foreground/80 hover:bg-accent transition-colors"
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              <span>More</span>
            </button>

            {showMore && (
              <div className="ml-3 space-y-0.5">
                {moreNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                          active
                            ? 'bg-accent text-foreground'
                            : 'text-foreground/80 hover:bg-accent'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="mt-4">
            <SidebarProjects />
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground rounded-md transition-colors">
            <HelpCircle className="h-5 w-5" />
            <span>Help & resources</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
