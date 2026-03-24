import { create } from 'zustand';
import client from '../api/client';

export interface KanbanItem {
  id: number;
  title: string;
  content: string;
  order: number;
  columnId: number;
  rowId?: number | null;
  assignedToId?: number | null;
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

export interface KanbanRow {
  id: number;
  title: string;
  order: number;
  limit?: number;
}

interface KanbanState {
  columns: KanbanColumn[];
  rows: KanbanRow[]; // DODANO Wiersze
  isLoading: boolean;
  selectedItems: number[]; 
  
  fetchBoard: () => Promise<void>;
  
  addColumn: (title: string, limit?: number) => Promise<void>;
  updateColumn: (id: number, data: { title?: string, limit?: number }) => Promise<void>;
  removeColumn: (id: number) => Promise<void>;

  addRow: (title: string, limit?: number) => Promise<void>;
  updateRow: (id: number, data: { title?: string, limit?: number }) => Promise<void>;
  removeRow: (id: number) => Promise<void>;
  
  addItem: (columnId: number, title: string, content?: string, rowId?: number | null, assignedToId?: number | null) => Promise<void>;
  updateItem: (itemId: number, data: Partial<KanbanItem>) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  
  moveItem: (itemId: number, sourceColId: number, targetColId: number, targetRowId: number | null, sourceIndex: number, destIndex: number) => Promise<void>; 
  
  toggleSelection: (itemId: number) => void;
  clearSelection: () => void;
  reorderColumns: (newOrderIds: number[]) => Promise<void>;
  reorderRows: (newOrderIds: number[]) => Promise<void>;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: [],
  rows: [],
  isLoading: false,
  selectedItems: [],

  fetchBoard: async () => {
    set({ isLoading: true });
    try {
      // Backend zwraca teraz { columns, rows } w nowym layoucie
      const res = await client.get('/kanban/all');
      set({ columns: res.data.columns, rows: res.data.rows });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  addColumn: async (title, limit = 0) => {
    try {
      await client.post('/kanban/columns', { title, limit: Number(limit) });
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

  addRow: async (title, limit = 0) => {
    try {
      await client.post('/kanban/rows', { title, limit: Number(limit) });
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  updateRow: async (id, data) => {
    try {
      await client.patch(`/kanban/rows/${id}`, data);
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  removeRow: async (id) => {
    try {
      await client.delete(`/kanban/rows/${id}`);
      get().fetchBoard();
    } catch (e) {
      console.error(e);
    }
  },

  addItem: async (columnId, title, content = '', rowId, assignedToId) => {
    try {
        await client.post('/kanban/items', { columnId, title, content, rowId, assignedToId });
        get().fetchBoard();
    } catch (e) {
        console.error(e);
    }
  },

  updateItem: async (id, data) => {
      try {
          await client.patch(`/kanban/items/${id}`, data);
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

  reorderRows: async (rowIds: number[]) => {
    try {
      const currentRows = get().rows;
      const reorderedRows = rowIds.map(id => currentRows.find(r => r.id === id)!).filter(Boolean);
      set({ rows: reorderedRows });

      await client.patch('/kanban/rows/reorder', { rowIds });
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

  moveItem: async (itemId, sourceColId, targetColId, targetRowId, sourceIndex, destIndex) => {
      // 1. Zapisz obecny stan, aby móc go cofnąć w razie błędu API
      const previousColumns = get().columns;

      // 2. Optymistyczna aktualizacja UI (wykonuje się natychmiast)
      set(state => {
          // Tworzymy płytką kopię kolumn i ich elementów
          const newCols = state.columns.map(c => ({ ...c, items: [...c.items] }));
          let movedItem: KanbanItem | undefined;

          // Wyciągamy zadanie z oryginalnej kolumny
          const sourceCol = newCols.find(c => c.id === sourceColId);
          if (sourceCol) {
              const itemIndex = sourceCol.items.findIndex(i => i.id === itemId);
              if (itemIndex !== -1) {
                  [movedItem] = sourceCol.items.splice(itemIndex, 1);
              }
          }

          if (movedItem) {
              // Zmieniamy przynależność zadania
              movedItem.columnId = targetColId;
              movedItem.rowId = targetRowId;

              // Wstawiamy w odpowiednie miejsce w nowej kolumnie
              const destCol = newCols.find(c => c.id === targetColId);
              if (destCol) {
                  // Filtrujemy by znaleźć rzeczywiste miejsce upuszczenia (w danej "komórce")
                  const filteredItems = destCol.items.filter(i => 
                      targetRowId === null ? (i.rowId === null || i.rowId === undefined) : i.rowId === targetRowId
                  );
                  const targetRef = filteredItems[destIndex];
                  
                  let insertIndex = destCol.items.length;
                  if (targetRef) {
                      insertIndex = destCol.items.findIndex(i => i.id === targetRef.id);
                  } else if (destIndex === 0) {
                      insertIndex = 0;
                  }

                  destCol.items.splice(insertIndex, 0, movedItem);
              }
          }

          return { columns: newCols };
      });

      // 3. Request do API w tle
      try {
          const patchPayload: any = { columnId: targetColId };
          if (targetRowId !== undefined) patchPayload.rowId = targetRowId;
          
          await client.patch(`/kanban/items/${itemId}`, patchPayload);
          // Cichy fetch, by zsynchronizować ewentualne inne dane
          get().fetchBoard();
      } catch (e) {
          console.error("Błąd zapisu kolejności:", e);
          // Revert - w razie błędu cofamy klocek na stare miejsce
          set({ columns: previousColumns });
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