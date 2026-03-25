import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Plus, Trash2, X, Save, Ban } from 'lucide-react';

const KanbanBoard = () => {
    const { columns, rows, fetchBoard, addColumn, addRow, moveItem, removeColumn, removeRow, updateColumn, updateRow, addItem, reorderColumns, reorderRows, removeItem } = useKanbanStore();
    const { fetchUsers, users } = useUserStore();
    
    const [dragState, setDragState] = useState<{ isDragging: boolean; type: string | null }>({ isDragging: false, type: null });
    const [showTrash, setShowTrash] = useState(false);
    const trashTimeout = useRef<NodeJS.Timeout | null>(null);

    const [deletePrompt, setDeletePrompt] = useState<{type: 'column'|'row', id: number, hasItems: boolean} | null>(null);
    const [targetMoveId, setTargetMoveId] = useState<number | 'unassigned'>('unassigned');

    const [addingToCell, setAddingToCell] = useState<{colId: number, rowId: number | null} | null>(null);
    const [newTaskData, setNewTaskData] = useState({ title: '', content: '', color: '#ffffff', assignedToId: null as number | null });

    const [entityModal, setEntityModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; type: 'column' | 'row'; item?: any; }>({ isOpen: false, mode: 'add', type: 'column' });
    const [entityEditData, setEntityEditData] = useState({ title: '', color: '#ffffff' });

    useEffect(() => {
        fetchBoard();
        fetchUsers();
    }, []);

    const handleDragStart = (start: any) => {
        setDragState({ isDragging: true, type: start.type || 'task' });
        if (trashTimeout.current) clearTimeout(trashTimeout.current);
        trashTimeout.current = setTimeout(() => { setShowTrash(true); }, 1500);
    };

    const backlogColumn = columns.find(c => c.title === 'Backlog');
    const draggableColumns = columns.filter(c => c.title !== 'Backlog');

    const handleDragEnd = (result: any) => {
        if (trashTimeout.current) clearTimeout(trashTimeout.current);
        setShowTrash(false);
        setDragState({ isDragging: false, type: null });

        const { destination, source, draggableId, type } = result;
        if (!destination) return;

        if (destination.droppableId.startsWith('trash-')) {
            const id = parseInt(draggableId.split('-')[1]);
            if (type === 'task') {
                if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                    removeItem(id);
                }
                return;
            }
            if (type === 'column' || type === 'row') {
                if (type === 'column') {
                    const colObj = columns.find(c => c.id === id);
                    if (colObj?.title === 'Backlog') {
                        alert("The Backlog column is protected and cannot be deleted.");
                        return;
                    }
                }

                const hasItems = type === 'column' 
                    ? columns.find(c => c.id === id)?.items.length > 0
                    : columns.some(c => c.items.some(i => i.rowId === id));

                if (!hasItems) {
                    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
                        type === 'column' ? removeColumn(id) : removeRow(id);
                    }
                } else {
                    if (type === 'column') {
                        const availableCols = columns.filter(c => c.id !== id);
                        setTargetMoveId(availableCols.length > 0 ? availableCols[0].id : 'unassigned');
                    } else {
                        setTargetMoveId('unassigned');
                    }
                    setDeletePrompt({ type, id, hasItems });
                }
                return;
            }
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        if (type === 'column') { 
            const hasBacklog = columns.some(c => c.title === 'Backlog');
            const offset = hasBacklog ? 1 : 0;
            reorderColumns(source.index + offset, destination.index + offset); 
            return; 
        }
        
        if (type === 'row') { reorderRows(source.index, destination.index); return; }

        if (type === 'task' || destination.droppableId.startsWith('cell-')) {
            const itemId = parseInt(draggableId.split('-')[1]);
            const destParts = destination.droppableId.split('-');
            const targetColId = parseInt(destParts[1]);
            const targetRowId = destParts[2] === 'null' ? null : parseInt(destParts[2]);
            moveItem(itemId, targetColId, targetRowId);
        }
    };

    const handleEntitySave = () => {
        const finalTitle = entityEditData.title.trim() || `New ${entityModal.type}`;
        if (entityModal.mode === 'add') {
            if (entityModal.type === 'column') addColumn(finalTitle, entityEditData.color);
            else addRow(finalTitle, entityEditData.color);
        } else {
            if (entityModal.type === 'column') updateColumn(entityModal.item.id, { title: finalTitle, color: entityEditData.color });
            else updateRow(entityModal.item.id, { title: finalTitle, color: entityEditData.color });
        }
        setEntityModal({ ...entityModal, isOpen: false });
    };

    const handleEntityDelete = () => {
        if (!entityModal.item) return;
        if (entityModal.type === 'column' && entityModal.item.title === 'Backlog') return;

        const { type, item } = entityModal;
        let hasItems = type === 'column' 
            ? item.items && item.items.length > 0
            : columns.some(c => c.items.some(i => i.rowId === item.id));

        setEntityModal({ ...entityModal, isOpen: false }); 
        
        if (!hasItems) {
            if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
                type === 'column' ? removeColumn(item.id) : removeRow(item.id);
            }
        } else {
            if (type === 'column') {
                const availableCols = columns.filter(c => c.id !== item.id);
                setTargetMoveId(availableCols.length > 0 ? availableCols[0].id : 'unassigned');
            } else {
                setTargetMoveId('unassigned');
            }
            setDeletePrompt({ type, id: item.id, hasItems });
        }
    };

    const handleClearBacklogTasks = () => {
        if (!entityModal.item || !entityModal.item.items || entityModal.item.items.length === 0) {
            alert("The Backlog is already empty.");
            return;
        }

        if (window.confirm("Are you sure you want to permanently delete all tasks in the Backlog? This action cannot be undone.")) {
            entityModal.item.items.forEach((task: any) => {
                removeItem(task.id);
            });
            setEntityModal({ ...entityModal, isOpen: false });
        }
    };

    const handleAddTask = async () => {
        if (!addingToCell) return;
        const finalTitle = newTaskData.title.trim() || 'Untitled Task';
        const finalContent = newTaskData.content.trim() || 'brak';
        await addItem(addingToCell.colId, addingToCell.rowId, finalTitle, finalContent, newTaskData.color, newTaskData.assignedToId);
        setAddingToCell(null);
    };

    const getItems = (colId: number, rowId: number | null) => {
        const col = columns.find(c => c.id === colId);
        if (!col) return [];
        return col.items.filter(item => item.rowId === rowId);
    };

    const isBacklogModal = entityModal.mode === 'edit' && entityModal.type === 'column' && entityModal.item?.title === 'Backlog';

    // --- FUNKCJA RENDERUJĄCA KOMÓRKI ---
    const renderCell = (col: any, rowId: number | null, isBacklog: boolean, rowColor: string = '#ffffff') => {
        const items = getItems(col.id, rowId);
        const droppableId = `cell-${col.id}-${rowId}`;
        
        const cellBorderColor = isBacklog ? '#d1d5db' : (col.color && col.color !== '#ffffff' ? col.color : '#e5e7eb');
        const cellBgColor = isBacklog ? 'transparent' : rowColor;

        return (
            <div 
                key={droppableId}
                onDoubleClick={() => {
                    setAddingToCell({colId: col.id, rowId});
                    setNewTaskData({ title: '', content: '', color: '#ffffff', assignedToId: null });
                }}
                className={`w-[360px] flex-shrink-0 border-r-2 p-4 transition-colors duration-200 flex flex-col min-h-[140px] cursor-pointer
                    ${isBacklog ? 'border-dashed' : ''}
                    hover:brightness-[0.98]
                `}
                style={{ 
                    backgroundColor: cellBgColor,
                    borderColor: cellBorderColor
                }}
                title="Double-click empty space to add task"
            >
                <Droppable droppableId={droppableId} type="task">
                    {(provided, snapshot) => (
                        <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            // ZMIANA: Usunięte gap-4, zostaje tylko flex-col i transition-colors
                            className={`flex-1 flex flex-col rounded-xl transition-colors h-full
                                ${snapshot.isDraggingOver ? 'bg-black/5 shadow-inner' : ''}
                            `}
                        >
                            {items.map((item, idx) => (
                                <Task key={item.id} item={item} index={idx} columns={columns} rows={rows} />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col w-full bg-gray-50 relative overflow-hidden">
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-auto p-4">
                    <div className="inline-block min-w-full pb-20 bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        
                        {/* --- COLUMN HEADERS --- */}
                        <div className="flex sticky top-0 z-20 items-stretch border-b-2 border-gray-200 bg-white shadow-sm">
                            
                            <div className="w-56 flex-shrink-0 border-r-2 border-gray-200 p-6 bg-gray-50 flex items-center justify-center">
                                <button onClick={() => {
                                    setEntityModal({ isOpen: true, mode: 'add', type: 'row' });
                                    setEntityEditData({ title: '', color: '#ffffff' });
                                }} className="w-full py-3 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 text-gray-500 font-bold text-sm gap-2 transition-colors" title="Add new row">
                                    <Plus size={18}/> Add Row
                                </button>
                            </div>
                             
                            {backlogColumn && (
                                <div 
                                    onDoubleClick={() => {
                                        setEntityModal({ isOpen: true, mode: 'edit', type: 'column', item: backlogColumn });
                                        setEntityEditData({ title: backlogColumn.title, color: '#ffffff' });
                                    }}
                                    className="w-[360px] flex-shrink-0 border-r-2 border-dashed p-6 flex items-center justify-center transition-colors select-none cursor-pointer hover:bg-gray-50"
                                    style={{ borderColor: '#d1d5db', backgroundColor: 'transparent' }}
                                    title="Double-click to edit/clear Backlog"
                                >
                                    <h3 className="font-black text-sm tracking-widest uppercase text-center w-full truncate text-gray-400">{backlogColumn.title}</h3>
                                </div>
                            )}

                            <Droppable droppableId="board-columns" direction="horizontal" type="column">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex h-full">
                                        {draggableColumns.map((col, index) => (
                                            <Draggable key={`col-${col.id}`} draggableId={`col-${col.id}`} index={index}>
                                                {(provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onDoubleClick={() => {
                                                            setEntityModal({ isOpen: true, mode: 'edit', type: 'column', item: col });
                                                            setEntityEditData({ title: col.title, color: col.color || '#ffffff' });
                                                        }}
                                                        // ZMIANA: Usunięto transition-all i scale, dodano tylko transition-shadow i transition-colors
                                                        className={`w-[360px] flex-shrink-0 border-r-2 p-6 flex items-center justify-center select-none cursor-grab active:cursor-grabbing hover:brightness-95 transition-shadow transition-colors
                                                            ${snapshot.isDragging ? 'z-50 shadow-2xl ring-2 ring-purple-500 border-none rounded-xl' : ''}
                                                        `}
                                                        style={{ 
                                                            backgroundColor: col.color || '#ffffff',
                                                            borderColor: col.color && col.color !== '#ffffff' ? col.color : '#e5e7eb',
                                                            ...provided.draggableProps.style
                                                        }}
                                                        title="Drag to reorder, Double-click to edit"
                                                    >
                                                        <h3 className="font-black text-sm tracking-widest uppercase text-center w-full truncate text-gray-900">{col.title}</h3>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                            
                            <div className="flex-1 min-w-[120px] p-6 flex items-center justify-center bg-white border-b-2 border-transparent">
                                <button onClick={() => {
                                    setEntityModal({ isOpen: true, mode: 'add', type: 'column' });
                                    setEntityEditData({ title: '', color: '#ffffff' });
                                }} className="w-12 h-12 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="Add new column">
                                    <Plus size={20}/>
                                </button>
                            </div>
                        </div>

                        {/* --- UNASSIGNED ROW --- */}
                        <div className="flex relative border-b-2 border-gray-200 bg-white">
                            <div className="w-56 flex-shrink-0 border-r-2 border-gray-200 p-6 flex flex-col items-center justify-center text-center bg-gray-50/50">
                                <span className="font-black text-sm uppercase tracking-widest text-gray-400">Unassigned</span>
                            </div>
                            
                            {backlogColumn && renderCell(backlogColumn, null, true, '#ffffff')}
                            {draggableColumns.map(col => renderCell(col, null, false, '#ffffff'))}
                            
                            <div className="flex-1 bg-white border-b-2 border-transparent"></div>
                        </div>

                        {/* --- ROWS --- */}
                        <Droppable droppableId="board-rows" type="row">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {rows.map((row, index) => (
                                        <Draggable key={`row-${row.id}`} draggableId={`row-${row.id}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    // ZMIANA: Usunięto transition-all i scale
                                                    className={`flex relative border-b-2 border-gray-200 transition-shadow transition-colors
                                                        ${snapshot.isDragging ? 'z-50 ring-4 ring-purple-500 shadow-2xl bg-white rounded-xl overflow-hidden' : ''}
                                                    `}
                                                    style={{ ...provided.draggableProps.style }}
                                                >
                                                    {/* ROW HEADER */}
                                                    <div 
                                                        {...provided.dragHandleProps}
                                                        onDoubleClick={() => {
                                                            setEntityModal({ isOpen: true, mode: 'edit', type: 'row', item: row });
                                                            setEntityEditData({ title: row.title, color: row.color || '#ffffff' });
                                                        }}
                                                        className="w-56 flex-shrink-0 border-r-2 border-gray-200 p-6 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing hover:brightness-95 transition-colors select-none"
                                                        style={{ backgroundColor: row.color || '#ffffff' }}
                                                        title="Drag to reorder, Double-click to edit"
                                                    >
                                                        <span className="font-black text-sm uppercase tracking-widest text-gray-900 drop-shadow-sm">{row.title}</span>
                                                    </div>

                                                    {/* CELLS */}
                                                    {backlogColumn && renderCell(backlogColumn, row.id, true, row.color || '#ffffff')}
                                                    {draggableColumns.map(col => renderCell(col, row.id, false, row.color || '#ffffff'))}
                                                    
                                                    <div className="flex-1" style={{ backgroundColor: row.color || '#ffffff' }}></div>
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

                {/* --- TRASH ZONE --- */}
                <div 
                    className={`fixed bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full z-[200] transition-all duration-500 ease-out flex items-center justify-center bg-red-500/95 shadow-[0_10px_40px_rgba(239,68,68,0.6)] border-4 border-white backdrop-blur-md
                        ${showTrash ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-75 invisible pointer-events-none'}
                    `}
                >
                    {['task', 'column', 'row'].map(dropType => (
                        <Droppable key={`trash-${dropType}`} droppableId={`trash-${dropType}`} type={dropType} isDropDisabled={!showTrash}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`absolute inset-0 rounded-full flex items-center justify-center transition-colors duration-200 overflow-hidden
                                        ${snapshot.isDraggingOver ? 'bg-red-600 shadow-inner' : 'bg-transparent'}
                                        ${dragState.type === dropType ? 'z-10' : 'z-0 pointer-events-none opacity-0'}
                                    `}
                                >
                                    {dragState.type === dropType && (
                                        <div className={`flex flex-col items-center gap-1 transition-transform text-white ${snapshot.isDraggingOver ? 'scale-125' : 'scale-100'}`}>
                                            <Trash2 size={40} />
                                            <span className="font-bold text-[10px] uppercase tracking-widest text-red-100 text-center leading-tight">Drop to<br/>delete</span>
                                        </div>
                                    )}
                                    <div className="hidden">{provided.placeholder}</div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* --- ZUNIFIKOWANY MODAL: EDYCJA KOLUMN I WIERSZY --- */}
            {entityModal.isOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 sm:p-6" 
                    onClick={() => setEntityModal({...entityModal, isOpen: false})}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="relative flex items-center justify-center p-6 border-b border-gray-100 bg-white">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                                {entityModal.mode === 'add' ? 'Add New' : 'Edit'} {entityModal.type === 'column' ? 'Column' : 'Row'}
                            </h3>
                            <button onClick={() => setEntityModal({...entityModal, isOpen: false})} className="absolute right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <X size={24}/>
                            </button>
                        </div>

                        <div className="p-6 sm:p-10 flex flex-col gap-6 overflow-y-auto bg-white">
                            <div>
                                <label className="block font-bold uppercase tracking-wider mb-2.5 text-xs text-gray-500">Title</label>
                                {isBacklogModal ? (
                                    <input 
                                        className="w-full text-base font-bold p-4 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed shadow-inner"
                                        value="Backlog"
                                        disabled
                                        title="Backlog title is protected and cannot be changed"
                                    />
                                ) : (
                                    <input 
                                        className="w-full text-base font-bold p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner"
                                        value={entityEditData.title}
                                        onChange={(e) => setEntityEditData({...entityEditData, title: e.target.value})}
                                        placeholder={`Enter ${entityModal.type} title...`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleEntitySave();
                                            }
                                        }}
                                        autoFocus
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block font-bold uppercase tracking-wider mb-2.5 text-xs text-gray-500">Background Color</label>
                                {isBacklogModal ? (
                                    <div className="text-sm font-medium text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        Backlog column color is locked to transparent.
                                    </div>
                                ) : (
                                    <div className="flex gap-3.5 flex-wrap">
                                        {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                            <button 
                                                key={color} 
                                                onClick={() => setEntityEditData({...entityEditData, color})} 
                                                className={`w-9 h-9 rounded-full border border-gray-300 transition-all hover:scale-110 shadow ${entityEditData.color === color ? 'ring-2 ring-purple-500 ring-offset-2 scale-110' : ''}`} 
                                                style={{ backgroundColor: color }} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                            <div>
                                {entityModal.mode === 'edit' && !isBacklogModal && (
                                    <button onClick={handleEntityDelete} className="px-5 py-2.5 flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors shadow-sm border border-red-200">
                                        <Trash2 size={16}/> Delete
                                    </button>
                                )}

                                {isBacklogModal && (
                                    <button onClick={handleClearBacklogTasks} className="px-5 py-2.5 flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors shadow-sm border border-red-200">
                                        <Trash2 size={16}/> Clear Tasks
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setEntityModal({...entityModal, isOpen: false})} className="px-5 py-2.5 flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors shadow-sm">
                                    <Ban size={16}/> Cancel
                                </button>
                                <button onClick={handleEntitySave} className="px-6 py-2.5 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md">
                                    <Save size={16}/> {entityModal.mode === 'add' ? 'Add' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PEŁNOWYMIAROWY MODAL DODAWANIA TASKA --- */}
            {addingToCell && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 sm:p-6" 
                    onClick={() => setAddingToCell(null)}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="relative flex items-center justify-center p-6 border-b border-gray-100 bg-white">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">Add New Task</h3>
                            <button onClick={() => setAddingToCell(null)} className="absolute right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <X size={24}/>
                            </button>
                        </div>

                        <div className="p-6 sm:p-10 flex flex-col gap-6 overflow-y-auto bg-white">
                            <div>
                                <label className="block font-bold uppercase tracking-wider mb-2.5 text-xs text-gray-500">Title</label>
                                <input 
                                    className="w-full text-base font-bold p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner"
                                    value={newTaskData.title}
                                    onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                                    placeholder="Enter task title..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase tracking-wider mb-2.5 text-xs text-gray-500">Assignee</label>
                                <div className="relative">
                                    <select
                                        className="w-full text-sm p-4 pr-10 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner appearance-none cursor-pointer"
                                        value={newTaskData.assignedToId || ''}
                                        onChange={(e) => setNewTaskData({...newTaskData, assignedToId: e.target.value ? parseInt(e.target.value) : null})}
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase tracking-wider mb-2.5 text-xs text-gray-500">Description</label>
                                <textarea 
                                    className="w-full text-sm p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none min-h-[150px] shadow-inner"
                                    value={newTaskData.content}
                                    onChange={(e) => setNewTaskData({...newTaskData, content: e.target.value})}
                                    placeholder="Add details, steps, notes..."
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase tracking-wider mb-2.5 text-xs text-gray-500">Task Color</label>
                                <div className="flex gap-3.5">
                                    {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                        <button 
                                            key={color} 
                                            onClick={() => setNewTaskData({...newTaskData, color})}
                                            className={`w-9 h-9 rounded-full border border-gray-300 transition-all hover:scale-110 shadow
                                                ${newTaskData.color === color ? 'ring-2 ring-purple-500 ring-offset-2 scale-110' : ''}
                                            `}
                                            style={{ backgroundColor: color }}
                                            title={`Set this color`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
                            <button onClick={() => setAddingToCell(null)} className="px-5 py-2.5 flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors shadow-sm">
                                <Ban size={16}/> Cancel
                            </button>
                            <button onClick={handleAddTask} className="px-6 py-2.5 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md">
                                <Save size={16}/> Add Task
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Modal - Ostrzeżenie przy usuwaniu z listą wyboru */}
            {deletePrompt && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
                    <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h3 className="text-xl font-bold mb-6 text-center text-gray-900 leading-snug">
                                This {deletePrompt.type} contains tasks. What do you want to do with them?
                            </h3>
                            
                            <div className="flex flex-col gap-3">
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Move tasks to:
                                    </label>
                                    <select 
                                        className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                                        value={targetMoveId}
                                        onChange={(e) => setTargetMoveId(e.target.value === 'unassigned' ? 'unassigned' : parseInt(e.target.value))}
                                    >
                                        {deletePrompt.type === 'column' ? (
                                            columns.filter(c => c.id !== deletePrompt.id).map(c => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="unassigned">Unassigned zone</option>
                                                {rows.filter(r => r.id !== deletePrompt.id).map(r => (
                                                    <option key={r.id} value={r.id}>{r.title}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                    <button onClick={() => {
                                        if (deletePrompt.type === 'column') {
                                            if (targetMoveId === 'unassigned') {
                                                alert("You must select another column to move the tasks to.");
                                                return;
                                            }
                                            removeColumn(deletePrompt.id, 'move_tasks', targetMoveId as number);
                                        } else {
                                            const targetRowId = targetMoveId === 'unassigned' ? null : (targetMoveId as number);
                                            removeRow(deletePrompt.id, 'move_tasks', targetRowId as any);
                                        }
                                        setDeletePrompt(null);
                                    }} className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
                                        Move tasks & Delete {deletePrompt.type}
                                    </button>
                                </div>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">or</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                <button onClick={() => {
                                    deletePrompt.type === 'column' ? removeColumn(deletePrompt.id, 'delete_tasks') : removeRow(deletePrompt.id, 'delete_tasks');
                                    setDeletePrompt(null);
                                }} className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-sm transition-colors border border-red-100 shadow-sm">
                                    Delete all tasks permanently
                                </button>
                                <button onClick={() => setDeletePrompt(null)} className="py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors text-gray-600 shadow-sm">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;