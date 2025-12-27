import { create } from 'zustand';

export type Platform = 'twitter' | 'linkedin' | 'instagram';

export type ScheduleMode = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface ScheduleFrequency {
  mode: ScheduleMode;
  time: string;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

// Editor post for local UI state (draft posts being edited)
export interface EditorPost {
  id: string;
  content: string;
  platforms: Platform[];
  selected?: boolean;
}

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // AI Panel visibility
  isAIPanelOpen: boolean;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;

  // Active panels
  activeLeftPanel: 'queue' | 'calendar' | 'platforms' | null;
  setActiveLeftPanel: (panel: 'queue' | 'calendar' | 'platforms') => void;
  toggleLeftPanel: (panel: 'queue' | 'calendar' | 'platforms') => void;

  // Active tab
  activeTab: 'twitter' | 'linkedin' | 'editor';
  setActiveTab: (tab: 'twitter' | 'linkedin' | 'editor') => void;

  // Editor posts (local UI state for posts being drafted)
  editorPosts: EditorPost[];
  addEditorPost: () => void;
  addEditorPostWithData: (content: string, platforms: Platform[]) => void;
  updateEditorPost: (id: string, updates: Partial<EditorPost>) => void;
  removeEditorPost: (id: string) => void;
  removeEditorPosts: (ids: string[]) => void;
  clearEditorPosts: () => void;
  reorderEditorPosts: (posts: EditorPost[]) => void;
  toggleEditorPostSelection: (id: string) => void;
  selectAllEditorPosts: () => void;
  deselectAllEditorPosts: () => void;
  getSelectedEditorPosts: () => EditorPost[];

  // Selected date for calendar
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  theme: 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    return { theme: newTheme };
  }),

  // AI Panel (persisted to localStorage)
  isAIPanelOpen: ((): boolean => {
    try { return JSON.parse(localStorage.getItem('plingo:isAIPanelOpen') ?? 'true'); } catch { return true; }
  })(),
  toggleAIPanel: () => set((state) => {
    const next = !state.isAIPanelOpen;
    try { localStorage.setItem('plingo:isAIPanelOpen', JSON.stringify(next)); } catch {}
    return { isAIPanelOpen: next };
  }),
  setAIPanelOpen: (open) => {
    try { localStorage.setItem('plingo:isAIPanelOpen', JSON.stringify(open)); } catch {}
    return set({ isAIPanelOpen: open });
  },

  // Active panels (persist active left panel)
  activeLeftPanel: ((): 'queue' | 'calendar' | 'platforms' | null => {
    try { return JSON.parse(localStorage.getItem('plingo:activeLeftPanel') ?? '"queue"'); } catch { return 'queue'; }
  })(),
  setActiveLeftPanel: (panel) => {
    try { localStorage.setItem('plingo:activeLeftPanel', JSON.stringify(panel)); } catch {}
    return set({ activeLeftPanel: panel });
  },
  toggleLeftPanel: (panel) => set((state) => {
    const next = state.activeLeftPanel === panel ? null : panel;
    try { localStorage.setItem('plingo:activeLeftPanel', JSON.stringify(next)); } catch {}
    return ({ activeLeftPanel: next });
  }),

  // Active tab
  activeTab: 'twitter',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Editor posts (local UI state)
  editorPosts: [
    {
      id: generateId(),
      content: '',
      platforms: ['twitter'],
      selected: false,
    },
  ],
  addEditorPost: () => set((state) => ({
    editorPosts: [...state.editorPosts, {
      id: generateId(),
      content: '',
      platforms: ['twitter'],
      selected: false,
    }],
  })),
  addEditorPostWithData: (content, platforms) => set((state) => ({
    editorPosts: [{
      id: generateId(),
      content,
      platforms,
      selected: false,
    }, ...state.editorPosts.filter(p => p.content !== '')],
  })),
  updateEditorPost: (id, updates) => set((state) => ({
    editorPosts: state.editorPosts.map((post) =>
      post.id === id ? { ...post, ...updates } : post
    ),
  })),
  removeEditorPost: (id) => set((state) => ({
    editorPosts: state.editorPosts.length > 1
      ? state.editorPosts.filter((post) => post.id !== id)
      : state.editorPosts,
  })),
  removeEditorPosts: (ids) => set((state) => {
    const remaining = state.editorPosts.filter((post) => !ids.includes(post.id));
    return {
      editorPosts: remaining.length > 0 ? remaining : [{
        id: generateId(),
        content: '',
        platforms: ['twitter'],
        selected: false,
      }],
    };
  }),
  clearEditorPosts: () => set({
    editorPosts: [{
      id: generateId(),
      content: '',
      platforms: ['twitter'],
      selected: false,
    }],
  }),
  reorderEditorPosts: (posts) => set({ editorPosts: posts }),
  toggleEditorPostSelection: (id) => set((state) => ({
    editorPosts: state.editorPosts.map((post) =>
      post.id === id ? { ...post, selected: !post.selected } : post
    ),
  })),
  selectAllEditorPosts: () => set((state) => ({
    editorPosts: state.editorPosts.map((post) => ({ ...post, selected: true })),
  })),
  deselectAllEditorPosts: () => set((state) => ({
    editorPosts: state.editorPosts.map((post) => ({ ...post, selected: false })),
  })),
  getSelectedEditorPosts: () => get().editorPosts.filter((post) => post.selected),

  // Selected date
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
