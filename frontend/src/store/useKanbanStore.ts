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
  
  addColumn: (title: string, color?: string) => Promise<void>;
  updateColumn: (id: number, data: { title?: string, color?: string }) => Promise<void>;
  removeColumn: (id: number, action?: 'delete_tasks' | 'move_tasks', targetColId?: number) => Promise<void>;
  
  addRow: (title: string, color?: string) => Promise<void>;
  updateRow: (id: number, data: { title?: string, color?: string }) => Promise<void>;
  removeRow: (id: number, action?: 'delete_tasks' | 'move_tasks', targetRowId?: number) => Promise<void>;

  addItem: (columnId: number, rowId: number | null, title: string, content: string) => Promise<void>;
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
      set({ 
          columns: res.data.columns || [], 
          rows: res.data.rows || [] 
      });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  addColumn: async (title, color) => { try { await client.post('/kanban/columns', { title, color }); get().fetchBoard(); } catch (e) { console.error(e); } },
  updateColumn: async (id, data) => { try { await client.patch(`/kanban/columns/${id}`, data); get().fetchBoard(); } catch (e) { console.error(e); } },
  removeColumn: async (id, action, targetColId) => { try { await client.delete(`/kanban/columns/${id}`, { data: { action, targetColId } }); get().fetchBoard(); } catch (e) { console.error(e); } },

  addRow: async (title, color) => { try { await client.post('/kanban/rows', { title, color }); get().fetchBoard(); } catch (e) { console.error(e); } },
  updateRow: async (id, data) => { try { await client.patch(`/kanban/rows/${id}`, data); get().fetchBoard(); } catch (e) { console.error(e); } },
  removeRow: async (id, action, targetRowId) => { try { await client.delete(`/kanban/rows/${id}`, { data: { action, targetRowId } }); get().fetchBoard(); } catch (e) { console.error(e); } },

  addItem: async (columnId, rowId, title, content) => {
    try { 
        await client.post('/kanban/items', { columnId, rowId, title, content }); 
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
      // 1. KULOODPORNY OPTYMISTYCZNY UPDATE (Głęboka kopia)
      set(state => {
          const newColumns = JSON.parse(JSON.stringify(state.columns));
          let movedItem = null;

          // Szukamy i wycinamy taska ze starego miejsca
          for (const col of newColumns) {
              const itemIndex = col.items.findIndex((i: any) => i.id === itemId);
              if (itemIndex !== -1) {
                  movedItem = col.items.splice(itemIndex, 1)[0];
                  break;
              }
          }

          // Aktualizujemy dane taska i wrzucamy do nowej kolumny
          if (movedItem) {
              movedItem.columnId = targetColumnId;
              movedItem.rowId = targetRowId;
              
              const targetCol = newColumns.find((c: any) => c.id === targetColumnId);
              if (targetCol) {
                  targetCol.items.push(movedItem);
              }
          }

          return { columns: newColumns };
      });

      // 2. WYSYŁKA DO NEST.JS I WYŁAPANIE BŁĘDU
      try {
          await client.patch(`/kanban/items/${itemId}`, { columnId: targetColumnId, rowId: targetRowId });
          get().fetchBoard(); 
      } catch (e: any) { 
          // TEN ALERT POKAŻE CI, ŻE TO BACKEND BLOKUJE AKCJĘ!
          alert(`Uwaga: Backend odrzucił przeniesienie!\nZajrzyj w konsolę (F12) w przeglądarce i terminal NestJS, aby sprawdzić dlaczego.\n\nBłąd: ${e.message}`);
          console.error("Szczegóły błędu backendu:", e); 
          // Cofamy UI do stanu z bazy (to dlatego wcześniej miałeś iluzję, że przeciąganie nie działa)
          get().fetchBoard(); 
      }
  }
}));