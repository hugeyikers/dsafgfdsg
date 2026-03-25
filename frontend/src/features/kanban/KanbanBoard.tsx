import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Plus, Trash2, X, Edit3, Save, Ban } from 'lucide-react';

const KanbanBoard = () => {
    const { columns, rows, fetchBoard, addColumn, addRow, moveItem, removeColumn, removeRow, updateColumn, updateRow, addItem } = useKanbanStore();
    const { fetchUsers } = useUserStore();
    
    const [deletePrompt, setDeletePrompt] = useState<{type: 'column'|'row', id: number, hasItems: boolean} | null>(null);

    // Stan do dodawania nowego zadania
    const [addingToCell, setAddingToCell] = useState<{colId: number, rowId: number | null} | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskContent, setNewTaskContent] = useState('');
    const addFormRef = useRef<HTMLDivElement>(null);

    // Stan dla Modala Edycji Kolumn / Wierszy
    const [entityDetails, setEntityDetails] = useState<{type: 'column'|'row', item: any} | null>(null);
    const [isEntityEditing, setIsEntityEditing] = useState(false);
    const [entityEditData, setEntityEditData] = useState({ title: '', color: '#f3f4f6' });

    useEffect(() => {
        fetchBoard();
        fetchUsers();
    }, []);

    // Nasłuchiwanie na kliknięcia POZA formularzem dodawania zadania
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addFormRef.current && !addFormRef.current.contains(event.target as Node)) {
                setAddingToCell(null);
                setNewTaskTitle('');
                setNewTaskContent('');
            }
        };
        if (addingToCell) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [addingToCell]);

    const handleDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId) return;
        
        if (destination.droppableId.startsWith('cell-')) {
            const itemId = parseInt(draggableId.split('-')[1]);
            const destParts = destination.droppableId.split('-');
            const targetColId = parseInt(destParts[1]);
            const targetRowId = destParts[2] === 'null' ? null : parseInt(destParts[2]);
            moveItem(itemId, targetColId, targetRowId);
        }
    };

    // --- LOGIKA EDYCJI WIERSZY I KOLUMN ---
    const handleEntityDoubleClick = (type: 'column'|'row', item: any) => {
        setEntityDetails({ type, item });
        setEntityEditData({ title: item.title, color: item.color || '#f3f4f6' });
        setIsEntityEditing(false);
    };

    const handleEntitySave = () => {
        if (!entityDetails) return;
        if (entityDetails.type === 'column') {
            updateColumn(entityDetails.item.id, entityEditData);
        } else {
            updateRow(entityDetails.item.id, entityEditData);
        }
        setEntityDetails(null);
        setIsEntityEditing(false);
    };

    const handleEntityDelete = () => {
        if (!entityDetails) return;
        const { type, item } = entityDetails;
        let hasItems = false;
        
        if (type === 'column') {
            hasItems = item.items && item.items.length > 0;
        } else {
            hasItems = columns.some(c => c.items.some(i => i.rowId === item.id));
        }

        setEntityDetails(null); // Zamykamy modal szczegółów
        
        if (!hasItems) {
            if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
                type === 'column' ? removeColumn(item.id) : removeRow(item.id);
            }
        } else {
            setDeletePrompt({ type, id: item.id, hasItems });
        }
    };

    // --- LOGIKA DODAWANIA ZADAŃ ---
    const handleAddTask = async (colId: number, rowId: number | null) => {
        const finalTitle = newTaskTitle.trim() || 'Untitled';
        const finalContent = newTaskContent.trim() || 'No description provided';
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
                        
                        {/* --- NAGŁÓWKI KOLUMN --- */}
                        <div className="flex sticky top-0 z-20 mb-4">
                             <div className="w-48 flex-shrink-0 p-4 border-r border-b border-gray-100 flex items-end bg-white">
                                 <button onClick={() => addRow('New row')} className="text-xs text-purple-600 font-bold hover:underline">+ Add Row</button>
                             </div>
                             
                             {columns.map(col => (
                                 <div 
                                    key={col.id} 
                                    onDoubleClick={() => handleEntityDoubleClick('column', col)}
                                    className="w-96 flex-shrink-0 mx-2 p-3 rounded-lg shadow-sm group relative flex items-center justify-center min-h-[50px] cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all select-none" 
                                    style={{ backgroundColor: col.color || '#f3f4f6' }}
                                    title="Double-click to edit column"
                                 >
                                     <div className="flex justify-between items-center w-full">
                                         <div className="flex-1 text-center">
                                            <h3 className="font-bold text-sm tracking-wide uppercase">{col.title}</h3>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                             <button onClick={() => addColumn('New column')} className="w-12 mx-2 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100" title="Add new column"><Plus size={20}/></button>
                        </div>

                        {/* --- WIERSZE --- */}
                        {[...rows, {id: null, title: 'Unassigned', color: '#ffffff'}].map(row => (
                            <div key={row.id || 'unassigned'} className="flex mb-4 relative">
                                
                                {/* NAGŁÓWEK WIERSZA */}
                                <div 
                                    onDoubleClick={() => row.id ? handleEntityDoubleClick('row', row) : null}
                                    className={`w-48 flex-shrink-0 p-4 rounded-lg shadow-sm z-10 mr-2 flex flex-col items-center justify-center text-center group relative select-none
                                        ${row.id ? 'cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all' : ''}
                                    `} 
                                    style={{ backgroundColor: row.color || '#f3f4f6' }}
                                    title={row.id ? "Double-click to edit row" : ""}
                                >
                                    <span className="font-bold text-sm uppercase tracking-wider">{row.title}</span>
                                </div>

                                {/* KOMÓRKI */}
                                {columns.map(col => {
                                    const items = getItems(col.id, row.id);
                                    const droppableId = `cell-${col.id}-${row.id}`;
                                    
                                    return (
                                        <Droppable key={droppableId} droppableId={droppableId}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    onDoubleClick={() => setAddingToCell({colId: col.id, rowId: row.id})}
                                                    className={`w-96 flex-shrink-0 mx-2 p-2 rounded-lg border-2 transition-colors duration-200 flex flex-col gap-3 min-h-[120px] group/cell cursor-pointer
                                                        ${snapshot.isDraggingOver ? 'border-purple-400 bg-purple-50/50' : 'border-transparent'}
                                                    `}
                                                    style={{ backgroundColor: col.color ? `${col.color}40` : (row.color ? `${row.color}40` : '#f9fafb') }}
                                                >
                                                    {items.map((item, idx) => (
                                                        <Task key={item.id} item={item} index={idx} columns={columns} rows={rows} />
                                                    ))}
                                                    {provided.placeholder}

                                                    {/* Formularz dodawania zadania */}
                                                    {addingToCell?.colId === col.id && addingToCell?.rowId === row.id && (
                                                        <div 
                                                            ref={addFormRef}
                                                            onDoubleClick={(e) => e.stopPropagation()}
                                                            className="bg-white p-4 rounded-xl border border-purple-200 shadow-lg mt-auto animate-in fade-in zoom-in duration-200 flex flex-col gap-3 cursor-default"
                                                        >
                                                            <input 
                                                                autoFocus
                                                                className="w-full text-sm font-bold outline-none border-b border-gray-100 pb-1 bg-transparent placeholder:font-normal"
                                                                placeholder="Task title..."
                                                                value={newTaskTitle}
                                                                onChange={e => setNewTaskTitle(e.target.value)}
                                                            />
                                                            <textarea 
                                                                className="w-full text-sm outline-none resize-none bg-transparent"
                                                                placeholder="Task description (optional)..."
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
                                                                <button onClick={() => handleAddTask(col.id, row.id)} className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-md hover:bg-purple-700">Add</button>
                                                            </div>
                                                        </div>
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

            {/* --- MODAL EDYCJI KOLUMN / WIERSZY --- */}
            {entityDetails && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4"
                    onClick={() => setEntityDetails(null)} 
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="p-[40px] flex flex-col w-full h-full bg-white">
                            
                            {/* Nagłówek Modala (X) */}
                            <div className="flex justify-end items-center mb-6">
                                <button 
                                    onClick={() => setEntityDetails(null)} 
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={24}/>
                                </button>
                            </div>

                            {/* Ciało Modala */}
                            <div className="flex flex-col gap-6">
                                {/* TYTUŁ */}
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEntityEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>
                                        {entityDetails.type === 'column' ? 'Column Title' : 'Row Title'}
                                    </label>
                                    {isEntityEditing ? (
                                        <input 
                                            className="w-full text-base font-bold p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all shadow-inner"
                                            value={entityEditData.title}
                                            onChange={(e) => setEntityEditData({...entityEditData, title: e.target.value})}
                                            autoFocus
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                            {entityDetails.item.title || "Untitled"}
                                        </h2>
                                    )}
                                </div>

                                {/* KOLOR */}
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEntityEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>
                                        Background Color
                                    </label>
                                    {isEntityEditing ? (
                                        <div className="flex gap-3.5 flex-wrap">
                                            {['#f3f4f6', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                                <button 
                                                    key={color} 
                                                    onClick={() => setEntityEditData({...entityEditData, color})}
                                                    className={`w-9 h-9 rounded-full border border-gray-300 transition-all hover:scale-110 shadow
                                                        ${entityEditData.color === color ? 'ring-2 ring-purple-500 ring-offset-2 scale-110' : ''}
                                                    `}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: entityDetails.item.color || '#f3f4f6' }} />
                                            <span className="text-xs font-semibold text-gray-600">Marked with this color.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Stopka Modala */}
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3 relative">
                                {isEntityEditing ? (
                                    <>
                                        <button 
                                            onClick={() => setIsEntityEditing(false)}
                                            className="px-5 py-2.5 flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
                                        >
                                            <Ban size={16}/> Cancel
                                        </button>
                                        <button 
                                            onClick={handleEntitySave}
                                            className="px-6 py-2.5 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
                                        >
                                            <Save size={16}/> Save changes
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleEntityDelete}
                                            className="px-5 py-2.5 flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors shadow-sm border border-red-200"
                                        >
                                            <Trash2 size={16}/> Delete {entityDetails.type === 'column' ? 'Column' : 'Row'}
                                        </button>
                                        <button 
                                            onClick={() => setIsEntityEditing(true)}
                                            className="px-6 py-2.5 flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors shadow-md"
                                        >
                                            <Edit3 size={16}/> Edit
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Ostrzeżenie przy usuwaniu (Konflikt z Taskami) */}
            {deletePrompt && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col max-w-md w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-6 text-center text-gray-900 leading-snug">This {deletePrompt.type} contains tasks. What do you want to do with them?</h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => {
                                deletePrompt.type === 'column' ? removeColumn(deletePrompt.id, 'move_tasks') : removeRow(deletePrompt.id, 'move_tasks');
                                setDeletePrompt(null);
                            }} className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-800 transition-colors shadow-sm">
                                Move tasks to unassigned zone
                            </button>
                            <button onClick={() => {
                                deletePrompt.type === 'column' ? removeColumn(deletePrompt.id, 'delete_tasks') : removeRow(deletePrompt.id, 'delete_tasks');
                                setDeletePrompt(null);
                            }} className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-sm transition-colors border border-red-100 shadow-sm">
                                Delete all tasks permanently
                            </button>
                            <button onClick={() => setDeletePrompt(null)} className="py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-sm mt-3 transition-colors text-gray-600 shadow-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;