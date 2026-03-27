import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Plus, Trash2, X, Save, Users, LayoutPanelLeft } from 'lucide-react';

type PanelType = 'task' | 'column' | 'row';
type PanelMode = 'view' | 'add'; 

// ============================================================================
// KONFIGURACJA WIDOKU SIDEBARÓW
// ============================================================================
const SIDEBAR_LEFT_PADDING = 20;
const SIDEBAR_RIGHT_PADDING = 20;

const SIDEBAR_CONTENT_WIDTH = 360; 
const SIDEBAR_WIDTH = SIDEBAR_CONTENT_WIDTH + SIDEBAR_LEFT_PADDING + SIDEBAR_RIGHT_PADDING; 

const USERS_SIDEBAR_WIDTH = 90; // Zminiaturyzowany panel użytkowników

const FOOTER_HEIGHT = 80;  

const FOOTER_LEFT_RATIO = 0.25;  
const FOOTER_RIGHT_RATIO = 0.75; 

const DETAILS_FIELD_RADIUS = '5px'; 
// ============================================================================

const KanbanBoard = () => {
    const { columns, rows, fetchBoard, addColumn, addRow, moveItem, removeColumn, removeRow, updateColumn, updateRow, addItem, reorderColumns, reorderRows, removeItem, updateItem } = useKanbanStore();
    
    // WYCIĄGAMY GLOBALNY LIMIT ZADAŃ ZE STORE'A
    const { fetchUsers, users, maxTasksPerUser } = useUserStore();
    
    const [dragState, setDragState] = useState<{ isDragging: boolean; type: string | null }>({ isDragging: false, type: null });
    const [showTrash, setShowTrash] = useState(false);
    const trashTimeout = useRef<NodeJS.Timeout | null>(null);

    const [deletePrompt, setDeletePrompt] = useState<{type: PanelType, id: number, hasItems: boolean} | null>(null);
    const [targetMoveId, setTargetMoveId] = useState<number | 'unlabeled'>('unlabeled');
    
    const [showUsersBar, setShowUsersBar] = useState(false);
    const [filteredUserIds, setFilteredUserIds] = useState<number[]>([]);
    
    // Globalny tooltip userów (zawieszony na ekranie, żeby go nie ucinało)
    const [userTooltip, setUserTooltip] = useState<{id: number, name: string, top: number} | null>(null);

    const leftSidebarRef = useRef<HTMLDivElement>(null);
    const rightSidebarRef = useRef<HTMLDivElement>(null);
    const closeBtnMouseDown = useRef(false);

    const [panel, setPanel] = useState<{ isOpen: boolean, type: PanelType, mode: PanelMode, item: any, extra?: any }>({
        isOpen: false, type: 'task', mode: 'view', item: null
    });
    
    const [activeField, setActiveField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<any>('');
    const [formData, setFormData] = useState({ title: '', content: '', color: '#ffffff', limit: 0, assignedToId: null as number | null });

    useEffect(() => {
        fetchBoard();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!panel.isOpen) {
            setActiveField(null);
            setEditValue('');
        }
    }, [panel.isOpen]);

    useEffect(() => {
        if (panel.isOpen && panel.type === 'task' && panel.item) {
            let updatedTask = null;
            for (const col of columns) {
                const found = col.items.find(i => i.id === panel.item.id);
                if (found) { updatedTask = found; break; }
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

        setActiveField(null);
        setPanel({ isOpen: true, mode, type, item, extra });
        setFormData({
            title: item?.title || '',
            content: item?.content === 'none' ? '' : (item?.content || ''),
            color: item?.color || '#ffffff',
            limit: item?.limit || 0,
            assignedToId: item?.assignedToId || null,
        });
    };

    const startEdit = (field: string, value: any) => {
        setActiveField(field);
        setEditValue(value);
    };

    const cancelEdit = () => {
        setActiveField(null);
        setEditValue('');
    };

    const saveEdit = async (forcedValue?: any) => {
        if (!activeField || !panel.item) return;
        
        const id = panel.item.id;
        let finalValue = forcedValue !== undefined ? forcedValue : editValue;
        
        if (typeof finalValue === 'string') finalValue = finalValue.trim();
        if (activeField === 'content' && finalValue === '') finalValue = 'none';

        // Ochrona limitu przy zmianie Assignee w panelu
        if (panel.type === 'task' && activeField === 'assignedToId' && finalValue) {
            const userTaskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === finalValue && i.id !== id).length;
            if (userTaskCount >= maxTasksPerUser) {
                alert(`USER LIMIT EXCEEDED!\n\nA maximum of ${maxTasksPerUser} tasks per user is allowed.`);
                cancelEdit();
                return;
            }
        }

        try {
            if (panel.type === 'task') {
                await updateItem(id, { title: panel.item.title, content: panel.item.content, color: panel.item.color, assignedToId: panel.item.assignedToId, [activeField]: finalValue });
            } else if (panel.type === 'column') {
                await updateColumn(id, { title: panel.item.title, color: panel.item.color, limit: panel.item.limit, [activeField]: finalValue });
            } else if (panel.type === 'row') {
                await updateRow(id, { title: panel.item.title, color: panel.item.color, [activeField]: finalValue });
            }
            setPanel(prev => ({ ...prev, item: { ...prev.item, [activeField]: finalValue } }));
        } catch (e) {
            console.error("Save failed", e);
        }
        
        setActiveField(null);
    };

    const handleKeyDownTitle = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

    const handleKeyDownDefault = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            cancelEdit();
        } else if (e.key === 'Enter' && e.ctrlKey) {
            saveEdit();
        }
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
                openPanel('view', type as PanelType, draggedItem, null, false);
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

    const handlePanelSaveGlobal = async () => {
        const finalTitle = formData.title.trim() || `New ${panel.type}`;

        if (panel.type === 'column') {
            await addColumn(finalTitle, formData.color, formData.limit);
        } else if (panel.type === 'row') {
            await addRow(finalTitle, formData.color);
        } else if (panel.type === 'task') {
            const targetCol = columns.find(c => c.id === panel.extra.colId);
            if (targetCol && targetCol.limit > 0 && targetCol.items.length >= targetCol.limit) {
                if (!window.confirm(`WIP LIMIT WARNING!\n\nColumn "${targetCol.title}" has a WIP limit of ${targetCol.limit} tasks.\nAdding a new task will exceed the limit. Are you sure you want to proceed?`)) return;
            }

            if (formData.assignedToId) {
                const userTaskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === formData.assignedToId).length;
                if (userTaskCount >= maxTasksPerUser) {
                    alert(`USER LIMIT EXCEEDED!\n\nA maximum of ${maxTasksPerUser} tasks per user is allowed.`);
                    return; 
                }
            }

            const finalContent = formData.content.trim() || 'none';
            await addItem({
                columnId: panel.extra.colId, 
                rowId: panel.extra.rowId, 
                title: finalTitle, 
                content: finalContent, 
                color: formData.color, 
                assignedToId: formData.assignedToId
            });
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

    // SYSTEM LIVE PREVIEW KOLORÓW DLA TABLICY
    const getItems = (colId: number, rowId: number | null) => {
        const col = columns.find(c => c.id === colId);
        if (!col) return [];
        let result = col.items.filter(item => item.rowId === rowId);
        if (filteredUserIds.length > 0) result = result.filter(item => item.assignedToId && filteredUserIds.includes(item.assignedToId));
        
        if (panel.isOpen && activeField === 'color' && panel.type === 'task' && panel.item) {
            result = result.map(item => item.id === panel.item.id ? { ...item, color: editValue } : item);
        }
        return result;
    };

    const isBacklogPanel = panel.type === 'column' && panel.item?.title === 'Backlog';

    const renderCell = (col: any, rowId: number | null, isBacklog: boolean, rowColor: string = '#ffffff') => {
        const items = getItems(col.id, rowId);
        const droppableId = `cell-${col.id}-${rowId}`;
        const isOverLimit = col.limit > 0 && col.items.length > col.limit;
        
        const liveColColor = (panel.isOpen && activeField === 'color' && panel.type === 'column' && panel.item?.id === col.id) ? editValue : col.color;
        const cellBorderColor = isOverLimit ? '#f87171' : (isBacklog ? '#d1d5db' : (liveColColor && liveColColor !== '#ffffff' ? liveColColor : '#e5e7eb'));
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
                                    onClick={() => { if (panel.isOpen) openPanel('view', 'task', item, null, false); }}
                                    onDoubleClick={() => openPanel('view', 'task', item, null, true)}
                                />
                            ))}
                            {provided.placeholder}
                            
                            <div className="flex-1 min-h-[50px] group/empty relative mt-2">
                                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover/empty:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                    <span className="text-[11px] italic text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">Double click to add task</span>
                                </div>
                            </div>
                        </div>
                    )}
                </Droppable>
            </div>
        );
    };

    return (
        <div className="h-full flex w-full bg-gray-50 relative overflow-hidden">
            
            {/* GLOBALNY TOOLTIP UŻYTKOWNIKÓW (Zawieszony na ekranie) */}
            {userTooltip && (
                <div 
                    className="fixed z-[9999] whitespace-nowrap bg-gray-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md pointer-events-none transition-opacity"
                    style={{ 
                        top: `${userTooltip.top + 10}px`, 
                        right: showUsersBar ? `${USERS_SIDEBAR_WIDTH + 15}px` : '55px' 
                    }}
                >
                    {userTooltip.name}
                </div>
            )}

            {/* --- ZAKŁADKA DO WYSUWANIA SIDEBARA USERÓW (Wprawiona w prawy górny róg ekranu na stałe) --- */}
            <button
                onClick={() => setShowUsersBar(!showUsersBar)}
                style={{ right: showUsersBar ? `${USERS_SIDEBAR_WIDTH}px` : '0px' }}
                className="absolute top-0 z-[100] flex items-center justify-center w-10 h-10 transition-all duration-300 ease-in-out bg-white text-gray-500 hover:text-blue-600 hover:bg-blue-50 shadow-sm outline-none rounded-l-xl border-y-2 border-l-2 border-r-0 border-gray-200"
                title="Toggle Team Panel"
            >
                <div className={`transition-transform duration-300 ${showUsersBar ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="15" y1="3" x2="15" y2="21"></line>
                        <polyline points="10 15 7 12 10 9"></polyline>
                    </svg>
                </div>
            </button>

            {/* --- LEWY SIDEBAR EDYCJI I PODGLĄDU --- */}
            <aside 
                ref={leftSidebarRef}
                style={{ width: panel.isOpen ? `${SIDEBAR_WIDTH}px` : '0px' }}
                className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40 overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.05)] ${!panel.isOpen ? 'border-r-0' : ''}`}
            >
                <div style={{ width: `${SIDEBAR_WIDTH}px` }} className="flex flex-col h-full bg-gray-50/30">
                    
                    {/* 1. NAGŁÓWEK */}
                    <div 
                        style={{ paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px`, height: 60, background: '#d9d9d9' }}
                        className="flex font-black items-center justify-between py-6 border-b border-gray-100 flex-shrink-0"
                    >
                        <h3 className="text-lg text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <LayoutPanelLeft className="text-purple-500" size={20}/>
                            {panel.mode === 'add' ? 'Add' : 'Details'} {panel.type}
                        </h3>
                        <button onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <X size={25}/>
                        </button>
                    </div>

                    {/* 2. GŁÓWNA ZAWARTOŚĆ */}
                    <div 
                        style={{ paddingTop: `20px`, paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px` }}
                        className="flex-1 overflow-y-auto pb-6 flex flex-col gap-6"
                    >
                        
                        {/* ----------------- TITLE ----------------- */}
                        <div>
                            <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'title' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Title</label>
                            {panel.mode === 'add' ? (
                                <input 
                                    className="w-full text-base font-bold border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm"
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder={`Enter ${panel.type} title...`} autoFocus
                                />
                            ) : activeField === 'title' ? (
                                <div className="relative">
                                    <input 
                                        autoFocus
                                        className="w-full text-base font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                        value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownTitle}
                                    />
                                    <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Enter</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                </div>
                            ) : (
                                <div 
                                    className="group relative flex items-center border-2 border-transparent hover:border-purple-200 bg-transparent hover:bg-white transition-colors cursor-pointer"
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                    onDoubleClick={() => startEdit('title', panel.item.title)}
                                >
                                    <h2 className="text-base font-bold text-gray-900 leading-tight break-words">{panel.item?.title || `Untitled ${panel.type}`}</h2>
                                    <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                        <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ----------------- ASSIGNEE ----------------- */}
                        {panel.type === 'task' && (
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'assignedToId' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Assignee</label>
                                {panel.mode === 'add' ? (
                                    <select
                                        className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm appearance-none cursor-pointer"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }}
                                        value={formData.assignedToId || ''} onChange={(e) => setFormData({...formData, assignedToId: e.target.value ? parseInt(e.target.value) : null})}
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                                    </select>
                                ) : activeField === 'assignedToId' ? (
                                    <div className="relative">
                                        <select
                                            ref={(el) => {
                                                if (el && !el.dataset.opened) {
                                                    el.dataset.opened = 'true';
                                                    el.focus();
                                                    try { el.showPicker(); } catch (e) {} 
                                                }
                                            }}
                                            className="w-full text-sm font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm appearance-none cursor-pointer"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }}
                                            value={editValue || ''} onChange={(e) => setEditValue(e.target.value ? parseInt(e.target.value) : null)} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                                        </select>
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Select and click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Save</kbd> or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative flex items-center gap-3 bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }}
                                        onDoubleClick={() => startEdit('assignedToId', panel.item.assignedToId)}
                                    >
                                        {panel.item?.assignedTo ? (
                                            <>
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-indigo-100 flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
                                                    {panel.item.assignedTo.fullName.substring(0,2).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-800 font-bold truncate">{panel.item.assignedTo.fullName}</span>
                                            </>
                                        ) : (
                                            <span className="italic text-gray-400 text-xs pl-1">Unassigned</span>
                                        )}
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ----------------- DESCRIPTION ----------------- */}
                        {panel.type === 'task' && (
                            <div className="flex-1 flex flex-col min-h-[150px]">
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'content' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Description</label>
                                {panel.mode === 'add' ? (
                                    <textarea 
                                        className="w-full flex-1 text-sm py-4 border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all resize-none shadow-sm"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px' }} 
                                        value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Add details, steps, notes..."
                                    />
                                ) : activeField === 'content' ? (
                                    <div className="flex-1 flex flex-col">
                                        <textarea 
                                            autoFocus
                                            className="w-full flex-1 text-sm py-4 border-2 border-purple-400 bg-purple-50 focus:outline-none transition-all resize-none shadow-sm"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px' }} 
                                            value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                        />
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Ctrl + Enter</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative bg-white py-4 border-2 border-gray-100 hover:border-purple-200 flex-1 shadow-sm overflow-y-auto cursor-pointer transition-colors"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px' }}
                                        onDoubleClick={() => startEdit('content', panel.item.content === 'none' ? '' : panel.item.content)}
                                    >
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {panel.item?.content && panel.item.content !== 'none' ? panel.item.content : <span className="italic text-gray-400">No description provided.</span>}
                                        </p>
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ----------------- WIP LIMIT ----------------- */}
                        {panel.type === 'column' && !isBacklogPanel && (
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'limit' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>WIP Limit</label>
                                {panel.mode === 'add' ? (
                                    <select
                                        className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none shadow-sm cursor-pointer"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} 
                                        value={formData.limit || 0} onChange={(e) => setFormData({...formData, limit: parseInt(e.target.value)})}
                                    >
                                        <option value={0}>None (No limit)</option>
                                        {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                    </select>
                                ) : activeField === 'limit' ? (
                                    <div className="relative">
                                        <select
                                            ref={(el) => {
                                                if (el && !el.dataset.opened) {
                                                    el.dataset.opened = 'true';
                                                    el.focus();
                                                    try { el.showPicker(); } catch (e) {} 
                                                }
                                            }}
                                            className="w-full text-sm font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm cursor-pointer"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} 
                                            value={editValue} onChange={(e) => setEditValue(parseInt(e.target.value))} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                        >
                                            <option value={0}>None (No limit)</option>
                                            {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                        </select>
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Select and click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Save</kbd> or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative flex items-center bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                        onDoubleClick={() => startEdit('limit', panel.item.limit)}
                                    >
                                        <span className="text-sm font-bold text-gray-800">{panel.item.limit === 0 ? 'None (No limit)' : panel.item.limit}</span>
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ----------------- COLOR ----------------- */}
                        <div>
                            <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'color' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Color</label>
                            {isBacklogPanel ? (
                                <div 
                                    className="text-xs font-medium text-gray-400 italic bg-gray-100 border border-gray-200 flex items-center" 
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', height: '56px' }}
                                >
                                    Backlog color is locked.
                                </div>
                            ) : panel.mode === 'add' ? (
                                <div 
                                    className="flex gap-3 flex-wrap items-center bg-white border-2 border-gray-200 shadow-sm" 
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}
                                >
                                    {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                        <button 
                                            key={color} onClick={() => setFormData({...formData, color})}
                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${formData.color === color ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            ) : activeField === 'color' ? (
                                <div tabIndex={0} ref={el => el?.focus()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit(); }} onKeyDown={handleKeyDownDefault} className="outline-none">
                                    <div 
                                        className="flex gap-3 flex-wrap items-center bg-purple-50 shadow-sm" 
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}
                                    >
                                        {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(c => (
                                            <button 
                                                key={c} 
                                                onMouseDown={(e) => e.preventDefault()} 
                                                onClick={() => setEditValue(c)} 
                                                onDoubleClick={(e) => { e.preventDefault(); setEditValue(c); setTimeout(() => saveEdit(c), 0); }} 
                                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${editValue === c ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-transparent'}`} 
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click to preview, <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Double click</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                </div>
                            ) : (
                                <div 
                                    className="group relative flex items-center gap-3 bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors"
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                    onDoubleClick={() => startEdit('color', panel.item.color)}
                                >
                                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner flex-shrink-0" style={{ backgroundColor: panel.item?.color || '#ffffff' }} />
                                    <span className="text-sm font-bold text-gray-800">Card Color</span>
                                    <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                        <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ----------------- DATES ----------------- */}
                        {panel.mode === 'view' && panel.item?.createdAt && (
                            <div className="border-t border-gray-200 space-y-3" style={{ marginTop: 'auto', paddingTop: '20px', marginBottom: '10px' }}>
                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span className="uppercase font-bold tracking-wider">Created</span>
                                    <span className="font-semibold">{new Date(panel.item.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span className="uppercase font-bold tracking-wider">Last modified</span>
                                    <span className="font-semibold">{new Date(panel.item.updatedAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. STOPKA */}
                    <div style={{ height: `${FOOTER_HEIGHT}px` }} className="flex border-t border-gray-200 bg-white flex-shrink-0">
                        
                        {/* LEWA STRONA (Cancel / Discard / Usuwanie) */}
                        <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                            {panel.mode === 'add' ? (
                                <button onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="w-full h-full flex items-center justify-center bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors border-r border-gray-200">
                                    Cancel
                                </button>
                            ) : activeField ? (
                                <button onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }} className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 border-r border-gray-200 text-xs font-bold hover:bg-red-100 transition-colors">
                                    Discard
                                </button>
                            ) : panel.mode === 'view' && !isBacklogPanel ? (
                                <button onClick={handlePanelDelete} className="w-full h-full flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors border-r border-gray-200" title={`Delete ${panel.type}`}>
                                    <Trash2 size={24}/>
                                </button>
                            ) : isBacklogPanel ? (
                                <button onClick={handleClearBacklogTasks} className="w-full h-full flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold transition-colors border-r border-gray-200">
                                    Clear Tasks
                                </button>
                            ) : (
                                <div className="w-full h-full bg-gray-50 border-r border-gray-200"></div>
                            )}
                        </div>

                        {/* PRAWA STRONA (Add / Save / Zamknij Detale) */}
                        <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                            {panel.mode === 'add' ? (
                                <button onClick={handlePanelSaveGlobal} className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                                    <Plus size={18} className="mr-2"/> Add
                                </button>
                            ) : activeField ? (
                                <button onMouseDown={(e) => { e.preventDefault(); saveEdit(); }} className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                                    <Save size={18} className="mr-2"/> Save
                                </button>
                            ) : (
                                <button 
                                    onMouseDown={() => { closeBtnMouseDown.current = true; }}
                                    onMouseLeave={() => { closeBtnMouseDown.current = false; }}
                                    onClick={() => { 
                                        if (closeBtnMouseDown.current) {
                                            setPanel(prev => ({...prev, isOpen: false})); 
                                        }
                                        closeBtnMouseDown.current = false;
                                    }}
                                    className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
                                >
                                    Close Details
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </aside>

            {/* --- GŁÓWNA TABLICA --- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex-1 overflow-auto p-4 pt-0 mt-4">
                        <div id="kanban-board-container" className="inline-block min-w-full pb-20 bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-16">
                            
                            {/* --- COLUMN HEADERS --- */}
                            <div className="flex sticky top-0 z-20 items-stretch border-b-2 border-gray-200 bg-white shadow-sm h-[88px]">
                                
                                <div className="w-56 h-full flex-shrink-0 border-r-2 border-gray-200 bg-white relative overflow-hidden group/corner">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openPanel('add', 'column', null, null, false); }}
                                        className="absolute inset-0 w-full h-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer outline-none font-black text-[12px] uppercase tracking-widest flex items-start justify-end pt-3.5 pr-4" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                                    > Add Column &rarr; </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openPanel('add', 'row', null, null, false); }}
                                        className="absolute inset-0 w-full h-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer outline-none font-black text-[12px] uppercase tracking-widest flex items-end justify-start pb-3.5 pl-4 bg-gray-50/50" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
                                    > Add Row &darr; </button>
                                    <div className="absolute inset-0 pointer-events-none">
                                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100"><line x1="0" y1="0" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>
                                    </div>
                                </div>
                                 
                                {backlogColumn && (
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); if (panel.isOpen) openPanel('view', 'column', backlogColumn, null, false); }}
                                        onDoubleClick={(e) => { e.stopPropagation(); openPanel('view', 'column', backlogColumn, null, true); }}
                                        className="group w-[360px] h-full flex-shrink-0 border-r-2 border-dashed flex flex-col items-center justify-center transition-colors select-none cursor-pointer hover:bg-gray-50 relative"
                                        style={{ borderColor: '#d1d5db', backgroundColor: 'transparent' }}
                                    >
                                        <h3 className="font-black text-sm tracking-widest uppercase text-center w-full truncate text-gray-400 px-4">{backlogColumn.title}</h3>
                                        <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                            <span className="text-[10px] italic text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">Double click to view</span>
                                        </div>
                                    </div>
                                )}

                                <Droppable droppableId="board-columns" direction="horizontal" type="column">
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex h-full items-stretch">
                                            {draggableColumns.map((col, index) => {
                                                const isOverLimit = col.limit > 0 && col.items.length > col.limit;
                                                const liveColColor = (panel.isOpen && activeField === 'color' && panel.type === 'column' && panel.item?.id === col.id) ? editValue : col.color;

                                                return (
                                                    <Draggable key={`col-${col.id}`} draggableId={`col-${col.id}`} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div 
                                                                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                onClick={(e) => { e.stopPropagation(); if (panel.isOpen) openPanel('view', 'column', col, null, false); }}
                                                                onDoubleClick={(e) => { e.stopPropagation(); openPanel('view', 'column', col, null, true); }}
                                                                className={`group w-[360px] h-full flex-shrink-0 border-r-2 flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing hover:brightness-95 transition-shadow transition-colors relative
                                                                    ${snapshot.isDragging ? 'z-50 shadow-2xl ring-2 ring-purple-500 border-none rounded-xl' : ''} ${isOverLimit ? 'ring-inset ring-2 ring-red-500 z-10' : ''}`}
                                                                style={{ backgroundColor: isOverLimit ? '#fef2f2' : (liveColColor || '#ffffff'), borderColor: isOverLimit ? '#ef4444' : (liveColColor && liveColColor !== '#ffffff' ? liveColColor : '#e5e7eb'), ...provided.draggableProps.style }}
                                                            >
                                                                <div className="flex flex-col items-center justify-center w-full px-4 mt-2">
                                                                    <h3 className={`font-black text-sm tracking-widest uppercase text-center w-full truncate ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>{col.title}</h3>
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
                                        {rows.map((row, index) => {
                                            const liveRowColor = (panel.isOpen && activeField === 'color' && panel.type === 'row' && panel.item?.id === row.id) ? editValue : (row.color || '#ffffff');
                                            return (
                                                <Draggable key={`row-${row.id}`} draggableId={`row-${row.id}`} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div 
                                                            ref={provided.innerRef} {...provided.draggableProps}
                                                            className={`flex relative border-b-2 border-gray-200 transition-shadow transition-colors ${snapshot.isDragging ? 'z-50 ring-4 ring-purple-500 shadow-2xl bg-white rounded-xl overflow-hidden' : ''}`} style={{ ...provided.draggableProps.style }}
                                                        >
                                                            <div 
                                                                {...provided.dragHandleProps}
                                                                onClick={(e) => { e.stopPropagation(); if (panel.isOpen) openPanel('view', 'row', row, null, false); }}
                                                                onDoubleClick={(e) => { e.stopPropagation(); openPanel('view', 'row', row, null, true); }}
                                                                className="group w-56 flex-shrink-0 border-r-2 border-gray-200 p-6 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing hover:brightness-95 transition-colors select-none relative"
                                                                style={{ backgroundColor: liveRowColor }}
                                                            >
                                                                <span className="font-black text-sm uppercase tracking-widest text-gray-900 drop-shadow-sm mb-2">{row.title}</span>
                                                                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                                                    <span className="text-[10px] italic text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">Drag to reorder / Double click</span>
                                                                </div>
                                                            </div>

                                                            {backlogColumn && renderCell(backlogColumn, row.id, true, liveRowColor)}
                                                            {draggableColumns.map(col => renderCell(col, row.id, false, liveRowColor))}
                                                            
                                                            <div className="flex-1" style={{ backgroundColor: liveRowColor }}></div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
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

            {/* --- PRAWY SIDEBAR USERÓW (MINIATUROWY) --- */}
            <aside 
                ref={rightSidebarRef}
                style={{ 
                    width: showUsersBar ? `${USERS_SIDEBAR_WIDTH}px` : '0px',
                    minWidth: showUsersBar ? `${USERS_SIDEBAR_WIDTH}px` : '0px',
                    opacity: showUsersBar ? 1 : 0
                }}
                className={`flex-shrink-0 flex flex-col bg-white transition-all duration-300 ease-in-out z-40 overflow-visible ${showUsersBar ? 'border-l-2 border-gray-200 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]' : ''}`}
            >
                <div style={{ width: `${USERS_SIDEBAR_WIDTH}px` }} className="flex flex-col h-full bg-gray-50/30 overflow-hidden">
                    
                    {/* ZMINIATURYZOWANI UŻYTKOWNICY */}
                    <div className="flex-1 overflow-y-auto pt-6 pb-4 flex flex-col items-center gap-5">
                        {users.map(u => {
                            const taskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === u.id).length;
                            const isOverLimit = taskCount >= maxTasksPerUser;
                            const isFiltered = filteredUserIds.includes(u.id);
                            const isAnyFilterActive = filteredUserIds.length > 0;
                            const isDimmed = isAnyFilterActive && !isFiltered;

                            return (
                                <div
                                    key={u.id}
                                    draggable={false} 
                                    onClick={() => setFilteredUserIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                    onDoubleClick={(e) => { e.stopPropagation(); setFilteredUserIds([u.id]); }}
                                    onMouseEnter={(e) => setUserTooltip({ id: u.id, name: u.fullName, top: e.currentTarget.getBoundingClientRect().top })}
                                    onMouseLeave={() => setUserTooltip(null)}
                                    className={`group relative flex flex-col items-center gap-1 transition-all select-none cursor-pointer ${isDimmed ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
                                >
                                    <div 
                                        draggable={!isOverLimit}
                                        onDragStart={(e) => { 
                                            e.stopPropagation(); 
                                            e.dataTransfer.setData('text/plain', u.id.toString()); 
                                            e.dataTransfer.effectAllowed = 'copy'; 
                                            setUserTooltip(null);
                                        }}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-sm border-2 ${!isOverLimit ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'} ${isFiltered ? 'bg-blue-100 text-blue-700 border-blue-500 ring-4 ring-blue-500/20' : isOverLimit ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:-translate-y-1 hover:shadow-md transition-all'}`}
                                    >
                                        {u.fullName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className={`text-[10px] font-black ${isOverLimit ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {taskCount}/{maxTasksPerUser}
                                    </span>
                                </div>
                            );
                        })}
                        {users.length === 0 && <span className="text-[10px] text-gray-400 italic">No users</span>}
                        {filteredUserIds.length > 0 && (
                            <button onClick={() => setFilteredUserIds([])} className="flex items-center justify-center mt-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Clear Filters">
                                <X size={20} />
                            </button>
                        )}
                    </div>
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
                                        value={targetMoveId} onChange={(e) => setTargetMoveId(e.target.value === 'unlabeled' ? 'unlabeled' : parseInt(e.target.value))}
                                    >
                                        {deletePrompt.type === 'column' ? columns.filter(c => c.id !== deletePrompt.id).map(c => <option key={c.id} value={c.id}>{c.title}</option>) : (
                                            <> <option value="unlabeled">Unlabeled zone</option> {rows.filter(r => r.id !== deletePrompt.id).map(r => <option key={r.id} value={r.id}>{r.title}</option>)} </>
                                        )}
                                    </select>
                                    <button onClick={() => {
                                        if (deletePrompt.type === 'column') {
                                            if (targetMoveId === 'unlabeled') return alert("You must select another column to move the tasks to.");
                                            removeColumn(deletePrompt.id, 'move_tasks', targetMoveId as number);
                                        } else { removeRow(deletePrompt.id, 'move_tasks', targetMoveId === 'unlabeled' ? null : targetMoveId); }
                                        setDeletePrompt(null);
                                    }} className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
                                        Move tasks & Delete {deletePrompt.type}
                                    </button>
                                </div>
                                <div className="relative flex items-center py-2"><div className="flex-grow border-t border-gray-200"></div><span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">or</span><div className="flex-grow border-t border-gray-200"></div></div>
                                <button onClick={() => { deletePrompt.type === 'column' ? removeColumn(deletePrompt.id, 'delete_tasks') : removeRow(deletePrompt.id, 'delete_tasks'); setDeletePrompt(null); }} className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-sm transition-colors border border-red-100 shadow-sm">
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