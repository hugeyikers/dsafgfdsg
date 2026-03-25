import { create } from 'zustand';
import client from '../api/client';

export interface KanbanItem {
  id: number;
  content: string;
  order: number;
  columnId: number;
  rowId: number | null;
<<<<<<< HEAD
  assignedToId: number | null;
=======
  assignedToId?: number | null;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
  title?: string;
>>>>>>> 3fbcbef (adding working drag and drop)
  assignedTo?: {
      id: number;
      fullName: string;
      email: string;
  };
  color?: string;
  createdAt?: string;
  updatedAt?: string;
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
<<<<<<< HEAD
    limit: number;
=======
>>>>>>> 3fbcbef (adding working drag and drop)
    color?: string;
}

interface KanbanState {
  columns: KanbanColumn[];
  rows: KanbanRow[];
  isLoading: boolean;
  
  fetchBoard: () => Promise<void>;
  
<<<<<<< HEAD
  addColumn: (title: string, color?: string, limit?: number) => Promise<void>;
  updateColumn: (id: number, data: { title?: string, color?: string, order?: number, limit?: number }) => Promise<void>;
  removeColumn: (id: number, action?: 'delete_tasks' | 'move_tasks', targetColId?: number) => Promise<void>;
  reorderColumns: (startIndex: number, endIndex: number) => Promise<void>;
  
  addRow: (title: string, color?: string) => Promise<void>;
  updateRow: (id: number, data: { title?: string, color?: string, order?: number }) => Promise<void>;
  removeRow: (id: number, action?: 'delete_tasks' | 'move_tasks', targetRowId?: number | null) => Promise<void>;
  reorderRows: (startIndex: number, endIndex: number) => Promise<void>;

  // FIX: Używamy obiektu, aby nazwy zmiennych się nie pomieszały!
  addItem: (data: { columnId: number, rowId: number | null, title: string, content: string, color?: string, assignedToId?: number | null }) => Promise<void>;
=======
  addColumn: (title: string, color?: string) => Promise<void>;
  updateColumn: (id: number, data: { title?: string, color?: string }) => Promise<void>;
  removeColumn: (id: number, action?: 'delete_tasks' | 'move_tasks', targetColId?: number) => Promise<void>;
  
  addRow: (title: string, color?: string) => Promise<void>;
  updateRow: (id: number, data: { title?: string, color?: string }) => Promise<void>;
  removeRow: (id: number, action?: 'delete_tasks' | 'move_tasks', targetRowId?: number) => Promise<void>;

  addItem: (columnId: number, rowId: number | null, title: string, content: string) => Promise<void>;
>>>>>>> 3fbcbef (adding working drag and drop)
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
<<<<<<< HEAD
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

  // FIX: Odbieramy obiekt wysłany z KanbanBoard
  addItem: async (data) => {
    try { 
        await client.post('/kanban/items', data); 
=======
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
>>>>>>> 3fbcbef (adding working drag and drop)
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 3fbcbef (adding working drag and drop)
  }
}));