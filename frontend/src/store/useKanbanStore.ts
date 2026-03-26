import { create } from 'zustand';
import client from '../api/client';

export interface KanbanItem {
  id: number;
  content: string;
  order: number;
  columnId: number;
  rowId: number | null;
  assignedToId?: number | null;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
  title?: string;
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
  color?: string;
  items: KanbanItem[];
}

export interface KanbanRow {
    id: number;
    title: string;
    order: number;
    color?: string;
}

interface KanbanState {
  columns: KanbanColumn[];
  rows: KanbanRow[];
  isLoading: boolean;
  
  fetchBoard: () => Promise<void>;
  
  // Zaktualizowano addColumn i updateColumn o obsługę 'limit'
  addColumn: (title: string, color?: string, limit?: number) => Promise<void>;
  updateColumn: (id: number, data: { title?: string, color?: string, order?: number, limit?: number }) => Promise<void>;
  removeColumn: (id: number, action?: 'delete_tasks' | 'move_tasks', targetColId?: number) => Promise<void>;
  reorderColumns: (startIndex: number, endIndex: number) => Promise<void>;
  
  addRow: (title: string, color?: string) => Promise<void>;
  updateRow: (id: number, data: { title?: string, color?: string, order?: number }) => Promise<void>;
  removeRow: (id: number, action?: 'delete_tasks' | 'move_tasks', targetRowId?: number | null) => Promise<void>;
  reorderRows: (startIndex: number, endIndex: number) => Promise<void>;

  addItem: (columnId: number, rowId: number | null, title: string, content: string, color?: string, assignedToId?: number | null) => Promise<void>;
  updateItem: (itemId: number, data: Partial<KanbanItem>) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  
  moveItem: (itemId: number, targetColumnId: number, targetRowId: number | null) => Promise<void>; 
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: [],
  rows: [],
  isLoading: false,

  fetchBoard: async () => {
    set({ isLoading: true });
    try {
      const res = await client.get('/kanban/all');
      set({ columns: res.data.columns || [], rows: res.data.rows || [] });
    } catch (e) { console.error(e); } finally { set({ isLoading: false }); }
  },

  addColumn: async (title, color, limit = 0) => { try { await client.post('/kanban/columns', { title, color, limit }); get().fetchBoard(); } catch (e) { console.error(e); } },
  updateColumn: async (id, data) => { try { await client.patch(`/kanban/columns/${id}`, data); get().fetchBoard(); } catch (e) { console.error(e); } },
  
  removeColumn: async (id, action, targetColId) => { 
      try { 
          if (action === 'move_tasks' && targetColId !== undefined) {
              const col = get().columns.find(c => c.id === id);
              if (col && col.items.length > 0) {
                  await Promise.all(col.items.map(item => client.patch(`/kanban/items/${item.id}`, { columnId: targetColId })));
              }
          }
          await client.delete(`/kanban/columns/${id}`); 
          get().fetchBoard(); 
      } catch (e) { console.error(e); } 
  },
  
  reorderColumns: async (startIndex, endIndex) => {
    set(state => {
        const result = Array.from(state.columns);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        const updated = result.map((col, index) => ({ ...col, order: index }));
        return { columns: updated };
    });
    try {
        const { columns } = get();
        await Promise.all(columns.map(col => client.patch(`/kanban/columns/${col.id}`, { order: col.order })));
    } catch(e) { console.error(e); get().fetchBoard(); }
  },

  addRow: async (title, color) => { try { await client.post('/kanban/rows', { title, color }); get().fetchBoard(); } catch (e) { console.error(e); } },
  updateRow: async (id, data) => { try { await client.patch(`/kanban/rows/${id}`, data); get().fetchBoard(); } catch (e) { console.error(e); } },
  
  removeRow: async (id, action, targetRowId) => { 
      try { 
          if (action === 'move_tasks') {
              const tasksToMove = get().columns.flatMap(c => c.items.filter(i => i.rowId === id));
              if (tasksToMove.length > 0) {
                  await Promise.all(tasksToMove.map(item => client.patch(`/kanban/items/${item.id}`, { rowId: targetRowId })));
              }
          }
          await client.delete(`/kanban/rows/${id}`); 
          get().fetchBoard(); 
      } catch (e) { console.error(e); } 
  },
  
  reorderRows: async (startIndex, endIndex) => {
    set(state => {
        const result = Array.from(state.rows);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        const updated = result.map((row, index) => ({ ...row, order: index }));
        return { rows: updated };
    });
    try {
        const { rows } = get();
        await Promise.all(rows.map(row => client.patch(`/kanban/rows/${row.id}`, { order: row.order })));
    } catch(e) { console.error(e); get().fetchBoard(); }
  },

  addItem: async (columnId, rowId, title, content, color, assignedToId) => {
    try { 
        await client.post('/kanban/items', { columnId, rowId, title: title, content: content, color, assignedToId }); 
        get().fetchBoard(); 
    } catch (e) { console.error(e); }
  },

  updateItem: async (id, data) => {
      try { await client.patch(`/kanban/items/${id}`, data); get().fetchBoard(); } catch (e) { console.error(e); }
  },

  removeItem: async (id: number) => {
    try { await client.delete(`/kanban/items/${id}`); get().fetchBoard(); } catch (e) { console.error(e); }
  },

  moveItem: async (itemId, targetColumnId, targetRowId) => {
      set(state => {
          let movedItem: any = null;
          const newColumns = state.columns.map(col => {
              const itemToMove = col.items.find(i => i.id === itemId);
              if (itemToMove) {
                  movedItem = { ...itemToMove, columnId: targetColumnId, rowId: targetRowId };
                  return { ...col, items: col.items.filter(i => i.id !== itemId) };
              }
              return col;
          });
          if (movedItem) {
              return { columns: newColumns.map(col => col.id === targetColumnId ? { ...col, items: [...col.items, movedItem] } : col ) };
          }
          return state;
      });

      try {
          await client.patch(`/kanban/items/${itemId}`, { columnId: targetColumnId, rowId: targetRowId });
          get().fetchBoard(); 
      } catch (e) { console.error("Move error:", e); get().fetchBoard(); }
  }
}));