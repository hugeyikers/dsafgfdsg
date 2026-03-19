import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore, KanbanColumn } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Plus, Trash2, X, AlertCircle, Edit2, Check, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

// --- KOMPONENT MODALA DO USUWANIA KOLUMNY ---
const DeleteColumnModal = ({ column, onClose }: { column: KanbanColumn, onClose: () => void }) => {
    const { handleColumnDeletionTasks, removeColumn, columns } = useKanbanStore();
    const [action, setAction] = useState<'move' | 'delete'>('move');
    const [targetColId, setTargetColId] = useState<number | ''>('');
    const [isDeleting, setIsDeleting] = useState(false);

    const availableColumns = columns.filter(c => c.id !== column.id);

    useEffect(() => {
        if (availableColumns.length === 0) {
            setAction('delete'); // Jeśli nie ma innej kolumny, można tylko usunąć taski
        }
    }, [availableColumns.length]);

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await handleColumnDeletionTasks(column.id, action, targetColId === '' ? undefined : Number(targetColId));
            await removeColumn(column.id);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Wystąpił błąd podczas usuwania kolumny.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-[400px] max-w-full animate-in fade-in zoom-in duration-200 border-t-4 border-red-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Trash2 className="text-red-500" size={24} />
                        Usuwanie kolumny
                    </h3>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                    Usuwasz kolumnę: <span className="font-bold text-gray-800">{column.title}</span>.
                </p>
                
                {column.items.length > 0 ? (
                    <>
                        <p className="text-sm text-gray-600 mb-6">Co zrobić z zadaniami ({column.items.length}), które się w niej znajdują?</p>
                        <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="flex flex-col gap-3 text-sm cursor-pointer">
                                <div className="flex items-center gap-3 group">
                                    <input type="radio" name="action" checked={action === 'move'} onChange={() => setAction('move')} disabled={availableColumns.length === 0} className="w-4 h-4 text-purple-600 accent-purple-600" />
                                    <span className={`transition-colors ${availableColumns.length === 0 ? 'text-gray-400' : 'group-hover:text-purple-700'}`}>
                                        Przenieś zadania do innej kolumny
                                    </span>
                                </div>
                                {action === 'move' && availableColumns.length > 0 && (
                                    <select 
                                        value={targetColId} 
                                        onChange={e => setTargetColId(e.target.value as any)}
                                        className="ml-7 p-2.5 border border-purple-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                                    >
                                        <option value="" disabled>-- Wybierz kolumnę docelową --</option>
                                        {availableColumns.map(c => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                )}
                            </label>
                            <label className="flex items-center gap-3 text-sm cursor-pointer group">
                                <input type="radio" name="action" checked={action === 'delete'} onChange={() => setAction('delete')} className="w-4 h-4 text-red-600 accent-red-600" />
                                <span className="text-red-600 font-medium group-hover:text-red-700 transition-colors">Usuń bezpowrotnie wszystkie zadania</span>
                            </label>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-gray-600 mb-8">Kolumna jest pusta i zostanie bezpiecznie usunięta.</p>
                )}

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                        Anuluj
                    </button>
                    <button 
                        disabled={isDeleting || (action === 'move' && targetColId === '')} 
                        onClick={confirmDelete} 
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isDeleting ? 'Usuwanie...' : 'Potwierdź usunięcie'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- GŁÓWNY KOMPONENT KANBAN BOARD ---
const KanbanBoard = () => {
    const { columns, fetchBoard, addColumn, moveItem, removeColumn, addItem, updateColumn, reorderColumns } = useKanbanStore();
    const { users, fetchUsers, reorderUsers } = useUserStore();
    
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColTitle, setNewColTitle] = useState('');
    
    const [addingToCell, setAddingToCell] = useState<{colId: number, userId: number | null} | null>(null);
    const [newTaskContent, setNewTaskContent] = useState('');

    const [editingColId, setEditingColId] = useState<number | null>(null);
    const [tempColTitle, setTempColTitle] = useState('');
    const [tempColLimit, setTempColLimit] = useState(0);

    // Stan wywołujący Modal do usuwania kolumny
    const [columnToDelete, setColumnToDelete] = useState<KanbanColumn | null>(null);

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

    const handleDragEnd = (result: any) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        if (type === 'COLUMN') {
            const newOrderIds = Array.from(columns.map(c => c.id));
            const [removed] = newOrderIds.splice(source.index, 1);
            newOrderIds.splice(destination.index, 0, removed);
            reorderColumns(newOrderIds);
            return;
        }

        if (type === 'USER_ROW') {
            reorderUsers(source.index, destination.index);
            return;
        }
        
        if (destination.droppableId.startsWith('col-')) {
            const itemId = parseInt(draggableId.split('-')[1]);
            const destParts = destination.droppableId.split('-');
            const targetColId = parseInt(destParts[1]);
            
            let targetUserId: number | undefined | null = undefined;
            
            if (destParts[2] === 'user') {
                targetUserId = parseInt(destParts[3]);
            } else if (destParts[2] === 'unassigned') {
                targetUserId = null;
            }
            
            moveItem(itemId, targetColId, targetUserId === null ? null : targetUserId as any);
        }
    };

    const handleAddColumn = async () => {
        if (!newColTitle.trim()) return;
        await addColumn(newColTitle);
        setNewColTitle('');
        setIsAddingColumn(false);
    };

    const handleAddTask = async (colId: number, userId: number | null) => {
        if (!newTaskContent.trim()) return;
        await addItem(colId, newTaskContent, userId === null ? undefined : userId);
        setNewTaskContent('');
        setAddingToCell(null);
    };

    const getItems = (colId: number, userId: number | null) => {
        const col = columns.find(c => c.id === colId);
        if (!col) return [];
        return col.items.filter(item => {
            if (userId === null) return item.assignedToId === null || item.assignedToId === undefined;
            return item.assignedToId === userId;
        });
    };

    return (
        <div className="h-full flex flex-col w-full overflow-hidden bg-white">
            <div className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-gray-50 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Tablica zadań (Swimlanes)</h2>
                <div className="flex gap-3">
                   {isAddingColumn ? (
                       <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-purple-200 shadow-md">
                           <input 
                             autoFocus
                             value={newColTitle}
                             onChange={e => setNewColTitle(e.target.value)}
                             placeholder="Nazwa kolumny..."
                             className="px-4 py-2 text-base outline-none w-64 rounded-md bg-gray-50"
                             onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                           />
                           <button onClick={handleAddColumn} className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"><Plus size={20}/></button>
                           <button onClick={() => setIsAddingColumn(false)} className="p-2 rounded-lg text-gray-400 hover:text-red-500"><X size={20}/></button>
                       </div>
                   ) : (
                       <button onClick={() => setIsAddingColumn(true)} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold text-base transition-colors shadow-md">
                           <Plus size={20} />
                           Dodaj kolumnę
                       </button>
                   )}
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
                    <div className="inline-block min-w-full">
                        
                        {/* Horyzontalny Droppable dla kolumn */}
                        <Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
                            {(providedHeaderList) => (
                                <div 
                                    ref={providedHeaderList.innerRef} 
                                    {...providedHeaderList.droppableProps} 
                                    className="flex sticky top-0 z-30 shadow-sm border-b-2 border-gray-200 bg-white rounded-t-xl"
                                >
                                     <div className="w-64 flex-shrink-0 p-5 font-bold text-gray-500 uppercase text-sm tracking-wider flex items-center bg-gray-50 border-r border-gray-200 rounded-tl-xl relative z-20">
                                         Użytkownicy
                                     </div>
                                     
                                     {columns.map((col, index) => {
                                         const isLimitExceeded = col.limit > 0 && col.items.length > col.limit;
                                         const isBacklog = col.title.toLowerCase() === 'backlog';

                                         return (
                                         <Draggable key={`col-header-${col.id}`} draggableId={`col-header-${col.id}`} index={index}>
                                             {(providedCol, snapshotCol) => (
                                             <div 
                                                 ref={providedCol.innerRef}
                                                 {...providedCol.draggableProps}
                                                 className={`w-80 flex-shrink-0 p-5 border-r border-gray-100 flex justify-between items-center group min-h-[70px] transition-colors relative
                                                     ${isLimitExceeded ? 'bg-red-50 border-red-200' : 'bg-white'}
                                                     ${snapshotCol.isDragging ? 'shadow-2xl ring-2 ring-purple-500 z-50 rotate-1' : ''}
                                                 `}
                                             >
                                                 <div {...providedCol.dragHandleProps} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-purple-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" title="Przeciągnij kolumnę">
                                                     <GripVertical size={16} />
                                                 </div>

                                                 {editingColId === col.id ? (
                                                     <div className="flex flex-col gap-2 w-full animate-in fade-in pl-6">
                                                        <input 
                                                            autoFocus
                                                            className="border-2 border-purple-300 rounded-lg px-2 py-1 text-base font-bold w-full outline-none focus:border-purple-500 transition-colors"
                                                            value={tempColTitle}
                                                            onChange={e => setTempColTitle(e.target.value)}
                                                            placeholder="Nazwa kolumny"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600 font-medium">Limit:</span>
                                                            <input 
                                                                type="number"
                                                                className="border-2 border-gray-200 rounded-lg px-2 py-1 text-sm w-16 outline-none focus:border-purple-500"
                                                                value={tempColLimit}
                                                                onChange={e => setTempColLimit(parseInt(e.target.value) || 0)}
                                                                min="0"
                                                            />
                                                            <div className="flex ml-auto gap-1">
                                                                <button onClick={handleSaveColumn} className="p-1 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><Check size={16}/></button>
                                                                <button onClick={() => setEditingColId(null)} className="p-1 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"><X size={16}/></button>
                                                            </div>
                                                        </div>
                                                     </div>
                                                 ) : (
                                                     <>
                                                        <div className="flex flex-col overflow-hidden mr-2 pl-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-bold text-lg truncate ${isLimitExceeded ? 'text-red-600' : 'text-gray-800'}`} title={col.title}>
                                                                    {col.title}
                                                                    {isBacklog && <span className="ml-2 text-xs text-purple-500 font-bold bg-purple-100 px-1.5 py-0.5 rounded-md">STAŁA</span>}
                                                                </span>
                                                                {isLimitExceeded && (
                                                                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 animate-pulse" />
                                                                )}
                                                            </div>
                                                            <span className={`text-sm mt-1 font-medium whitespace-nowrap flex items-center gap-1 ${isLimitExceeded ? 'text-red-500' : 'text-gray-500'}`}>
                                                                {col.items.length} / {col.limit > 0 ? col.limit : '∞'}
                                                                {isLimitExceeded && <span className="text-xs ml-1">(Przekroczony!)</span>}
                                                            </span>
                                                        </div>

                                                        <div className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pl-2 ${isLimitExceeded ? 'bg-red-50' : 'bg-white'}`}>
                                                            <button onClick={() => startEditingColumn(col)} className="text-gray-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50">
                                                                <Edit2 size={18} />
                                                            </button>
                                                            
                                                            {/* Blokada usunięcia kolumny Backlog */}
                                                            {!isBacklog && (
                                                                <button onClick={() => setColumnToDelete(col)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                     </>
                                                 )}
                                             </div>
                                             )}
                                         </Draggable>
                                         );
                                     })}
                                     {providedHeaderList.placeholder}
                                </div>
                            )}
                        </Droppable>

                        {/* Unassigned Row */}
                        <div className="flex min-h-[160px] bg-gray-100/60 border-b-2 border-gray-200">
                            <div className="w-64 flex-shrink-0 p-5 border-r border-gray-200 flex flex-col justify-center sticky left-0 z-10 bg-gray-100/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                <span className="font-bold text-sm uppercase text-gray-500 flex items-center gap-2">
                                    <AlertCircle size={18} /> Nieprzypisane
                                </span>
                            </div>
                            
                            {columns.map(col => {
                                const items = getItems(col.id, null);
                                const droppableId = `col-${col.id}-unassigned`;
                                
                                return (
                                    <Droppable key={droppableId} droppableId={droppableId}>
                                        {(provided, snapshot) => (
                                            <div 
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`w-80 flex-shrink-0 p-4 border-r border-dashed border-gray-200 transition-colors duration-200 flex flex-col gap-3
                                                     ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''}
                                                `}
                                            >
                                                {items.map((item, idx) => (
                                                    <Task key={item.id} item={item} index={idx} />
                                                ))}
                                                {provided.placeholder}

                                                {addingToCell?.colId === col.id && addingToCell?.userId === null ? (
                                                    <div className="bg-white p-4 rounded-xl border-2 border-gray-300 shadow-xl">
                                                        <textarea 
                                                            autoFocus
                                                            className="w-full text-base outline-none resize-none mb-3 bg-gray-50 rounded p-2"
                                                            placeholder="Treść zadania..."
                                                            rows={3}
                                                            value={newTaskContent}
                                                            onChange={e => setNewTaskContent(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleAddTask(col.id, null);
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setAddingToCell(null)} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg bg-gray-100"><X size={18}/></button>
                                                            <button onClick={() => handleAddTask(col.id, null)} className="px-4 py-2 bg-gray-600 text-white text-sm font-bold rounded-lg hover:bg-gray-700 shadow-sm">Dodaj</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setAddingToCell({colId: col.id, userId: null})}
                                                        className="mt-auto w-full py-3 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-xl transition-all opacity-40 hover:opacity-100 font-medium"
                                                    >
                                                        <Plus size={20} />
                                                        Dodaj zadanie
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                );
                            })}
                        </div>

                        {/* Drag and Drop dla rzędów użytkowników */}
                        <Droppable droppableId="board-users" type="USER_ROW">
                            {(providedRowList) => (
                                <div ref={providedRowList.innerRef} {...providedRowList.droppableProps} className="flex flex-col w-full pb-10">
                                    
                                    {users.map((user, index) => (
                                        <Draggable key={`user-row-${user.id}`} draggableId={`user-row-${user.id}`} index={index}>
                                            {(providedRow, snapshotRow) => (
                                                <div 
                                                    ref={providedRow.innerRef} 
                                                    {...providedRow.draggableProps} 
                                                    className={`flex min-h-[160px] border-b border-gray-200 group transition-colors bg-white
                                                        ${snapshotRow.isDragging ? 'shadow-2xl relative z-40 ring-2 ring-purple-500' : 'hover:bg-purple-50/20'}
                                                    `}
                                                >
                                                    <div className="w-64 flex-shrink-0 p-5 border-r border-gray-200 sticky left-0 z-10 flex flex-col justify-center bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                        <div className="flex items-center justify-between mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div {...providedRow.dragHandleProps} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md cursor-grab active:cursor-grabbing" title="Chwyć aby przeciągnąć róg">
                                                                <GripVertical size={18} />
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => { if(index > 0) reorderUsers(index, index - 1); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"><ChevronUp size={18}/></button>
                                                                <button onClick={() => { if(index < users.length - 1) reorderUsers(index, index + 1); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"><ChevronDown size={18}/></button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md text-lg">
                                                                {user.fullName.substring(0,2).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="font-bold text-base text-gray-800 truncate" title={user.fullName}>{user.fullName}</span>
                                                                <span className="text-sm text-gray-400 truncate mt-0.5">{user.role}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {columns.map(col => {
                                                        const items = getItems(col.id, user.id);
                                                        const droppableId = `col-${col.id}-user-${user.id}`;
                                                        
                                                        return (
                                                            <Droppable key={droppableId} droppableId={droppableId}>
                                                                {(provided, snapshot) => (
                                                                    <div 
                                                                        ref={provided.innerRef}
                                                                        {...provided.droppableProps}
                                                                        className={`w-80 flex-shrink-0 p-4 border-r border-dashed border-gray-200 transition-colors duration-200 flex flex-col gap-3 
                                                                            ${snapshot.isDraggingOver ? 'bg-purple-50/50 border-purple-300' : 'bg-transparent'}
                                                                        `}
                                                                    >
                                                                        {items.map((item, idx) => (
                                                                            <Task key={item.id} item={item} index={idx} />
                                                                        ))}
                                                                        {provided.placeholder}
                                                                        
                                                                        {addingToCell?.colId === col.id && addingToCell?.userId === user.id ? (
                                                                            <div className="bg-white p-4 rounded-xl border-2 border-purple-200 shadow-xl animate-in fade-in zoom-in duration-200">
                                                                                <textarea 
                                                                                    autoFocus
                                                                                    className="w-full text-base outline-none resize-none mb-3 bg-gray-50 rounded p-2"
                                                                                    placeholder="Treść zadania..."
                                                                                    rows={3}
                                                                                    value={newTaskContent}
                                                                                    onChange={e => setNewTaskContent(e.target.value)}
                                                                                    onKeyDown={e => {
                                                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                                                            e.preventDefault();
                                                                                            handleAddTask(col.id, user.id);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <div className="flex justify-end gap-2">
                                                                                    <button onClick={() => setAddingToCell(null)} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg bg-gray-100"><X size={18}/></button>
                                                                                    <button onClick={() => handleAddTask(col.id, user.id)} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-sm">Dodaj</button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <button 
                                                                                onClick={() => setAddingToCell({colId: col.id, userId: user.id})}
                                                                                className="mt-auto w-full py-3 flex items-center justify-center gap-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50/80 rounded-xl border-2 border-transparent hover:border-purple-100 transition-all opacity-0 group-hover:opacity-100 font-medium"
                                                                            >
                                                                                <Plus size={20} />
                                                                                Dodaj zadanie
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {providedRowList.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>

            {/* Render Modala dla kolumn */}
            {columnToDelete && (
                <DeleteColumnModal column={columnToDelete} onClose={() => setColumnToDelete(null)} />
            )}
        </div>
    );
};

export default KanbanBoard;