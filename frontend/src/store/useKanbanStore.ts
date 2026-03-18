import { create } from 'zustand';
import client from '../api/client';

export interface KanbanItem {
  id: number;
  content: string;
  order: number;
  columnId: number;
  assignedToId?: number;
  assignedTo?: {
      id: number;
      fullName: string;
      email: string;
  };
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
  selectedItems: number[]; 
  
  fetchBoard: () => Promise<void>;
  addColumn: (title: string, limit?: number) => Promise<void>;
  updateColumn: (id: number, data: { title?: string, limit?: number }) => Promise<void>;
  removeColumn: (id: number) => Promise<void>;
  
  addItem: (columnId: number, content: string, assignedToId?: number) => Promise<void>;
  updateItem: (itemId: number, content: string, assignedToId?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  
  moveItem: (itemId: number, targetColumnId: number, targetAssignedToId?: number) => Promise<void>; 
  moveBatch: (targetColumnId: number) => Promise<void>; 
  moveItemsBatch: (itemIds: number[], targetColumnId: number, targetAssignedToId?: number) => Promise<void>;
  
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

  addItem: async (columnId, content, assignedToId) => {
    try {
      await client.post('/kanban/items', { columnId, content, assignedToId });
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  updateItem: async (id, content, assignedToId) => {
      try {
          // assignedToId value of undefined means no change, but we want to allow null to unassign.
          // We pass it in payload only if it's explicitly passed (including null)
          const payload: any = { content };
          if (assignedToId !== undefined) {
             payload.assignedToId = assignedToId;
          }
          await client.patch(`/kanban/items/${id}`, payload);
          get().fetchBoard();
      } catch (e) {
          console.error(e);
      }
  },

  reorderColumns: async (columnIds: number[]) => {
    try {
      const currentColumns = get().columns;
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

  moveItem: async (itemId, targetColumnId, targetAssignedToId) => {
      try {
          const payload: any = { itemIds: [itemId], targetColumnId };
          if (targetAssignedToId !== undefined) {
              payload.targetAssignedToId = targetAssignedToId;
          }
          // Using move-batch logic or simple update? 
          // Previous code used `move-batch` for single item moves too.
          // Let's ensure backend `move-batch` handles assignedToId or use update implementation.
          // The backend `moveBatch` implementation I read earlier likely DOES NOT handle assignedToId yet.
          // I should verify backend.
          // `kanban.service.ts` moveBatch: `data: { columnId: targetColumnId, order: nextOrder }` - NO assignedToId.
          
          // So I should use `updateItem` (singular) logic via `patch /items/:id` or update moveBatch.
          // But I want a clean implementation.
          // Let's use `updateItem` logic which maps to `updateItem` on backend.
          // Backend `updateItem` uses `dto`. `UpdateItemDto` now has `assignedToId`.
          
          const patchPayload: any = { columnId: targetColumnId };
          if (targetAssignedToId !== undefined) patchPayload.assignedToId = targetAssignedToId;
          
          await client.patch(`/kanban/items/${itemId}`, patchPayload);

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

  moveItemsBatch: async (itemIds, targetColumnId) => {
      if (itemIds.length === 0) return;
      try {
          await client.patch('/kanban/items/move-batch', { itemIds, targetColumnId });
          await get().fetchBoard();
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