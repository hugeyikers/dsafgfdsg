// api/client.ts helper - assuming it exists or creating a simple one if needed for the store.
// But first, let's create the Store.

import { create } from 'zustand';
import client from '../api/client';

export interface KanbanItem {
  id: number;
  content: string;
  order: number;
  columnId: number;
}

export interface KanbanColumn {
  id: number;
  title: string;
  order: number;
  limit: number;
  items: KanbanItem[];
}

interface KanbanState {
  columns: KanbanColumn[];
  isLoading: boolean;
  selectedItems: number[]; // For multi-select
  
  fetchBoard: () => Promise<void>;
  addColumn: (title: string, limit?: number) => Promise<void>;
  updateColumn: (id: number, data: { title?: string, limit?: number }) => Promise<void>;
  removeColumn: (id: number) => Promise<void>;
  
  addItem: (columnId: number, content: string) => Promise<void>;
  updateItem: (itemId: number, content: string) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  
  moveItem: (itemId: number, targetColumnId: number) => Promise<void>; // Simplified move
  moveBatch: (targetColumnId: number) => Promise<void>; // Move selected
  
  toggleSelection: (itemId: number) => void;
  clearSelection: () => void;
  reorderColumns: (newOrderIds: number[]) => Promise<void>;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: [],
  isLoading: false,
  selectedItems: [],

  fetchBoard: async () => {
    set({ isLoading: true });
    try {
      const res = await client.get('/kanban/columns');
      set({ columns: res.data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  addColumn: async (title, limit = 0) => {
    try {
      await client.post('/kanban/columns', { title, limit });
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  updateColumn: async (id, data) => {
    try {
      await client.patch(`/kanban/columns/${id}`, data);
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  removeColumn: async (id) => {
    try {
      await client.delete(`/kanban/columns/${id}`);
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  addItem: async (columnId, content) => {
    try {
      await client.post('/kanban/items', { columnId, content });
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  updateItem: async (id, content) => {
      try {
          await client.patch(`/kanban/items/${id}`, { content });
          get().fetchBoard();
      } catch (e) {
          console.error(e);
      }
  },

  reorderColumns: async (columnIds: number[]) => {
    try {
       // Optimistic update
      const currentColumns = get().columns;
      // Sort columns based on the new ID order
      const reorderedColumns = columnIds.map(id => currentColumns.find(c => c.id === id)!).filter(Boolean);
      set({ columns: reorderedColumns });

      await client.patch('/kanban/columns/reorder', { columnIds });
    } catch (e) {
      console.error(e);
      get().fetchBoard();
    }
  },

  removeItem: async (id: number) => {
    try {
      await client.delete(`/kanban/items/${id}`);
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  moveItem: async (itemId, targetColumnId) => {
      // Optimistic update could happen here, but for simplicity:
      try {
          await client.patch('/kanban/items/move-batch', { itemIds: [itemId], targetColumnId });
          get().fetchBoard();
      } catch (e) {
          console.error(e);
      }
  },

  moveBatch: async (targetColumnId) => {
      const { selectedItems } = get();
      if (selectedItems.length === 0) return;
      try {
          await client.patch('/kanban/items/move-batch', { itemIds: selectedItems, targetColumnId });
          set({ selectedItems: [] });
          get().fetchBoard();
      } catch (e) {
          console.error(e);
      }
  },

  toggleSelection: (itemId) => {
      set(state => {
          const isSelected = state.selectedItems.includes(itemId);
          return {
              selectedItems: isSelected 
                  ? state.selectedItems.filter(id => id !== itemId)
                  : [...state.selectedItems, itemId]
          };
      });
  },
  
  clearSelection: () => set({ selectedItems: [] })
}));
