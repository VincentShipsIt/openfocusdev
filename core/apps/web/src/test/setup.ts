import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token'),
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
  }),
  useUser: () => ({
    user: { id: 'test-user-id', firstName: 'Test' },
    isLoaded: true,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => children,
}));

const createMockCrud = () => ({
  getAll: vi.fn().mockResolvedValue([]),
  getOne: vi.fn().mockResolvedValue({}),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  remove: vi.fn().mockResolvedValue({}),
});

vi.mock('@/hooks/use-api', () => ({
  useApi: () => ({
    tasks: {
      ...createMockCrud(),
      bulkComplete: vi.fn().mockResolvedValue({}),
      bulkDelete: vi.fn().mockResolvedValue({}),
      getSubtasks: vi.fn().mockResolvedValue([]),
      addReminder: vi.fn().mockResolvedValue({}),
      removeReminder: vi.fn().mockResolvedValue({}),
    },
    projects: {
      ...createMockCrud(),
      toggleFavorite: vi.fn().mockResolvedValue({}),
    },
    history: { getAll: vi.fn().mockResolvedValue([]) },
    goals: createMockCrud(),
    comments: createMockCrud(),
    connections: createMockCrud(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    return { type: 'img', props: { src, alt, ...props } };
  },
}));
