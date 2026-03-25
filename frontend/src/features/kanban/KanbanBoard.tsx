import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Plus, Trash2, Edit2, X } from 'lucide-react'; // Dodano X do importów

const KanbanBoard = () => {
    const { columns, rows, fetchBoard, addColumn, addRow, moveItem, removeColumn, removeRow, updateColumn, updateRow, addItem } = useKanbanStore();
    const { fetchUsers } = useUserStore();
    
    const [deletePrompt, setDeletePrompt] = useState<{type: 'column'|'row', id: number, hasItems: boolean} | null>(null);

    // Stan do dodawania nowego zadania w konkretnej komórce
    const [addingToCell, setAddingToCell] = useState<{colId: number, rowId: number | null} | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskContent, setNewTaskContent] = useState('');

    useEffect(() => {
        fetchBoard();
        fetchUsers();
    }, []);

    const handleDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;
        
        // 1. Jeśli upuszczono poza tablicą
        if (!destination) return;
        
        // 2. Jeśli upuszczono dokładnie w tej samej komórce (ignorujemy, bo backend nie ma obsługi sortowania 'order')
        if (destination.droppableId === source.droppableId) return;
        
        // 3. Właściwe przeniesienie do innej komórki
        if (destination.droppableId.startsWith('cell-')) {
            const itemId = parseInt(draggableId.split('-')[1]);
            const destParts = destination.droppableId.split('-');
            const targetColId = parseInt(destParts[1]);
            const targetRowId = destParts[2] === 'null' ? null : parseInt(destParts[2]);
            
            moveItem(itemId, targetColId, targetRowId);
        }
    };

    const handleDeleteAttempt = (type: 'column'|'row', id: number, hasItems: boolean) => {
        if (!hasItems) {
            if (window.confirm(`Czy na pewno chcesz usunąć ten ${type === 'column' ? 'kolumnę' : 'wiersz'}?`)) {
                type === 'column' ? removeColumn(id) : removeRow(id);
            }
        } else {
            setDeletePrompt({ type, id, hasItems });
        }
    };

    const handleAddTask = async (colId: number, rowId: number | null) => {
        const finalTitle = newTaskTitle.trim() || 'brak';
        const finalContent = newTaskContent.trim() || 'brak';
        
        await addItem(colId, rowId, finalTitle, finalContent);
        
        setNewTaskTitle('');
        setNewTaskContent('');
        setAddingToCell(null);
    };

    const getItems = (colId: number, rowId: number | null) => {
        const col = columns.find(c => c.id === colId);
        if (!col) return [];
        return col.items.filter(item => item.rowId === rowId);
    };

    return (
        <div className="h-full flex flex-col w-full bg-white relative">
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-auto p-6">
                    <div className="inline-block min-w-full">
                        
                        {/* Headers (Columns) */}
                        <div className="flex sticky top-0 z-20 mb-4">
                             <div className="w-48 flex-shrink-0 p-4 border-r border-b border-gray-100 flex items-end bg-white">
                                 <button onClick={() => addRow('Nowy wiersz')} className="text-xs text-purple-600 font-bold hover:underline">+ Dodaj Wiersz</button>
                             </div>
                             
                             {columns.map(col => (
                                 <div key={col.id} className="w-72 flex-shrink-0 mx-2 p-3 rounded-lg shadow-sm group relative" style={{ backgroundColor: col.color || '#f3f4f6' }}>
                                     <div className="flex justify-between items-center">
                                         <h3 className="font-bold text-sm tracking-wide">{col.title}</h3>
                                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button onClick={() => {
                                                 const newColor = prompt('Podaj kolor (np. #ff0000)', col.color || '');
                                                 if (newColor !== null) updateColumn(col.id, { color: newColor });
                                             }} className="p-1 hover:bg-black/10 rounded"><Edit2 size={14}/></button>
                                             <button onClick={() => handleDeleteAttempt('column', col.id, col.items.length > 0)} className="p-1 hover:bg-red-500/20 text-red-600 rounded"><Trash2 size={14}/></button>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                             <button onClick={() => addColumn('Nowa kolumna')} className="w-12 mx-2 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100"><Plus size={20}/></button>
                        </div>

                        {/* Rows */}
                        {[...rows, {id: null, title: 'Brak przypisania', color: '#ffffff'}].map(row => (
                            <div key={row.id || 'unassigned'} className="flex mb-4 relative">
                                {/* Row Header */}
                                <div className="w-48 flex-shrink-0 p-4 rounded-lg shadow-sm z-10 mr-2 flex flex-col justify-center group" style={{ backgroundColor: row.color || '#f3f4f6' }}>
                                    <span className="font-bold text-sm">{row.title}</span>
                                    {row.id && (
                                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100">
                                            <button onClick={() => updateRow(row.id!, { color: prompt('Kolor:', row.color || '') || undefined })} className="p-1 hover:bg-black/10 rounded"><Edit2 size={12}/></button>
                                            <button onClick={() => handleDeleteAttempt('row', row.id!, columns.some(c => c.items.some(i => i.rowId === row.id)))} className="p-1 hover:bg-red-500/20 text-red-600 rounded"><Trash2 size={12}/></button>
                                        </div>
                                    )}
                                </div>

                                {/* Cells */}
                                {columns.map(col => {
                                    const items = getItems(col.id, row.id);
                                    const droppableId = `cell-${col.id}-${row.id}`;
                                    
                                    return (
                                        <Droppable key={droppableId} droppableId={droppableId}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`w-72 flex-shrink-0 mx-2 p-2 rounded-lg border-2 transition-colors duration-200 flex flex-col gap-3 min-h-[120px] group/cell
                                                        ${snapshot.isDraggingOver ? 'border-purple-400 bg-purple-50/50' : 'border-transparent'}
                                                    `}
                                                    style={{ backgroundColor: col.color ? `${col.color}40` : (row.color ? `${row.color}40` : '#f9fafb') }}
                                                >
                                                    {items.map((item, idx) => (
                                                        <Task key={item.id} item={item} index={idx} columns={columns} rows={rows} />
                                                    ))}
                                                    {provided.placeholder}

                                                    {/* Przycisk dodawania zadania */}
                                                    {addingToCell?.colId === col.id && addingToCell?.rowId === row.id ? (
                                                        <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-lg mt-auto animate-in fade-in zoom-in duration-200 flex flex-col gap-2">
                                                            <input 
                                                                autoFocus
                                                                className="w-full text-sm font-bold outline-none border-b border-gray-100 pb-1 bg-transparent placeholder:font-normal"
                                                                placeholder="Tytuł zadania..."
                                                                value={newTaskTitle}
                                                                onChange={e => setNewTaskTitle(e.target.value)}
                                                            />
                                                            <textarea 
                                                                className="w-full text-sm outline-none resize-none bg-transparent"
                                                                placeholder="Opis zadania (opcjonalnie)..."
                                                                rows={2}
                                                                value={newTaskContent}
                                                                onChange={e => setNewTaskContent(e.target.value)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        handleAddTask(col.id, row.id);
                                                                    }
                                                                }}
                                                            />
                                                            <div className="flex justify-end gap-2 mt-1">
                                                                <button onClick={() => {
                                                                    setAddingToCell(null);
                                                                    setNewTaskTitle('');
                                                                    setNewTaskContent('');
                                                                }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded bg-gray-50"><X size={14}/></button>
                                                                <button onClick={() => handleAddTask(col.id, row.id)} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-md hover:bg-purple-700">Dodaj</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setAddingToCell({colId: col.id, rowId: row.id})}
                                                            className="mt-auto w-full py-2 flex items-center justify-center gap-2 text-gray-400 hover:text-purple-600 hover:bg-white/60 rounded-lg border border-transparent hover:border-purple-200 transition-all opacity-0 group-hover/cell:opacity-100"
                                                        >
                                                            <Plus size={16} />
                                                            <span className="text-xs font-bold">Dodaj zadanie</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </Droppable>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>

            {/* Modal - Ostrzeżenie przy usuwaniu */}
            {deletePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4 text-center">Co chcesz zrobić z przypisanymi taskami?</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => {
                                deletePrompt.type === 'column' ? removeColumn(deletePrompt.id, 'move_tasks') : removeRow(deletePrompt.id, 'move_tasks');
                                setDeletePrompt(null);
                            }} className="py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-sm">
                                Przenieś do innej kolumny/wiersza
                            </button>
                            <button onClick={() => {
                                deletePrompt.type === 'column' ? removeColumn(deletePrompt.id, 'delete_tasks') : removeRow(deletePrompt.id, 'delete_tasks');
                                setDeletePrompt(null);
                            }} className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold text-sm">
                                Usuń wszystkie taski
                            </button>
                            <button onClick={() => setDeletePrompt(null)} className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-bold text-sm mt-2">
                                Anuluj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;