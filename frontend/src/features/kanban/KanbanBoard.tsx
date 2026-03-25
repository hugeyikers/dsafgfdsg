// frontend/src/features/kanban/KanbanBoard.tsx
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Plus, Trash2, X, AlertCircle, Edit2, Check, AlignJustify, GripHorizontal, GripVertical, Lock } from 'lucide-react';

const KanbanBoard = () => {
    // Dane z Twojego useKanbanStore
    const { 
        columns, rows, fetchBoard, 
        addColumn, updateColumn, removeColumn, reorderColumns,
        addRow, updateRow, removeRow, reorderRows,
        addItem, moveItem 
    } = useKanbanStore();
    const { fetchUsers } = useUserStore();
    
    // Stany UI do edycji kolumn/wierszy
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColTitle, setNewColTitle] = useState('');
    const [editingColId, setEditingColId] = useState<number | null>(null);
    const [tempColTitle, setTempColTitle] = useState('');
    const [tempColLimit, setTempColLimit] = useState(0);

    const [isAddingRow, setIsAddingRow] = useState(false);
    const [newRowTitle, setNewRowTitle] = useState('');
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [tempRowTitle, setTempRowTitle] = useState('');

    // Szybkie dodawanie zadania (Tytuł!)
    const [addingToCell, setAddingToCell] = useState<{colId: number, rowId: number | null} | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState(''); 

    useEffect(() => {
        fetchBoard();
        fetchUsers();
    }, []);

    const startEditingColumn = (col: any) => {
        setEditingColId(col.id);
        setTempColTitle(col.title);
        setTempColLimit(col.limit || 0);
    };

    const handleSaveColumn = async () => {
        if (editingColId !== null && tempColTitle.trim()) {
            await updateColumn(editingColId, { title: tempColTitle, limit: tempColLimit });
            setEditingColId(null);
        }
    };

    const handleAddColumn = async () => {
        if (!newColTitle.trim()) return;
        await addColumn(newColTitle);
        setNewColTitle('');
        setIsAddingColumn(false);
    };

    const startEditingRow = (row: any) => {
        setEditingRowId(row.id);
        setTempRowTitle(row.title);
    };

    const handleSaveRow = async () => {
        if (editingRowId !== null && tempRowTitle.trim()) {
            await updateRow(editingRowId, { title: tempRowTitle });
            setEditingRowId(null);
        }
    };

    const handleAddRow = async () => {
        if (!newRowTitle.trim()) return;
        await addRow(newRowTitle);
        setNewRowTitle('');
        setIsAddingRow(false);
    };

    // WYODRĘBNIENIE KOLUMN - Backlog stały
    const backlogColumn = columns.find(c => c.title.toLowerCase() === 'backlog');
    const draggableColumns = columns.filter(c => c.title.toLowerCase() !== 'backlog');

    const handleDragEnd = (result: any) => {
        const { destination, source, draggableId, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        // 1. Zmiana kolejności KOLUMN
        if (type === 'column') {
            const newColIds = draggableColumns.map(c => c.id);
            const [removed] = newColIds.splice(source.index, 1);
            newColIds.splice(destination.index, 0, removed);
            if (backlogColumn) newColIds.unshift(backlogColumn.id); // Backlog na 1 miejsce
            reorderColumns(newColIds);
            return;
        }

        // 2. Zmiana kolejności WIERSZY (Kategorii)
        if (type === 'row') {
            const newRowIds = Array.from(rows).map(r => r.id);
            const [removed] = newRowIds.splice(source.index, 1);
            newRowIds.splice(destination.index, 0, removed);
            reorderRows(newRowIds);
            return;
        }

        // 3. Zmiana przypisania ZADANIA (col-X-row-Y lub col-X-row-null)
        if (destination.droppableId.startsWith('col-')) {
            const itemId = parseInt(draggableId.split('-')[1]);
            const destParts = destination.droppableId.split('-');
            const targetColId = parseInt(destParts[1]);
            const targetRowIdStr = destParts[3];
            
            const targetRowId = targetRowIdStr === 'null' ? null : parseInt(targetRowIdStr);
            const sourceParts = source.droppableId.split('-');
            const sourceColId = parseInt(sourceParts[1]);
            
            moveItem(itemId, sourceColId, targetColId, targetRowId, source.index, destination.index);
        }
    };

    const handleAddTask = async (colId: number, rowId: number | null) => {
        if (!newTaskTitle.trim()) return;
        await addItem(colId, newTaskTitle, '', rowId, undefined);
        setNewTaskTitle('');
        setAddingToCell(null);
    };

    const getItems = (colId: number, rowId: number | null) => {
        const col = columns.find(c => c.id === colId);
        if (!col) return [];
        return col.items.filter(item => {
            if (rowId === null) return item.rowId === null || item.rowId === undefined;
            return item.rowId === rowId;
        });
    };

    // --- FUNKCJA RENDERUJĄCA KOMÓRKĘ ZADANIA (Estetyczna, czysta) ---
    const renderCell = (col: any, rowId: number | null) => {
        const items = getItems(col.id, rowId);
        const droppableId = `col-${col.id}-row-${rowId}`; 
        
        return (
            <Droppable key={droppableId} droppableId={droppableId}>
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef} {...provided.droppableProps}
                        className={`w-80 flex-shrink-0 p-3 border-r border-dashed border-gray-200 transition-colors duration-200 flex flex-col gap-3 relative group/cell
                            ${snapshot.isDraggingOver ? 'bg-purple-50/50 border-purple-200' : 'bg-transparent'}
                            ${rowId === null ? 'bg-gray-50/30' : ''}
                        `}
                    >
                        {items.map((item, idx) => (
                            <Task key={item.id} item={item} index={idx} />
                        ))}
                        {provided.placeholder}
                        
                        {/* Formularz szybkiego dodawania zadania (Tytuł!) */}
                        {addingToCell?.colId === col.id && addingToCell?.rowId === rowId ? (
                            <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-lg animate-in fade-in zoom-in duration-200">
                                <textarea 
                                    autoFocus 
                                    className="w-full text-sm font-bold outline-none resize-none mb-2 bg-transparent text-gray-800" 
                                    placeholder="Tytuł zadania..." 
                                    rows={2}
                                    value={newTaskTitle} 
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddTask(col.id, rowId); } }}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setAddingToCell(null)} className="p-1 text-gray-400 hover:text-red-500 rounded bg-gray-50 hover:bg-red-100 transition-colors"><X size={14}/></button>
                                    <button onClick={() => handleAddTask(col.id, rowId)} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-md hover:bg-purple-700 transition-colors">Dodaj</button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setAddingToCell({colId: col.id, rowId: rowId})}
                                className={`mt-auto w-full py-2 flex items-center justify-center gap-2 rounded-lg transition-all 
                                    ${rowId === null ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200 opacity-50 hover:opacity-100' : 'text-gray-300 hover:text-purple-600 hover:bg-purple-50 opacity-0 group-hover/cell:opacity-100'}
                                `}
                            >
                                <Plus size={16} /> <span className="text-xs font-bold">Dodaj zadanie</span>
                            </button>
                        )}
                    </div>
                )}
            </Droppable>
        );
    }

    // --- PASEK DODAWANIA (Pod pastelowy klimat fioletu) ---
    const renderAddRowBar = () => (
        <div className="h-16 flex items-center justify-between px-6 bg-purple-50 border border-purple-100 rounded-2xl shadow-inner mb-6">
            <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2.5">
                <AlignJustify size={16} className="text-purple-400"/>
                Zarządzanie kategoriami zadań (Swimlanes)
            </h4>
            {isAddingRow ? (
                <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-purple-200 shadow-sm animate-in fade-in duration-200">
                    <input autoFocus value={newRowTitle} onChange={e => setNewRowTitle(e.target.value)} placeholder="Wpisz nazwę kategorii..." className="px-4 py-1.5 text-sm outline-none w-56"/>
                    <button onClick={handleAddRow} className="p-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"><Plus size={16}/></button>
                    <button onClick={() => setIsAddingRow(false)} className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><X size={16}/></button>
                </div>
            ) : (
                <button onClick={() => setIsAddingRow(true)} className="flex items-center gap-2 px-5 py-2 text-purple-700 bg-purple-100/50 rounded-full hover:bg-purple-100 font-bold text-sm transition-colors border border-purple-200 shadow-sm">
                    <Plus size={16} /> Dodaj nową kategorię
                </button>
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col w-full overflow-hidden bg-white">
            
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-auto p-8 pt-6 bg-slate-50">
                    
                    {renderAddRowBar()}

                    <div className="inline-block min-w-full pb-10 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        
                        {/* WIERSZ NAGŁÓWKOWY (Kolumny) */}
                        <div className="flex sticky top-0 z-30 shadow-sm border-b border-gray-100 mb-2 bg-white backdrop-blur-sm bg-white/90">
                             <div className="w-56 flex-shrink-0 p-5 font-bold text-slate-700 uppercase text-xs tracking-wider flex items-center bg-gray-50 border-r border-gray-200 z-40">
                                 Kategorie (Wiersze)
                             </div>
                             
                             {/* Sztywny BACKLOG (Zgodnie z wymaganiem: Zablokowany) */}
                             {backlogColumn && (
                                 <div className="w-80 flex-shrink-0 p-5 border-r border-gray-100 flex items-center group min-h-[57px] bg-slate-100 z-30 relative">
                                     <div className="flex-1 flex justify-between items-center overflow-hidden">
                                        {editingColId === backlogColumn.id ? (
                                            <div className="flex flex-col gap-2 w-full animate-in fade-in duration-150">
                                                <input autoFocus className="border-2 border-purple-300 rounded-lg px-2 py-1 text-sm font-bold w-full outline-none" value={tempColTitle} onChange={e => setTempColTitle(e.target.value)} />
                                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                    <span>Limit:</span>
                                                    <input type="number" className="border border-gray-300 rounded px-2 py-1 text-xs w-16" value={tempColLimit} onChange={e => setTempColLimit(parseInt(e.target.value) || 0)} min="0"/>
                                                    <div className="flex ml-auto gap-1">
                                                        <button onClick={handleSaveColumn} className="p-1 text-green-600 bg-green-50 rounded"><Check size={14}/></button>
                                                        <button onClick={() => setEditingColId(null)} className="p-1 text-red-500 bg-red-50 rounded"><X size={14}/></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3 overflow-hidden mr-2">
                                                    <Lock size={15} className="text-slate-400 opacity-50"/>
                                                    <span className="font-bold truncate text-slate-700">{backlogColumn.title}</span>
                                                    <span className="text-xs ml-0 font-normal text-slate-400">
                                                        {backlogColumn.items.length} / {backlogColumn.limit > 0 ? backlogColumn.limit : '∞'}
                                                    </span>
                                                </div>
                                                <button onClick={() => startEditingColumn(backlogColumn)} className="text-gray-400 hover:text-purple-600 p-1 opacity-0 group-hover:opacity-100"><Edit2 size={16} /></button>
                                            </>
                                        )}
                                     </div>
                                 </div>
                             )}

                             {/* Ruchome KOLUMNY */}
                             <Droppable droppableId="board-columns" direction="horizontal" type="column">
                                 {(provided) => (
                                     <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-1">
                                         {draggableColumns.map((col, index) => {
                                             const isLimitExceeded = col.limit > 0 && col.items.length > col.limit;

                                             return (
                                                <Draggable key={`col-${col.id}`} draggableId={`col-${col.id}`} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div 
                                                            ref={provided.innerRef} {...provided.draggableProps}
                                                            className={`w-80 flex-shrink-0 p-5 border-r border-gray-100 flex items-center group min-h-[57px] transition-colors
                                                                ${isLimitExceeded ? 'bg-red-50' : 'bg-white'}
                                                                ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-purple-500 z-50 bg-white rotate-2' : ''}
                                                            `}
                                                        >
                                                            <div {...provided.dragHandleProps} className="mr-3 text-gray-300 hover:text-purple-500 cursor-grab opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
                                                                <GripHorizontal size={18} />
                                                            </div>

                                                            <div className="flex-1 flex justify-between items-center overflow-hidden">
                                                                {editingColId === col.id ? (
                                                                    <div className="flex flex-col gap-2 w-full animate-in fade-in duration-150">
                                                                        <input autoFocus className="border-2 border-purple-300 rounded-lg px-2 py-1 text-sm font-bold w-full outline-none focus:border-purple-500" value={tempColTitle} onChange={e => setTempColTitle(e.target.value)} />
                                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                            <span>Limit:</span>
                                                                            <input type="number" className="border border-gray-300 rounded px-2 py-1 text-xs w-16" value={tempColLimit} onChange={e => setTempColLimit(parseInt(e.target.value) || 0)} min="0"/>
                                                                            <div className="flex ml-auto gap-1">
                                                                                <button onClick={handleSaveColumn} className="p-1 text-green-600 bg-green-50 rounded"><Check size={14}/></button>
                                                                                <button onClick={() => setEditingColId(null)} className="p-1 text-red-500 bg-red-50 rounded"><X size={14}/></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex flex-col overflow-hidden mr-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`font-bold truncate ${isLimitExceeded ? 'text-red-600' : 'text-slate-700'}`} title={col.title}>{col.title}</span>
                                                                                {isLimitExceeded && <AlertCircle size={16} className="text-red-500 flex-shrink-0 animate-pulse" />}
                                                                            </div>
                                                                            <span className={`text-xs ml-0 font-normal whitespace-nowrap flex items-center gap-1 ${isLimitExceeded ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                                                                {col.items.length} / {col.limit > 0 ? col.limit : '∞'}
                                                                            </span>
                                                                        </div>
                                                                        <div className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 ${isLimitExceeded ? 'bg-red-50' : 'bg-white'}`}>
                                                                            <button onClick={() => startEditingColumn(col)} className="text-gray-400 hover:text-purple-600 p-1"><Edit2 size={16} /></button>
                                                                            <button onClick={() => { if(window.confirm('Usunąć kolumnę? Zadania pozostaną w innych kategoriach.')) removeColumn(col.id) }} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                             );
                                         })}
                                         {provided.placeholder}
                                         
                                         {/* Przycisk dodawania nowej kolumny */}
                                         {isAddingColumn ? (
                                             <div className="flex items-center gap-2 p-3 bg-gray-50 border border-purple-200 shadow-inner rounded-xl h-[47px] m-1 mt-1 animate-in fade-in duration-150">
                                                <input autoFocus value={newColTitle} onChange={e => setNewColTitle(e.target.value)} placeholder="Wpisz nazwę kolumny..." className="px-3 py-1.5 text-sm outline-none w-48"/>
                                                <button onClick={handleAddColumn} className="p-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"><Plus size={16}/></button>
                                                <button onClick={() => setIsAddingColumn(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><X size={16}/></button>
                                             </div>
                                         ) : (
                                             <button onClick={() => setIsAddingColumn(true)} className="flex items-center gap-2.5 px-6 py-2.5 text-purple-700 hover:bg-purple-50 font-bold text-sm transition-colors flex-shrink-0 border border-transparent hover:border-purple-100 rounded-2xl">
                                                <Plus size={18}/> Dodaj kolumnę
                                             </button>
                                         )}
                                     </div>
                                 )}
                             </Droppable>
                        </div>

                        {/* WIERSZ NA ZADANIA NIEPRZYPISANE (Zgodnie ze szkicem: Na górze!) */}
                        <div className="flex min-h-[140px] bg-gray-50/50 group border-b border-dashed border-gray-100 mb-5 relative">
                            <div className="w-56 flex-shrink-0 p-5 border-r border-gray-100 flex flex-col justify-center sticky left-0 z-20 bg-gray-100">
                                <span className="font-bold text-xs uppercase text-slate-500 flex items-center gap-2">
                                    <AlertCircle size={14}/> Bez kategorii
                                </span>
                            </div>
                            
                            {backlogColumn && renderCell(backlogColumn, null)}
                            {draggableColumns.map(col => renderCell(col, null))}
                        </div>

                        {/* PRAWDZIWE WIERSZE (Kategorie - Przesuwalne wertykalnie) */}
                        <Droppable droppableId="board-rows" direction="vertical" type="row">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col">
                                    {rows.map((row, index) => (
                                        <Draggable key={`row-${row.id}`} draggableId={`row-${row.id}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef} {...provided.draggableProps}
                                                    className={`flex min-h-[160px] border-b border-dashed border-gray-100 group hover:bg-slate-50/50 transition-colors
                                                        ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500 z-40 bg-white rotate-1' : ''}
                                                    `}
                                                >
                                                    {/* Nagłówek wiersza */}
                                                    <div className="w-56 flex-shrink-0 p-5 border-r border-gray-100 bg-white sticky left-0 z-20 flex flex-col justify-center relative pl-10 group/rowheader">
                                                        <div {...provided.dragHandleProps} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-500 cursor-grab p-1.5 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
                                                            <GripVertical size={18}/>
                                                        </div>

                                                        {editingRowId === row.id ? (
                                                            <div className="flex flex-col gap-2 w-full animate-in fade-in duration-150">
                                                                <input autoFocus className="border-2 border-indigo-300 rounded-lg px-2 py-1 text-sm font-bold w-full outline-none" value={tempRowTitle} onChange={e => setTempRowTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveRow()} />
                                                                <div className="flex ml-auto gap-1">
                                                                    <button onClick={handleSaveRow} className="p-1 text-green-600 bg-green-50 rounded"><Check size={14}/></button>
                                                                    <button onClick={() => setEditingRowId(null)} className="p-1 text-red-500 bg-red-50 rounded"><X size={14}/></button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-sm text-gray-900 break-words leading-snug" title={row.title}>{row.title}</span>
                                                                <div className="flex gap-1 opacity-0 group-hover/rowheader:opacity-100 transition-opacity flex-shrink-0 ml-1">
                                                                    <button onClick={() => startEditingRow(row)} className="text-gray-400 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50"><Edit2 size={14}/></button>
                                                                    <button onClick={() => { if(window.confirm('Usunąć kategorię permanentnie? Zadania z niej zostaną nieprzypisane.')) removeRow(row.id) }} className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50"><Trash2 size={14}/></button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Komórki Wiersza */}
                                                    {backlogColumn && renderCell(backlogColumn, row.id)}
                                                    {draggableColumns.map(col => renderCell(col, row.id))}

                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                    </div>
                </div>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;