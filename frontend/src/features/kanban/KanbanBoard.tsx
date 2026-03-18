import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Plus, Trash2, X, AlertCircle, Edit2, Check } from 'lucide-react';

const KanbanBoard = () => {
    const { columns, fetchBoard, addColumn, moveItem, removeColumn, addItem, updateColumn } = useKanbanStore();
    const { users, fetchUsers } = useUserStore();
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColTitle, setNewColTitle] = useState('');
    
    // Quick Add Task state (cell specific)
    const [addingToCell, setAddingToCell] = useState<{colId: number, userId: number | null} | null>(null);
    const [newTaskContent, setNewTaskContent] = useState('');

    // Column Editing State
    const [editingColId, setEditingColId] = useState<number | null>(null);
    const [tempColTitle, setTempColTitle] = useState('');
    const [tempColLimit, setTempColLimit] = useState(0);

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
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        // Droppable ID format: col-{colId}-user-{userId} OR col-{colId}-unassigned
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
            
            // Pass null for unassigned, undefined for "no change" (but here we physically dropped it somewhere, so it's a change)
            // If Dropped in unassigned -> null
            // If Dropped in User row -> userId
            moveItem(itemId, targetColId, targetUserId === null ? null : targetUserId);
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
            
            {/* Toolbar */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Tablica zadań (Swimlanes)</h2>
                <div className="flex gap-3">
                   {isAddingColumn ? (
                       <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-purple-200 shadow-sm">
                           <input 
                             autoFocus
                             value={newColTitle}
                             onChange={e => setNewColTitle(e.target.value)}
                             placeholder="Nazwa kolumny..."
                             className="px-3 py-1 text-sm outline-none w-48"
                             onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                           />
                           <button onClick={handleAddColumn} className="p-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200"><Plus size={16}/></button>
                           <button onClick={() => setIsAddingColumn(false)} className="p-1 rounded text-gray-400 hover:text-red-500"><X size={16}/></button>
                       </div>
                   ) : (
                       <button onClick={() => setIsAddingColumn(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors shadow-sm">
                           <Plus size={18} />
                           Dodaj kolumnę
                       </button>
                   )}
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-auto p-6">
                    <div className="inline-block min-w-full">
                        
                        {/* Header Row (Columns) */}
                        <div className="flex sticky top-0 z-20 shadow-sm border-b-2 border-gray-100 mb-2">
                             {/* Corner Header */}
                             <div className="w-56 flex-shrink-0 p-4 font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center bg-gray-50 border-r border-gray-200">
                                 Użytkownicy
                             </div>
                             
                             {/* Kanban Columns Headers */}
                             {columns.map(col => {
                                 const isLimitExceeded = col.limit > 0 && col.items.length > col.limit;

                                 return (
                                 <div key={col.id} className={`w-80 flex-shrink-0 p-4 border-r border-gray-100 flex justify-between items-center group min-h-[57px] transition-colors
                                     ${isLimitExceeded ? 'bg-red-50 border-red-200' : 'bg-white'}
                                 `}>
                                     {editingColId === col.id ? (
                                         <div className="flex flex-col gap-2 w-full animate-in fade-in duration-200">
                                            <input 
                                                autoFocus
                                                className="border-2 border-purple-300 rounded px-2 py-1 text-sm font-bold w-full outline-none focus:border-purple-500 transition-colors"
                                                value={tempColTitle}
                                                onChange={e => setTempColTitle(e.target.value)}
                                                placeholder="Nazwa kolumny"
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 font-medium">Limit:</span>
                                                <input 
                                                    type="number"
                                                    className="border border-gray-300 rounded px-2 py-1 text-xs w-16 outline-none focus:border-purple-500"
                                                    value={tempColLimit}
                                                    onChange={e => setTempColLimit(parseInt(e.target.value) || 0)}
                                                    min="0"
                                                />
                                                <div className="flex ml-auto gap-1">
                                                    <button onClick={handleSaveColumn} className="p-1 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors" title="Zapisz"><Check size={14}/></button>
                                                    <button onClick={() => setEditingColId(null)} className="p-1 text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors" title="Anuluj"><X size={14}/></button>
                                                </div>
                                            </div>
                                         </div>
                                     ) : (
                                         <>
                                            <div className="flex flex-col overflow-hidden mr-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold truncate ${isLimitExceeded ? 'text-red-600' : 'text-gray-700'}`} title={col.title}>
                                                        {col.title}
                                                    </span>
                                                    {isLimitExceeded && (
                                                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 animate-pulse" />
                                                    )}
                                                </div>
                                                <span className={`text-xs ml-0 font-normal whitespace-nowrap flex items-center gap-1 ${isLimitExceeded ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                    {col.items.length} / {col.limit > 0 ? col.limit : '∞'}
                                                    {isLimitExceeded && <span>(Limit przekroczony!)</span>}
                                                </span>
                                            </div>

                                            <div className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pl-2 ${isLimitExceeded ? 'bg-red-50' : 'bg-white'}`}>
                                                <button 
                                                    onClick={() => startEditingColumn(col)}
                                                    className="text-gray-400 hover:text-purple-600 p-1 rounded hover:bg-purple-50 transition-colors"
                                                    title="Edytuj kolumnę"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => { if(window.confirm('Usunąć kolumnę?')) removeColumn(col.id) }}
                                                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Usuń kolumnę"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                         </>
                                     )}
                                 </div>
                                 );
                             })}
                        </div>

                        {/* Swimlanes (Users) */}
                        {users.map(user => (
                            <div key={user.id} className="flex min-h-[140px] border-b border-gray-100 group hover:bg-gray-50/50 transition-colors">
                                {/* Row Header (User) */}
                                <div className="w-56 flex-shrink-0 p-4 border-r border-gray-100 bg-white sticky left-0 z-10 flex flex-col justify-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                                            {user.fullName.substring(0,2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-bold text-sm text-gray-800 truncate" title={user.fullName}>{user.fullName}</span>
                                            <span className="text-xs text-gray-400 truncate">{user.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Row Cells */}
                                {columns.map(col => {
                                    const items = getItems(col.id, user.id);
                                    const droppableId = `col-${col.id}-user-${user.id}`;
                                    
                                    return (
                                        <Droppable key={droppableId} droppableId={droppableId}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`w-80 flex-shrink-0 p-3 border-r border-dashed border-gray-200 transition-colors duration-200 flex flex-col gap-2 
                                                        ${snapshot.isDraggingOver ? 'bg-purple-50 border-purple-200' : 'bg-transparent'}
                                                    `}
                                                >
                                                    {items.map((item, idx) => (
                                                        <Task key={item.id} item={item} index={idx} />
                                                    ))}
                                                    {provided.placeholder}
                                                    
                                                    {/* Quick Add Button */}
                                                    {addingToCell?.colId === col.id && addingToCell?.userId === user.id ? (
                                                        <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-lg animate-in fade-in zoom-in duration-200">
                                                            <textarea 
                                                                autoFocus
                                                                className="w-full text-sm outline-none resize-none mb-2 bg-transparent"
                                                                placeholder="Treść zadania..."
                                                                rows={2}
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
                                                                <button onClick={() => setAddingToCell(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded bg-gray-50"><X size={14}/></button>
                                                                <button onClick={() => handleAddTask(col.id, user.id)} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-md hover:bg-purple-700">Dodaj</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setAddingToCell({colId: col.id, userId: user.id})}
                                                            className="mt-auto w-full py-2 flex items-center justify-center gap-2 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg border border-transparent hover:border-purple-100 transition-all opacity-0 group-hover:opacity-100"
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

                        {/* Unassigned Row */}
                        <div className="flex min-h-[140px] bg-gray-50/50">
                            <div className="w-56 flex-shrink-0 p-4 border-r border-gray-200 flex flex-col justify-center sticky left-0 z-10 bg-gray-50">
                                <span className="font-bold text-xs uppercase text-gray-400 flex items-center gap-2">
                                    <AlertCircle size={14} /> Nieprzypisane
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
                                                className={`w-80 flex-shrink-0 p-3 border-r border-dashed border-gray-200 transition-colors duration-200 flex flex-col gap-2
                                                     ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}
                                                `}
                                            >
                                                {items.map((item, idx) => (
                                                    <Task key={item.id} item={item} index={idx} />
                                                ))}
                                                {provided.placeholder}

                                                {addingToCell?.colId === col.id && addingToCell?.userId === null ? (
                                                    <div className="bg-white p-3 rounded-xl border border-gray-300 shadow-lg">
                                                        <textarea 
                                                            autoFocus
                                                            className="w-full text-sm outline-none resize-none mb-2 bg-transparent"
                                                            placeholder="Treść zadania..."
                                                            rows={2}
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
                                                            <button onClick={() => setAddingToCell(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded bg-gray-100"><X size={14}/></button>
                                                            <button onClick={() => handleAddTask(col.id, null)} className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-md hover:bg-gray-700">Dodaj</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setAddingToCell({colId: col.id, userId: null})}
                                                        className="mt-auto w-full py-2 flex items-center justify-center gap-2 text-gray-300 hover:text-gray-500 hover:bg-gray-200 rounded-lg transition-all opacity-50 hover:opacity-100"
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
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;