import { create } from 'zustand';
import client from '../api/client';

export interface KanbanItemSubTask {
    id: number;
    itemId: number;
    title: string;
    content: string;
    isDone: boolean;
}

export interface KanbanItem {
  id: number;
  title: string;
  content: string;
  order: number;
  columnId: number;
  rowId: number | null;
  assignedUsers?: { id: number, fullName: string, email: string }[];
  subtasks?: KanbanItemSubTask[];
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
    limit: number;
    color?: string;
}

interface KanbanState {
  columns: KanbanColumn[];
  rows: KanbanRow[];
  isLoading: boolean;
  
  fetchBoard: () => Promise<void>;
  
  addColumn: (title: string, color?: string, limit?: number) => Promise<void>;
  updateColumn: (id: number, data: { title?: string, color?: string, order?: number, limit?: number }) => Promise<void>;
  removeColumn: (id: number, action?: 'delete_tasks' | 'move_tasks', targetColId?: number) => Promise<void>;
  reorderColumns: (startIndex: number, endIndex: number) => Promise<void>;
  
  addRow: (title: string, color?: string) => Promise<void>;
  updateRow: (id: number, data: { title?: string, color?: string, order?: number }) => Promise<void>;
  removeRow: (id: number, action?: 'delete_tasks' | 'move_tasks', targetRowId?: number | null) => Promise<void>;
  reorderRows: (startIndex: number, endIndex: number) => Promise<void>;

  addItem: (data: { columnId: number, rowId: number | null, title: string, content: string, color?: string, assignedUsersIds?: number[] }) => Promise<void>;
  updateItem: (itemId: number, data: Partial<KanbanItem> & { assignedUsersIds?: number[] }) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  moveItem: (itemId: number, targetColumnId: number, targetRowId: number | null, targetIndex?: number) => Promise<void>; 

  addSubtask: (itemId: number, title: string) => Promise<void>;
  updateSubtask: (subtaskId: number, data: Partial<KanbanItemSubTask>) => Promise<void>;
  removeSubtask: (subtaskId: number) => Promise<void>;
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

  addItem: async (data) => {
    try { await client.post('/kanban/items', data); get().fetchBoard(); } catch (e) { console.error(e); }
  },

  updateItem: async (id, data) => {
      try { await client.patch(`/kanban/items/${id}`, data); get().fetchBoard(); } catch (e) { console.error(e); }
  },

  removeItem: async (id: number) => {
    try { await client.delete(`/kanban/items/${id}`); get().fetchBoard(); } catch (e) { console.error(e); }
  },

  moveItem: async (itemId, targetColumnId, targetRowId, targetIndex) => {
      let cellItemsToUpdate: any[] = [];

      set(state => {
          // WAŻNE: Głębokie klonowanie gwarantuje, że React zobaczy absolutnie każdą zmianę stanu
          // dzięki temu pozbywamy się "flickeringu" (wpadania z góry) z biblioteki DND
          const newColumns = state.columns.map(col => ({
              ...col,
              items: col.items.map(item => ({ ...item }))
          }));

          let movedItem: any = null;

          // 1. Znajdź i usuń item ze źródła
          for (let i = 0; i < newColumns.length; i++) {
              const idx = newColumns[i].items.findIndex(it => it.id === itemId);
              if (idx !== -1) {
                  movedItem = { ...newColumns[i].items[idx], columnId: targetColumnId, rowId: targetRowId };
                  newColumns[i].items.splice(idx, 1);
                  break;
              }
          }

          if (movedItem) {
              const targetColIndex = newColumns.findIndex(c => c.id === targetColumnId);
              if (targetColIndex !== -1) {
                  const targetItems = newColumns[targetColIndex].items;

                  // 2. Filtruj elementy
                  const cellItems = targetItems.filter(it => it.rowId === targetRowId);
                  const otherItems = targetItems.filter(it => it.rowId !== targetRowId);

                  // Uporządkuj elementy zanim wykonasz splice
                  cellItems.sort((a, b) => (a.order || 0) - (b.order || 0));

                  // 3. Wstaw element w nowe miejsce (np. z dołu na górę)
                  if (targetIndex !== undefined && targetIndex !== null) {
                      cellItems.splice(targetIndex, 0, movedItem);
                  } else {
                      cellItems.push(movedItem);
                  }

                  // 4. Przelicz 'order' przypisując NOWE obiekty, co natychmiastowo synchronizuje stan z Reactem
                  const updatedCellItems = cellItems.map((item, idx) => ({
                      ...item,
                      order: idx
                  }));

                  cellItemsToUpdate = updatedCellItems; 
                  newColumns[targetColIndex].items = [...otherItems, ...updatedCellItems];
              }
              return { columns: newColumns };
          }
          return state;
      });

      try {
          if (cellItemsToUpdate.length > 0) {
              // Aktualizuj wszystko po kolei na serwerze
              await Promise.all(cellItemsToUpdate.map(item => {
                  if (item.id === itemId) {
                      return client.patch(`/kanban/items/${item.id}`, { 
                          columnId: targetColumnId, 
                          rowId: targetRowId, 
                          order: item.order 
                      });
                  }
                  return client.patch(`/kanban/items/${item.id}`, { order: item.order });
              }));
          }
      } catch (e) { 
          console.error("Move error:", e); 
          get().fetchBoard(); // Fallback w razie wyrzucenia błędu po stronie backendu
      }
  },

  addSubtask: async (itemId, title) => {
      try { await client.post('/kanban/subtasks', { itemId, title, content: 'none' }); get().fetchBoard(); } catch (e) { console.error(e); }
  },

  updateSubtask: async (subtaskId, data) => {
      try { await client.patch(`/kanban/subtasks/${subtaskId}`, data); get().fetchBoard(); } catch (e) { console.error(e); }
  },

  removeSubtask: async (subtaskId) => {
      try { await client.delete(`/kanban/subtasks/${subtaskId}`); get().fetchBoard(); } catch (e) { console.error(e); }
  }
}));