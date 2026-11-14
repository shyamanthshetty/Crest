import { apiClient } from '../apiClient';

export interface TransactionData {
  id?: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  note?: string;
}

export interface EntryData {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: string | null;
  location?: string;
  media?: string[];
  transactions: TransactionData[];
  createdAt?: string;
}

export interface CreateEntryPayload {
  title: string;
  content: string;
  date?: string;
  mood?: string | null;
  location?: string;
  media?: string[];
  transactions?: TransactionData[];
}

export interface UpdateEntryPayload {
  title?: string;
  content?: string;
  date?: string;
  mood?: string | null;
  location?: string;
  media?: string[];
  transactions?: TransactionData[];
}

export const entryService = {
  async getEntries(): Promise<EntryData[]> {
    try {
      const response = await apiClient.get<{ data: EntryData[] }>('/entries');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch entries');
    }
  },

  async createEntry(payload: CreateEntryPayload): Promise<EntryData> {
    try {
      const response = await apiClient.post<{ data: EntryData }>('/entries', payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create entry');
    }
  },

  async updateEntry(id: string, payload: UpdateEntryPayload): Promise<EntryData> {
    try {
      const response = await apiClient.put<{ data: EntryData }>(`/entries/${id}`, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update entry');
    }
  },

  async deleteEntry(id: string): Promise<void> {
    try {
      await apiClient.delete(`/entries/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete entry');
    }
  },
};
