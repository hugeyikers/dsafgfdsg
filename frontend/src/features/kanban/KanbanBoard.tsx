import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Plus, Trash2, X, Save, Ban, Users, Edit3, LayoutPanelLeft } from 'lucide-react';

type PanelType = 'task' | 'column' | 'row';
type PanelMode = 'view' | 'edit' | 'add';

const KanbanBoard = () => {
    const { columns, rows, fetchBoard, addColumn, addRow, moveItem, removeColumn, removeRow, updateColumn, updateRow, addItem, reorderColumns, reorderRows, removeItem, updateItem } = useKanbanStore();
    const { fetchUsers, users } = useUserStore();
    
    const [dragState, setDragState] = useState<{ isDragging: boolean; type: string | null }>({ isDragging: false, type: null });
    const [showTrash, setShowTrash] = useState(false);
    const trashTimeout = useRef<NodeJS.Timeout | null>(null);

    const [deletePrompt, setDeletePrompt] = useState<{type: PanelType, id: number, hasItems: boolean} | null>(null);
    const [targetMoveId, setTargetMoveId] = useState<number | 'unlabeled'>('unlabeled');
    
    // ZARZĄDZANIE PRAWYM PASKIEM I FILTROWANIEM
    const [showUsersBar, setShowUsersBar] = useState(false);
    const [filteredUserIds, setFilteredUserIds] = useState<number[]>([]);

    const leftSidebarRef = useRef<HTMLDivElement>(null);
    const topUsersBarRef = useRef<HTMLDivElement>(null);

    const [panel, setPanel] = useState<{ isOpen: boolean, type: PanelType, mode: PanelMode, item: any, extra?: any }>({
        isOpen: false, type: 'task', mode: 'view', item: null
    });
    
    const [formData, setFormData] = useState({ title: '', content: '', color: '#ffffff', limit: 0, assignedToId: null as number | null });

    useEffect(() => {
        fetchBoard();
        fetchUsers();
    }, []);

    // ZAMYKANIE LEWEGO PANELU
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!panel.isOpen) return;
            const target = event.target as Node;
            
            if (leftSidebarRef.current?.contains(target)) return;
            if (topUsersBarRef.current?.contains(target)) return;

            const boardContainer = document.getElementById('kanban-board-container');
            if (boardContainer?.contains(target)) return;

            if (!document.body.contains(target)) return;

            setPanel(prev => ({ ...prev, isOpen: false }));
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [panel.isOpen]);

    // SYNCHRONIZACJA PRZECIĄGNIĘĆ W LEWYM PANELU
    useEffect(() => {
        if (panel.isOpen && panel.type === 'task' && panel.item) {
            let updatedTask = null;
            for (const col of columns) {
                const found = col.items.find(i => i.id === panel.item.id);
                if (found) {
                    updatedTask = found;
                    break;
                }
            }
            if (updatedTask && updatedTask.assignedToId !== formData.assignedToId) {
                setPanel(prev => ({ ...prev, item: updatedTask }));
                setFormData(prev => ({ ...prev, assignedToId: updatedTask.assignedToId }));
            }
        }
    }, [columns]);

    const openPanel = (mode: PanelMode, type: PanelType, item: any = null, extra: any = null, isDoubleClick: boolean = false) => {
        const isSameItem = item ? panel.item?.id === item.id : (panel.item === null);
        const isSameExtra = extra ? (panel.extra?.colId === extra.colId && panel.extra?.rowId === extra.rowId) : true;

        if (panel.isOpen && panel.type === type && isSameItem && isSameExtra) {
            if (isDoubleClick) {
                setPanel(prev => ({ ...prev, isOpen: false }));
            } else if (panel.mode !== mode) {
                setPanel(prev => ({ ...prev, mode }));
            }
            return;
        }

        setPanel({ isOpen: true, mode, type, item, extra });
        setFormData({
            title: item?.title || '',
            content: item?.content === 'none' ? '' : (item?.content || ''),
            color: item?.color || '#ffffff',
            limit: item?.limit || 0,
            assignedToId: item?.assignedToId || null,
        });
    };

    const handleDragStart = (start: any) => {
        setDragState({ isDragging: true, type: start.type || 'task' });
        if (trashTimeout.current) clearTimeout(trashTimeout.current);
        trashTimeout.current = setTimeout(() => { setShowTrash(true); }, 1500);

        if (panel.isOpen) {
            const { draggableId, type } = start;
            if (!draggableId) return;
            const parts = draggableId.split('-');
            if (parts.length < 2) return;
            const id = parseInt(parts[1], 10);

            let draggedItem = null;
            if (type === 'task') {
                for (const col of columns) {
                    const found = col.items.find(i => i.id === id);
                    if (found) { draggedItem = found; break; }
                }
            } else if (type === 'column') {
                draggedItem = columns.find(c => c.id === id);
            } else if (type === 'row') {
                draggedItem = rows.find(r => r.id === id);
            }

            if (draggedItem) {
                const targetMode = type === 'task' ? 'view' : 'edit';
                openPanel(targetMode, type as PanelType, draggedItem, null, false);
            }
        }
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
                    if (panel.item?.id === id) setPanel(prev => ({ ...prev, isOpen: false }));
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
                        if (panel.item?.id === id) setPanel(prev => ({ ...prev, isOpen: false }));
                    }
                } else {
                    if (type === 'column') {
                        const availableCols = columns.filter(c => c.id !== id);
                        setTargetMoveId(availableCols.length > 0 ? availableCols[0].id : 'unlabeled');
                    } else {
                        setTargetMoveId('unlabeled');
                    }
                    setDeletePrompt({ type: type as PanelType, id, hasItems });
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
            const sourceParts = source.droppableId.split('-');
            const destParts = destination.droppableId.split('-');
            const sourceColId = parseInt(sourceParts[1]);
            const targetColId = parseInt(destParts[1]);
            const targetRowId = destParts[2] === 'null' ? null : parseInt(destParts[2]);

            if (sourceColId !== targetColId) {
                const targetCol = columns.find(c => c.id === targetColId);
                if (targetCol && targetCol.limit > 0 && targetCol.items.length >= targetCol.limit) {
                    if (!window.confirm(`WIP LIMIT WARNING!\n\nColumn "${targetCol.title}" has a WIP limit of ${targetCol.limit} tasks.\nAdding this task will exceed the limit. Are you sure you want to proceed?`)) {
                        return;
                    }
                }
            }

            moveItem(itemId, targetColId, targetRowId);
        }
    };

    const handlePanelSave = async () => {
        const finalTitle = formData.title.trim() || `New ${panel.type}`;

        if (panel.type === 'column') {
            if (panel.mode === 'add') await addColumn(finalTitle, formData.color, formData.limit);
            else await updateColumn(panel.item.id, { title: finalTitle, color: formData.color, limit: formData.limit });
        } 
        else if (panel.type === 'row') {
            if (panel.mode === 'add') await addRow(finalTitle, formData.color);
            else await updateRow(panel.item.id, { title: finalTitle, color: formData.color });
        } 
        else if (panel.type === 'task') {
            if (panel.mode === 'add') {
                const targetCol = columns.find(c => c.id === panel.extra.colId);
                if (targetCol && targetCol.limit > 0 && targetCol.items.length >= targetCol.limit) {
                    if (!window.confirm(`WIP LIMIT WARNING!\n\nColumn "${targetCol.title}" has a WIP limit of ${targetCol.limit} tasks.\nAdding a new task will exceed the limit. Are you sure you want to proceed?`)) return;
                }
            }

            if (formData.assignedToId && (!panel.item || panel.item.assignedToId !== formData.assignedToId)) {
                const userTaskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === formData.assignedToId).length;
                if (userTaskCount >= 5) {
                    alert(`USER LIMIT EXCEEDED!\n\nA maximum of 5 tasks per user is allowed.`);
                    return; 
                }
            }

            const finalContent = formData.content.trim() || 'none';
            if (panel.mode === 'add') {
                await addItem({
                    columnId: panel.extra.colId, 
                    rowId: panel.extra.rowId, 
                    title: finalTitle, 
                    content: finalContent, 
                    color: formData.color, 
                    assignedToId: formData.assignedToId
                });
            } else {
                await updateItem(panel.item.id, { title: finalTitle, content: finalContent, color: formData.color, assignedToId: formData.assignedToId });
            }
        }
        
        setPanel(prev => ({ ...prev, isOpen: false }));
    };

    const handlePanelDelete = () => {
        if (!panel.item) return;

        if (panel.type === 'task') {
            if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                removeItem(panel.item.id);
                setPanel(prev => ({ ...prev, isOpen: false }));
            }
        } else {
            if (panel.type === 'column' && panel.item.title === 'Backlog') return;
            const hasItems = panel.type === 'column' 
                ? columns.find(c => c.id === panel.item.id)?.items.length > 0
                : columns.some(c => c.items.some(i => i.rowId === panel.item.id));
            
            setPanel(prev => ({ ...prev, isOpen: false }));
            
            if (!hasItems) {
                if (window.confirm(`Are you sure you want to delete this ${panel.type}?`)) {
                    panel.type === 'column' ? removeColumn(panel.item.id) : removeRow(panel.item.id);
                }
            } else {
                if (panel.type === 'column') {
                    const availableCols = columns.filter(c => c.id !== panel.item.id);
                    setTargetMoveId(availableCols.length > 0 ? availableCols[0].id : 'unlabeled');
                } else {
                    setTargetMoveId('unlabeled');
                }
                setDeletePrompt({ type: panel.type, id: panel.item.id, hasItems });
            }
        }
    };

    const handleClearBacklogTasks = () => {
        if (!panel.item || !panel.item.items || panel.item.items.length === 0) return;
        if (window.confirm("Are you sure you want to permanently delete all tasks in the Backlog? This action cannot be undone.")) {
            panel.item.items.forEach((task: any) => removeItem(task.id));
            setPanel(prev => ({ ...prev, isOpen: false }));
        }
    };

    // LOGIKA POBIERANIA TASKÓW Z UWZGLĘDNIENIEM FILTROWANIA
    const getItems = (colId: number, rowId: number | null) => {
        const col = columns.find(c => c.id === colId);
        if (!col) return [];
        let result = col.items.filter(item => item.rowId === rowId);
        
        if (filteredUserIds.length > 0) {
            result = result.filter(item => item.assignedToId && filteredUserIds.includes(item.assignedToId));
        }
        
        return result;
    };

    const isBacklogPanel = panel.type === 'column' && panel.item?.title === 'Backlog';

    const renderCell = (col: any, rowId: number | null, isBacklog: boolean, rowColor: string = '#ffffff') => {
        const items = getItems(col.id, rowId);
        const droppableId = `cell-${col.id}-${rowId}`;
        const isOverLimit = col.limit > 0 && col.items.length > col.limit;
        const cellBorderColor = isOverLimit ? '#f87171' : (isBacklog ? '#d1d5db' : (col.color && col.color !== '#ffffff' ? col.color : '#e5e7eb'));
        const cellBgColor = isOverLimit ? '#fef2f2' : (isBacklog ? 'transparent' : rowColor);

        return (
            <div 
                key={droppableId}
                className={`group w-[360px] flex-shrink-0 border-r-2 transition-colors duration-200 flex flex-col min-h-[140px] cursor-pointer relative
                    ${isBacklog ? 'border-dashed' : ''}
                    ${isOverLimit ? 'ring-inset ring-2 ring-red-400/50' : ''}
                    hover:brightness-[0.98]
                `}
                style={{ backgroundColor: cellBgColor, borderColor: cellBorderColor }}
                onClick={(e) => {
                    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.flex-1')) return;
                    if (panel.isOpen) openPanel('add', 'task', null, { colId: col.id, rowId }, false);
                }}
                onDoubleClick={(e) => {
                    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.flex-1')) return;
                    openPanel('add', 'task', null, { colId: col.id, rowId }, true);
                }}
            >
                <Droppable droppableId={droppableId} type="task">
                    {(provided, snapshot) => (
                        <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 flex flex-col px-4 pt-4 transition-colors h-full
                                ${snapshot.isDraggingOver ? (isOverLimit ? 'bg-red-500/10' : 'bg-black/5 shadow-inner') : ''}
                            `}
                        >
                            {items.map((item, idx) => (
                                <Task 
                                    key={item.id} 
                                    item={item} 
                                    index={idx} 
                                    columns={columns} 
                                    rows={rows} 
                                    onClick={() => {
                                        if (panel.isOpen) openPanel('view', 'task', item, null, false);
                                    }}
                                    onDoubleClick={() => openPanel('view', 'task', item, null, true)}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <div className="h-[45px] w-full flex-shrink-0 pointer-events-none" />
                
                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <span className="text-[11px] italic text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">Double click to add task</span>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex w-full bg-gray-50 relative overflow-hidden">
            
            {/* --- PRZYCISK TOGGLE "ASSIGN USERS" --- */}
            <div ref={topUsersBarRef} className="fixed top-0 right-8 z-[60] flex items-center h-16 flex-row-reverse">
                <button
                    onClick={() => setShowUsersBar(!showUsersBar)}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-colors border-2 shadow-sm z-20
                        ${showUsersBar ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300'}
                        ${filteredUserIds.length > 0 ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                    `}
                >
                    <Users size={24} strokeWidth={2.5} />
                    
                    {/* ZNACZNIK AKTYWNEGO FILTRA */}
                    {filteredUserIds.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></div>
                    )}

                    <div className="absolute -bottom-8 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-800 text-white text-[10px] px-2 py-1 rounded">
                        Toggle Assign Users
                    </div>
                </button>
            </div>

            {/* --- LEWY SIDEBAR EDYCJI (ZWEŻA TABLICĘ) --- */}
            <aside 
                ref={leftSidebarRef}
                className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40 overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.05)] ${panel.isOpen ? 'w-[400px]' : 'w-0 border-r-0'}`}
            >
                <div className="w-[400px] flex flex-col h-full bg-gray-50/30">
                    
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white flex-shrink-0">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <LayoutPanelLeft className="text-purple-500" size={20}/>
                            {panel.mode === 'add' ? 'Add' : (panel.mode === 'edit' ? 'Edit' : 'Details')} {panel.type}
                        </h3>
                        <button onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <X size={20}/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                        
                        <div>
                            <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode !== 'view' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Title</label>
                            {panel.mode !== 'view' && !isBacklogPanel ? (
                                <input 
                                    className="w-full text-base font-bold p-3.5 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder={`Enter ${panel.type} title...`}
                                    autoFocus
                                />
                            ) : (
                                <h2 className="text-xl font-black text-gray-900 leading-tight">
                                    {panel.item?.title || `Untitled ${panel.type}`}
                                </h2>
                            )}
                        </div>

                        {panel.type === 'task' && (
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode !== 'view' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Assignee</label>
                                {panel.mode !== 'view' ? (
                                    <div className="relative">
                                        <select
                                            className="w-full text-sm font-bold p-3 pr-10 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm appearance-none cursor-pointer"
                                            value={formData.assignedToId || ''}
                                            onChange={(e) => setFormData({...formData, assignedToId: e.target.value ? parseInt(e.target.value) : null})}
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                        {panel.item?.assignedTo ? (
                                            <>
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-indigo-100 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">{panel.item.assignedTo.fullName.substring(0,2).toUpperCase()}</div>
                                                <span className="text-sm text-gray-800 font-bold">{panel.item.assignedTo.fullName}</span>
                                            </>
                                        ) : (
                                            <span className="italic text-gray-400 text-xs pl-1">Unassigned</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {panel.type === 'task' && (
                            <div className="flex-1 flex flex-col min-h-[150px]">
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode !== 'view' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Description</label>
                                {panel.mode !== 'view' ? (
                                    <textarea 
                                        className="w-full flex-1 text-sm p-4 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none shadow-sm"
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                        placeholder="Add details, steps, notes..."
                                    />
                                ) : (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex-1 shadow-sm overflow-y-auto">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {panel.item?.content && panel.item.content !== 'none' ? panel.item.content : <span className="italic text-gray-400">No description provided.</span>}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {panel.type === 'column' && !isBacklogPanel && (
                            <div>
                                <label className="block font-bold uppercase tracking-wider mb-2 text-[10px] text-purple-600">WIP Limit</label>
                                <select
                                    className="w-full text-sm font-bold p-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 shadow-sm cursor-pointer"
                                    value={formData.limit || 0}
                                    onChange={(e) => setFormData({...formData, limit: parseInt(e.target.value)})}
                                    disabled={panel.mode === 'view'}
                                >
                                    <option value={0}>None (No limit)</option>
                                    {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode !== 'view' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Color</label>
                            {isBacklogPanel ? (
                                <div className="text-xs font-medium text-gray-400 italic bg-gray-100 p-3 rounded-xl border border-gray-200">Backlog color is locked.</div>
                            ) : panel.mode !== 'view' ? (
                                <div className="flex gap-3 flex-wrap bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                        <button 
                                            key={color} onClick={() => setFormData({...formData, color})}
                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${formData.color === color ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-gray-200'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-inner" style={{ backgroundColor: panel.item?.color || '#ffffff' }} />
                                    <span className="text-xs font-bold text-gray-600">Card Color</span>
                                </div>
                            )}
                        </div>

                        {panel.mode === 'view' && panel.item?.createdAt && (
                            <div className="pt-4 border-t border-gray-200 space-y-3 mt-auto">
                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span className="uppercase font-bold tracking-wider">Created</span>
                                    <span className="font-semibold">{new Date(panel.item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span className="uppercase font-bold tracking-wider">Modified</span>
                                    <span className="font-semibold">{new Date(panel.item.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-200 bg-white flex justify-between items-center flex-shrink-0">
                        <div>
                            {(panel.mode === 'edit' || panel.mode === 'view') && !isBacklogPanel && (
                                <button onClick={handlePanelDelete} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm border border-red-100" title={`Delete ${panel.type}`}>
                                    <Trash2 size={18}/>
                                </button>
                            )}
                            {isBacklogPanel && (
                                <button onClick={handleClearBacklogTasks} className="px-3 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold rounded-xl transition-colors shadow-sm border border-red-100">
                                    Clear Tasks
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {panel.mode !== 'view' ? (
                                <>
                                    <button onClick={() => panel.mode === 'add' ? setPanel(prev => ({...prev, isOpen: false})) : setPanel(prev => ({...prev, mode: 'view'}))} className="px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
                                    <button onClick={handlePanelSave} className="px-5 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 flex items-center gap-1.5 transition-colors shadow-md"><Save size={16}/> Save</button>
                                </>
                            ) : (
                                <button onClick={() => setPanel(prev => ({...prev, mode: 'edit'}))} className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black flex items-center gap-1.5 transition-colors shadow-md"><Edit3 size={16}/> Edit {panel.type}</button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- GŁÓWNA TABLICA --- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex-1 overflow-auto p-4 pt-0 mt-4">
                        {/* ID do ignorowania zamykania przy klikaniu na tablicę */}
                        <div id="kanban-board-container" className="inline-block min-w-full pb-20 bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-16">
                            
                            {/* --- COLUMN HEADERS --- */}
                            <div className="flex sticky top-0 z-20 items-stretch border-b-2 border-gray-200 bg-white shadow-sm h-[88px]">
                                
                                <div className="w-56 h-full flex-shrink-0 border-r-2 border-gray-200 bg-white relative overflow-hidden group/corner">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openPanel('add', 'column', null, null, false);
                                        }}
                                        className="absolute inset-0 w-full h-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer outline-none font-black text-[12px] uppercase tracking-widest flex items-start justify-end pt-3.5 pr-4"
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                                    >
                                        Add Column &rarr;
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openPanel('add', 'row', null, null, false);
                                        }}
                                        className="absolute inset-0 w-full h-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer outline-none font-black text-[12px] uppercase tracking-widest flex items-end justify-start pb-3.5 pl-4 bg-gray-50/50"
                                        style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
                                    >
                                        Add Row &darr;
                                    </button>
                                    <div className="absolute inset-0 pointer-events-none">
                                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                            <line x1="0" y1="0" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                        </svg>
                                    </div>
                                </div>
                                 
                                {backlogColumn && (
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); if (panel.isOpen) openPanel('edit', 'column', backlogColumn, null, false); }}
                                        onDoubleClick={(e) => { e.stopPropagation(); openPanel('edit', 'column', backlogColumn, null, true); }}
                                        className="group w-[360px] h-full flex-shrink-0 border-r-2 border-dashed flex flex-col items-center justify-center transition-colors select-none cursor-pointer hover:bg-gray-50 relative"
                                        style={{ borderColor: '#d1d5db', backgroundColor: 'transparent' }}
                                    >
                                        <h3 className="font-black text-sm tracking-widest uppercase text-center w-full truncate text-gray-400 px-4">{backlogColumn.title}</h3>
                                        <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                            <span className="text-[10px] italic text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">Double click to edit</span>
                                        </div>
                                    </div>
                                )}

                                <Droppable droppableId="board-columns" direction="horizontal" type="column">
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex h-full items-stretch">
                                            {draggableColumns.map((col, index) => {
                                                const isOverLimit = col.limit > 0 && col.items.length > col.limit;
                                                return (
                                                    <Draggable key={`col-${col.id}`} draggableId={`col-${col.id}`} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div 
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={(e) => { e.stopPropagation(); if (panel.isOpen) openPanel('edit', 'column', col, null, false); }}
                                                                onDoubleClick={(e) => { e.stopPropagation(); openPanel('edit', 'column', col, null, true); }}
                                                                className={`group w-[360px] h-full flex-shrink-0 border-r-2 flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing hover:brightness-95 transition-shadow transition-colors relative
                                                                    ${snapshot.isDragging ? 'z-50 shadow-2xl ring-2 ring-purple-500 border-none rounded-xl' : ''}
                                                                    ${isOverLimit ? 'ring-inset ring-2 ring-red-500 z-10' : ''}
                                                                `}
                                                                style={{ 
                                                                    backgroundColor: isOverLimit ? '#fef2f2' : (col.color || '#ffffff'),
                                                                    borderColor: isOverLimit ? '#ef4444' : (col.color && col.color !== '#ffffff' ? col.color : '#e5e7eb'),
                                                                    ...provided.draggableProps.style
                                                                }}
                                                            >
                                                                <div className="flex flex-col items-center justify-center w-full px-4 mt-2">
                                                                    <h3 className={`font-black text-sm tracking-widest uppercase text-center w-full truncate ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>
                                                                        {col.title}
                                                                    </h3>
                                                                    {col.limit > 0 && (
                                                                        <span className={`text-xs font-bold mt-2 px-3 py-1 rounded-full border ${isOverLimit ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100/80 text-gray-500 border-gray-200'}`}>
                                                                            WIP: {col.items.length} / {col.limit}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                                                    <span className="text-[10px] italic text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">Drag to reorder / Double click</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
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
                                                        className={`flex relative border-b-2 border-gray-200 transition-shadow transition-colors
                                                            ${snapshot.isDragging ? 'z-50 ring-4 ring-purple-500 shadow-2xl bg-white rounded-xl overflow-hidden' : ''}
                                                        `}
                                                        style={{ ...provided.draggableProps.style }}
                                                    >
                                                        <div 
                                                            {...provided.dragHandleProps}
                                                            onClick={(e) => { e.stopPropagation(); if (panel.isOpen) openPanel('edit', 'row', row, null, false); }}
                                                            onDoubleClick={(e) => { e.stopPropagation(); openPanel('edit', 'row', row, null, true); }}
                                                            className="group w-56 flex-shrink-0 border-r-2 border-gray-200 p-6 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing hover:brightness-95 transition-colors select-none relative"
                                                            style={{ backgroundColor: row.color || '#ffffff' }}
                                                        >
                                                            <span className="font-black text-sm uppercase tracking-widest text-gray-900 drop-shadow-sm mb-2">{row.title}</span>
                                                            <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                                                <span className="text-[10px] italic text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">Drag to reorder / Double click</span>
                                                            </div>
                                                        </div>

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

                            {/* --- UNLABELED ROW --- */}
                            <div className="flex relative border-b-2 border-gray-200 bg-white">
                                <div className="w-56 flex-shrink-0 border-r-2 border-gray-200 p-6 flex flex-col items-center justify-center text-center bg-gray-50/50">
                                    <span className="font-black text-sm uppercase tracking-widest text-gray-400">Unlabeled</span>
                                </div>
                                {backlogColumn && renderCell(backlogColumn, null, true, '#ffffff')}
                                {draggableColumns.map(col => renderCell(col, null, false, '#ffffff'))}
                                <div className="flex-1 bg-white border-b-2 border-transparent"></div>
                            </div>
                        </div>
                    </div>

                    {/* TRASH ZONE */}
                    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full z-[200] transition-all duration-500 ease-out flex items-center justify-center bg-red-500/95 shadow-[0_10px_40px_rgba(239,68,68,0.6)] border-4 border-white backdrop-blur-md ${showTrash ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-75 invisible pointer-events-none'}`}>
                        {['task', 'column', 'row'].map(dropType => (
                            <Droppable key={`trash-${dropType}`} droppableId={`trash-${dropType}`} type={dropType} isDropDisabled={!showTrash}>
                                {(provided, snapshot) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className={`absolute inset-0 rounded-full flex items-center justify-center transition-colors duration-200 overflow-hidden ${snapshot.isDraggingOver ? 'bg-red-600 shadow-inner' : 'bg-transparent'} ${dragState.type === dropType ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}>
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
            </div>

            {/* --- PRAWY SIDEBAR Z UŻYTKOWNIKAMI (Z FILTROWANIEM) --- */}
            <aside className={`flex flex-col bg-white border-l border-gray-200 transition-all duration-300 ease-in-out z-40 overflow-y-auto overflow-x-hidden ${showUsersBar ? 'w-28' : 'w-0 border-l-0'}`}>
                <div className="flex flex-col items-center gap-7 py-6 min-w-[7rem] mt-2">
                    
                    {users.map(u => {
                        const taskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === u.id).length;
                        const isOverLimit = taskCount >= 5;
                        const isFiltered = filteredUserIds.includes(u.id);
                        const isAnyFilterActive = filteredUserIds.length > 0;
                        const isDimmed = isAnyFilterActive && !isFiltered;

                        let avatarClasses = "group relative flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 transition-all select-none cursor-pointer shadow-sm ";
                        if (isFiltered) {
                            avatarClasses += "border-blue-500 bg-blue-50 ring-4 ring-blue-500/30 scale-110 ";
                        } else if (isOverLimit) {
                            avatarClasses += "border-red-300 bg-red-50 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 ";
                        } else {
                            avatarClasses += "border-blue-200 bg-blue-50 hover:border-blue-500 hover:scale-110 ";
                        }

                        if (isDimmed) {
                            avatarClasses += "opacity-30 grayscale hover:opacity-100 hover:grayscale-0 ";
                        }

                        return (
                            <div
                                key={u.id}
                                draggable={!isOverLimit}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', u.id.toString());
                                    e.dataTransfer.effectAllowed = 'copy';
                                }}
                                onClick={() => {
                                    setFilteredUserIds(prev => 
                                        prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                                    );
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setFilteredUserIds([u.id]);
                                }}
                                className={avatarClasses}
                            >
                                <span className={`font-bold text-sm ${isOverLimit && !isFiltered ? 'text-gray-500' : 'text-blue-700'}`}>{u.fullName.substring(0, 2).toUpperCase()}</span>
                                <div className={`absolute -bottom-3 px-2 py-0.5 rounded-md text-xs font-bold border ${isOverLimit ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}>
                                    {taskCount}/5
                                </div>
                                <div className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-800 text-white text-[10px] px-2 py-1 rounded z-50">
                                    {isFiltered ? `Remove filter` : `Filter by ${u.fullName}`}
                                </div>
                            </div>
                        );
                    })}
                    {users.length === 0 && <span className="text-sm text-gray-400 italic bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">No users</span>}
                    
                    {/* PRZYCISK RESETOWANIA FILTROWANIA - NA SAMYM DOLE LITY */}
                    {filteredUserIds.length > 0 && (
                        <button 
                            onClick={() => setFilteredUserIds([])}
                            className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold bg-red-50 text-red-600 px-3 py-2 rounded-xl border border-red-200 hover:bg-red-100 transition-colors shadow-sm mt-2"
                        >
                            <X size={16} />
                            <span>Clear Filter</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* Modal Delete Guard */}
            {deletePrompt && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
                    <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h3 className="text-xl font-bold mb-6 text-center text-gray-900 leading-snug">
                                This {deletePrompt.type} contains tasks. What do you want to do with them?
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Move tasks to:</label>
                                    <select 
                                        className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                                        value={targetMoveId}
                                        onChange={(e) => setTargetMoveId(e.target.value === 'unlabeled' ? 'unlabeled' : parseInt(e.target.value))}
                                    >
                                        {deletePrompt.type === 'column' ? (
                                            columns.filter(c => c.id !== deletePrompt.id).map(c => <option key={c.id} value={c.id}>{c.title}</option>)
                                        ) : (
                                            <>
                                                <option value="unlabeled">Unlabeled zone</option>
                                                {rows.filter(r => r.id !== deletePrompt.id).map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                            </>
                                        )}
                                    </select>
                                    <button onClick={() => {
                                        if (deletePrompt.type === 'column') {
                                            if (targetMoveId === 'unlabeled') return alert("You must select another column to move the tasks to.");
                                            removeColumn(deletePrompt.id, 'move_tasks', targetMoveId as number);
                                        } else {
                                            removeRow(deletePrompt.id, 'move_tasks', targetMoveId === 'unlabeled' ? null : targetMoveId);
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