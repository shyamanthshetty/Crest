import { create } from 'zustand';
import { entryService } from '../services/entryService';
import type { EntryData, CreateEntryPayload, UpdateEntryPayload } from '../services/entryService';

export interface Transaction {
    id: string;
    amount: number;
    type: 'expense' | 'income';
    category: string;
    note?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  title: string;
  content: string;
  mood: string | null;
  transactions: Transaction[];
  location?: string;
  media?: string[]; 
}

interface JournalState {
  entries: Record<string, JournalEntry>;
  customCategories: string[];
  isLoading: boolean;
  error: string | null;
  
  // API Actions
  fetchEntries: () => Promise<void>;
  createEntry: (payload?: CreateEntryPayload) => Promise<JournalEntry>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  syncEntry: (id: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  
  // Local-only actions (transactions are synced via syncEntry)
  addTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (entryId: string, transactionId: string) => void;
  addCustomCategory: (category: string) => void;
  clearError: () => void;
}

// Map backend response to our frontend shape
function mapEntryData(data: EntryData): JournalEntry {
  return {
    id: data.id,
    date: data.date || data.createdAt || new Date().toISOString(),
    title: data.title || '',
    content: data.content || '',
    mood: data.mood || null,
    transactions: (data.transactions || []).map(t => ({
      id: t.id || (Date.now().toString() + Math.random().toString(36).substring(2, 9)),
      amount: t.amount,
      type: t.type,
      category: t.category,
      note: t.note,
    })),
    location: data.location,
    media: data.media,
  };
}

export const useJournalStore = create<JournalState>()(
  (set, get) => ({
    entries: {},
    customCategories: ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Salary'],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchEntries: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await entryService.getEntries();
        const entriesMap: Record<string, JournalEntry> = {};
        for (const entry of data) {
          const mapped = mapEntryData(entry);
          entriesMap[mapped.id] = mapped;
        }
        set({ entries: entriesMap, isLoading: false });
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      }
    },

    createEntry: async (payload) => {
      const defaultPayload: CreateEntryPayload = payload || {
        title: '',
        content: '',
        date: new Date().toISOString(),
      };

      try {
        const data = await entryService.createEntry(defaultPayload);
        const entry = mapEntryData(data);
        set((state) => ({
          entries: { ...state.entries, [entry.id]: entry },
        }));
        return entry;
      } catch (error: any) {
        set({ error: error.message });
        throw error;
      }
    },

    // Update local state immediately for snappy UI
    updateEntry: (id, updates) => set((state) => {
      const entry = state.entries[id];
      if (!entry) return state;
      return {
        entries: {
          ...state.entries,
          [id]: { ...entry, ...updates },
        },
      };
    }),

    // Sync the current local state of an entry to the backend
    syncEntry: async (id) => {
      const entry = get().entries[id];
      if (!entry) return;

      const payload: UpdateEntryPayload = {
        title: entry.title,
        content: entry.content,
        date: entry.date,
        mood: entry.mood,
        location: entry.location,
        media: entry.media,
        transactions: entry.transactions.map(t => ({
          amount: t.amount,
          type: t.type,
          category: t.category,
          note: t.note,
        })),
      };

      try {
        await entryService.updateEntry(id, payload);
      } catch (error: any) {
        console.error('Failed to sync entry:', error.message);
        set({ error: error.message });
      }
    },

    deleteEntry: async (id) => {
      // Optimistically remove from local state
      set((state) => {
        const newEntries = { ...state.entries };
        delete newEntries[id];
        return { entries: newEntries };
      });

      try {
        await entryService.deleteEntry(id);
      } catch (error: any) {
        console.error('Failed to delete entry:', error.message);
        set({ error: error.message });
        // Optionally re-fetch to restore state
        get().fetchEntries();
      }
    },

    addTransaction: (id, transaction) => set((state) => {
      const entry = state.entries[id];
      if (!entry) return state;
      
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      };
      
      return {
        entries: {
          ...state.entries,
          [id]: {
            ...entry,
            transactions: [...entry.transactions, newTransaction],
          },
        },
      };
    }),

    removeTransaction: (entryId, transactionId) => set((state) => {
      const entry = state.entries[entryId];
      if (!entry) return state;
      
      return {
        entries: {
          ...state.entries,
          [entryId]: {
            ...entry,
            transactions: entry.transactions.filter(t => t.id !== transactionId),
          },
        },
      };
    }),

    addCustomCategory: (category) => set((state) => {
      if (state.customCategories.includes(category)) return state;
      return { customCategories: [...state.customCategories, category] };
    }),
  })
);
