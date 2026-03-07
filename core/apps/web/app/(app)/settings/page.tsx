'use client';

import { useUser } from '@clerk/nextjs';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useApi } from '@/hooks/use-api';

type Tab = 'profile' | 'appearance' | 'notifications' | 'danger';

type Theme = 'dark' | 'light' | 'system';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('dark', 'light');
  }
  localStorage.setItem('theme', theme);
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const { user, isLoaded } = useUser();
  const { tasks: tasksApi } = useApi();

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<Theme>('system');

  // Notifications
  const [emailReminders, setEmailReminders] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [digestTime, setDigestTime] = useState('08:00');

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.fullName || user.firstName || '');
      const meta = user.unsafeMetadata as Record<string, unknown>;
      setEmailReminders(Boolean(meta?.emailReminders));
      setDailyDigest(Boolean(meta?.dailyDigest));
      setDigestTime((meta?.digestTime as string) || '08:00');
    }
  }, [user]);

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(stored);
  }, []);

  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    try {
      const parts = displayName.trim().split(' ');
      await user.update({ firstName: parts[0], lastName: parts.slice(1).join(' ') || undefined });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingName(false);
    }
  };

  const handleTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    await user.update({
      unsafeMetadata: { ...user.unsafeMetadata, emailReminders, dailyDigest, digestTime },
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const tasks = await tasksApi.getAll();
      const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteCompleted = async () => {
    setDeleting(true);
    try {
      const completed = await tasksApi.getAll({ completed: true });
      if (completed.length > 0) {
        await tasksApi.bulkDelete(completed.map((t) => t.id));
      }
      setDeleteConfirm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="space-y-6">
          {user?.imageUrl && (
            <div className="flex items-center gap-4">
              <img
                src={user.imageUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border border-border"
              />
              <div>
                <p className="text-sm text-muted-foreground">
                  Avatar is managed via your Clerk profile.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Display Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {savingName ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ''}
              readOnly
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {tab === 'appearance' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Choose your preferred theme.</p>
          <div className="flex gap-3">
            {(
              [
                { value: 'light', label: 'Light', Icon: Sun },
                { value: 'dark', label: 'Dark', Icon: Moon },
                { value: 'system', label: 'System', Icon: Monitor },
              ] as { value: Theme; label: string; Icon: React.ElementType }[]
            ).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => handleTheme(value)}
                className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl border text-sm font-medium transition-colors ${
                  theme === value
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-border bg-card text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="space-y-6">
          <Toggle
            label="Email Reminders"
            description="Get email reminders for upcoming tasks."
            checked={emailReminders}
            onChange={setEmailReminders}
          />
          <Toggle
            label="Daily Digest"
            description="Receive a daily summary of your tasks."
            checked={dailyDigest}
            onChange={setDailyDigest}
          />
          {dailyDigest && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Digest Time</label>
              <input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <button
            onClick={handleSaveNotifications}
            className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      )}

      {/* Danger Zone Tab */}
      {tab === 'danger' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Export All Tasks</p>
                <p className="text-xs text-muted-foreground">Download your tasks as a JSON file.</p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
              >
                {exporting ? 'Exporting...' : 'Export JSON'}
              </button>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delete All Completed Tasks</p>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Completed
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-3 py-2 rounded-md border border-border text-sm hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCompleted}
                    disabled={deleting}
                    className="px-3 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          checked ? 'bg-blue-500' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
