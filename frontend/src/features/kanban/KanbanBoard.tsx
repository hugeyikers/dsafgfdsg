import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { Trash2, X } from 'lucide-react';

import EditSidebar from './components/EditSidebar';
import DeletePromptModal from './components/DeletePromptModal';

type PanelType = 'task' | 'column' | 'row';
type PanelMode = 'view' | 'add'; 

const SIDEBAR_LEFT_PADDING = 20;
const SIDEBAR_RIGHT_PADDING = 20;
const SIDEBAR_CONTENT_WIDTH = 360; 
const SIDEBAR_WIDTH = SIDEBAR_CONTENT_WIDTH + SIDEBAR_LEFT_PADDING + SIDEBAR_RIGHT_PADDING; 

const FOOTER_HEIGHT = 80;  
const FOOTER_LEFT_RATIO = 0.25;  
const FOOTER_RIGHT_RATIO = 0.75; 
const DETAILS_FIELD_RADIUS = '10px'; 

const KanbanBoard = () => {
    const { columns = [], rows = [], fetchBoard, addColumn, addRow, moveItem, removeColumn, removeRow, updateColumn, updateRow, addItem, reorderColumns, reorderRows, removeItem, updateItem } = useKanbanStore();
    const { users, fetchUsers, maxTasksPerUser = 5 } = useUserStore();
    
    const [dragState, setDragState] = useState<{ isDragging: boolean; type: string | null }>({ isDragging: false, type: null });
    const [showTrash, setShowTrash] = useState(false);
    const trashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [deletePrompt, setDeletePrompt] = useState<{type: PanelType, id: number, hasItems: boolean} | null>(null);
    const [targetMoveId, setTargetMoveId] = useState<number | 'unlabeled'>('unlabeled');
    
    const [filteredUserIds, setFilteredUserIds] = useState<number[]>([]);
    const [headerNode, setHeaderNode] = useState<HTMLElement | null>(null);

    const [panel, setPanel] = useState<{ isOpen: boolean, type: PanelType, mode: PanelMode, item: any, extra?: any }>({
        isOpen: false, type: 'task', mode: 'view', item: null
    });
    
    const [activeField, setActiveField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<any>('');
    const [formData, setFormData] = useState({ title: '', content: '', color: '#ffffff', limit: 0, assignedToId: null as number | null });

    useEffect(() => {
        fetchBoard();
        fetchUsers();
        setHeaderNode(document.getElementById('kanban-header-actions'));
    }, [fetchBoard, fetchUsers]);

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
    }, [columns, formData.assignedToId, panel.isOpen, panel.item, panel.type]);

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

    const onAssigneeDrop = (userId: number) => {
        if (panel.type === 'task' && panel.item) {
            setActiveField('assignedToId');
            saveEdit(userId);
        }
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
                    ? (columns.find(c => c.id === id)?.items.length ?? 0) > 0
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
                ? (columns.find(c => c.id === panel.item.id)?.items.length ?? 0) > 0
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

    const renderTeamBar = () => {
        if (!headerNode) return null;
        
        return createPortal(
            <div className="flex items-center gap-4 pl-8 border-l-2 border-gray-100 h-14">
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
                            className={`group relative flex flex-col items-center transition-all select-none cursor-pointer ${isDimmed ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
                            title={`${u.fullName} (${u.email}) • ${taskCount}/${maxTasksPerUser} tasks assigned`}
                        >
                            <div 
                                draggable={!isOverLimit}
                                onDragStart={(e) => { 
                                    e.stopPropagation(); 
                                    e.dataTransfer.setData('text/plain', u.id.toString()); 
                                    e.dataTransfer.effectAllowed = 'copy'; 
                                }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 ${!isOverLimit ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'} ${isFiltered ? 'bg-blue-100 text-blue-700 border-blue-500 ring-4 ring-blue-500/20' : isOverLimit ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 transition-all'}`}
                            >
                                {u.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <span className={`text-[11px] font-black mt-1 leading-none ${isOverLimit ? 'text-gray-400' : 'text-gray-500'}`}>
                                {taskCount}/{maxTasksPerUser}
                            </span>
                        </div>
                    );
                })}
                {filteredUserIds.length > 0 && (
                    <button 
                        onClick={() => setFilteredUserIds([])} 
                        title="Clear Filters"
                        className="flex items-center justify-center ml-2 text-red-500 hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-200"
                    >
                        <X size={22} />
                    </button>
                )}
            </div>,
            headerNode
        );
    };

    return (
        <div className="h-full flex w-full bg-gray-50 relative overflow-hidden">
            {renderTeamBar()}

            <EditSidebar
                panel={panel as any} 
                setPanel={setPanel as any} 
                formData={formData} 
                setFormData={setFormData}
                activeField={activeField} 
                editValue={editValue} 
                setEditValue={setEditValue}
                startEdit={startEdit} 
                cancelEdit={cancelEdit} 
                saveEdit={saveEdit}
                handleKeyDownTitle={handleKeyDownTitle} 
                handleKeyDownDefault={handleKeyDownDefault}
                handlePanelSaveGlobal={handlePanelSaveGlobal} 
                handlePanelDelete={handlePanelDelete}
                handleClearBacklogTasks={handleClearBacklogTasks}
                SIDEBAR_WIDTH={SIDEBAR_WIDTH} 
                SIDEBAR_LEFT_PADDING={SIDEBAR_LEFT_PADDING}
                SIDEBAR_RIGHT_PADDING={SIDEBAR_RIGHT_PADDING} 
                DETAILS_FIELD_RADIUS={DETAILS_FIELD_RADIUS}
                FOOTER_HEIGHT={FOOTER_HEIGHT} 
                FOOTER_LEFT_RATIO={FOOTER_LEFT_RATIO} 
                FOOTER_RIGHT_RATIO={FOOTER_RIGHT_RATIO}
                onAssigneeDrop={onAssigneeDrop}
                dispatchHover={() => {}} 
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex-1 overflow-auto p-4 pt-0 mt-4">
                        <div id="kanban-board-container" className="inline-block min-w-full pb-20 bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-16">
                            
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

            {deletePrompt && (
                <DeletePromptModal 
                    prompt={deletePrompt} 
                    onClose={() => setDeletePrompt(null)} 
                    targetMoveId={targetMoveId} 
                    setTargetMoveId={setTargetMoveId} 
                />
            )}
        </div>
    );
};

export default KanbanBoard;