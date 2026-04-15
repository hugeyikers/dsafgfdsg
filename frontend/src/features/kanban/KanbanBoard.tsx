import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { X } from 'lucide-react';

import EditSidebar, { PanelState, PanelMode, PanelType } from './components/EditSidebar';

// ============================================================================
// SYSTEM ZMIENNYCH KONTROLUJĄCYCH WYMIARY (Edytuj te wartości!)
// ============================================================================

// 1. Szerokość pojedynczego kafelka zadania (w pikselach)
const TASK_WIDTH = 180; 

// 2. Odstępy (paddingi) zadania od krawędzi komórki (w pikselach)
const CELL_PADDING_X = 15;     // Odstęp z lewej i z prawej
const CELL_PADDING_TOP = 16;   // Odstęp z góry
const CELL_PADDING_BOTTOM = 40; // Odstęp z dołu

// AUTOMATYCZNE OBLICZENIA (Nie zmieniaj)
const COLUMN_WIDTH = TASK_WIDTH + (CELL_PADDING_X * 2);

// Inne wymiary interfejsu
const SIDEBAR_LEFT_PADDING = 20;
const SIDEBAR_RIGHT_PADDING = 20;
const SIDEBAR_CONTENT_WIDTH = 360; 
const SIDEBAR_WIDTH = SIDEBAR_CONTENT_WIDTH + SIDEBAR_LEFT_PADDING + SIDEBAR_RIGHT_PADDING; 

const FOOTER_HEIGHT = 80;  
const FOOTER_LEFT_RATIO = 0.25;  
const FOOTER_RIGHT_RATIO = 0.75; 
const DETAILS_FIELD_RADIUS = '10px'; 
// ============================================================================

const KanbanBoard = () => {
    const { columns = [], rows = [], fetchBoard, addColumn, addRow, moveItem, removeColumn, removeRow, updateColumn, updateRow, addItem, reorderColumns, reorderRows, removeItem, updateItem } = useKanbanStore();
    const { users, fetchUsers, maxTasksPerUser = 5 } = useUserStore();
    
    const [dragState, setDragState] = useState<{ isDragging: boolean; type: string | null }>({ isDragging: false, type: null });
    const [filteredUserIds, setFilteredUserIds] = useState<number[]>([]);
    const [headerNode, setHeaderNode] = useState<HTMLElement | null>(null);

    const [isDeletingSidebar, setIsDeletingSidebar] = useState(false);
    const [isClearingSidebar, setIsClearingSidebar] = useState(false);
    const [pendingMove, setPendingMove] = useState<{itemId: number, targetColId: number, targetRowId: number | null} | null>(null);

    const [panel, setPanel] = useState<PanelState>({ isOpen: false, type: 'task', mode: 'view', item: null });
    const [activeField, setActiveField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<any>('');
    const [formData, setFormData] = useState({ title: '', content: '', color: '#ffffff', limit: 0, assignedUsersIds: [] as number[] });

    useEffect(() => {
        fetchBoard();
        fetchUsers();
        setHeaderNode(document.getElementById('kanban-header-actions'));
    }, [fetchBoard, fetchUsers]);

    useEffect(() => {
        if (!panel.isOpen) {
            setActiveField(null);
            setEditValue('');
            setIsDeletingSidebar(false);
            setIsClearingSidebar(false);
            setPendingMove(null);
        }
    }, [panel.isOpen]);

    useEffect(() => {
        if (panel.isOpen && panel.type === 'task' && panel.item) {
            let updatedTask = null;
            for (const col of columns) {
                const found = col.items.find(i => i.id === panel.item.id);
                if (found) { updatedTask = found; break; }
            }
            if (updatedTask) {
                const currentIds = updatedTask.assignedUsers?.map((u: any) => u.id) || [];
                if (JSON.stringify(currentIds) !== JSON.stringify(formData.assignedUsersIds)) {
                    setPanel(prev => ({ ...prev, item: updatedTask }));
                    setFormData(prev => ({ ...prev, assignedUsersIds: currentIds }));
                }
            }
        }
    }, [columns, formData.assignedUsersIds, panel.isOpen, panel.item, panel.type]);

    const openPanel = (mode: PanelMode, type: PanelType, item: any = null, extra: any = null, isDoubleClick: boolean = false) => {
        const isSameItem = item ? panel.item?.id === item.id : (panel.item === null);
        const isSameExtra = extra ? (panel.extra?.colId === extra.colId && panel.extra?.rowId === extra.rowId) : true;

        if (panel.isOpen && panel.type === type && isSameItem && isSameExtra) {
            if (isDoubleClick) setPanel(prev => ({ ...prev, isOpen: false }));
            else if (panel.mode !== mode) setPanel(prev => ({ ...prev, mode }));
            return;
        }

        setActiveField(null);
        setIsDeletingSidebar(false);
        setIsClearingSidebar(false);
        setPanel({ isOpen: true, mode, type, item, extra });
        setFormData({
            title: item?.title || '',
            content: item?.content === 'none' ? '' : (item?.content || ''),
            color: item?.color || '#ffffff',
            limit: item?.limit || 0,
            assignedUsersIds: item?.assignedUsers?.map((u: any) => u.id) || [],
        });
    };

    const startEdit = (field: string, value: any) => { setActiveField(field); setEditValue(value); };
    const cancelEdit = () => { setActiveField(null); setEditValue(''); };

    const saveEdit = async (forcedValue?: any) => {
        if (!activeField || !panel.item) return;
        const id = panel.item.id;
        let finalValue = forcedValue !== undefined ? forcedValue : editValue;
        
        if (typeof finalValue === 'string') finalValue = finalValue.trim();
        if (activeField === 'content' && finalValue === '') finalValue = 'none';

        if (panel.type === 'task' && activeField === 'assignedUsersIds' && Array.isArray(finalValue)) {
            for (const userId of finalValue) {
                const userTaskCount = columns.flatMap(c => c.items).filter(i => i.assignedUsers?.some((u: any) => u.id === userId) && i.id !== id).length;
                if (userTaskCount >= maxTasksPerUser) {
                    alert(`USER LIMIT EXCEEDED!\n\nA maximum of ${maxTasksPerUser} tasks per user is allowed.`);
                    cancelEdit(); return;
                }
            }
        }

        try {
            if (panel.type === 'task') {
                const currentIds = panel.item.assignedUsers?.map((u: any) => u.id) || [];
                await updateItem(id, { 
                    title: panel.item.title, content: panel.item.content, color: panel.item.color, 
                    assignedUsersIds: activeField === 'assignedUsersIds' ? finalValue : currentIds,
                    [activeField]: finalValue 
                });
            } else if (panel.type === 'column') {
                await updateColumn(id, { title: panel.item.title, color: panel.item.color, limit: panel.item.limit, [activeField]: finalValue });
            } else if (panel.type === 'row') {
                await updateRow(id, { title: panel.item.title, color: panel.item.color, [activeField]: finalValue });
            }
            setPanel(prev => ({ ...prev, item: { ...prev.item, [activeField]: finalValue } }));
        } catch (e) { console.error("Save failed", e); }
        setActiveField(null);
    };

    const onAssigneeDrop = (userId: number) => {
        if (panel.type === 'task' && panel.item) {
            const currentIds = panel.item.assignedUsers?.map((u: any) => u.id) || [];
            if (!currentIds.includes(userId)) { setActiveField('assignedUsersIds'); saveEdit([...currentIds, userId]); }
        }
    };

    const onRemoveAssignee = (userId: number) => {
        if (panel.type === 'task' && panel.item) {
            const currentIds = panel.item.assignedUsers?.map((u: any) => u.id) || [];
            setActiveField('assignedUsersIds'); saveEdit(currentIds.filter((id: number) => id !== userId));
        }
    };

    const handleKeyDownTitle = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { e.preventDefault(); saveEdit(); } 
        else if (e.key === 'Escape') cancelEdit();
    };

    const handleKeyDownDefault = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') cancelEdit();
        else if (e.key === 'Enter' && e.ctrlKey) saveEdit();
    };

    const handleDragStart = (start: any) => {
        setDragState({ isDragging: true, type: start.type || 'task' });
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
            } else if (type === 'column') draggedItem = columns.find(c => c.id === id);
            else if (type === 'row') draggedItem = rows.find(r => r.id === id);

            if (draggedItem) openPanel('view', type as PanelType, draggedItem, null, false);
        }
    };

    const backlogColumn = columns.find(c => c.title === 'Backlog');
    const draggableColumns = columns.filter(c => c.title !== 'Backlog');

    const handleDragEnd = (result: any) => {
        setDragState({ isDragging: false, type: null });

        const { destination, source, draggableId, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        if (type === 'column') { 
            const hasBacklog = columns.some(c => c.title === 'Backlog');
            reorderColumns(source.index + (hasBacklog ? 1 : 0), destination.index + (hasBacklog ? 1 : 0)); 
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
                    setPendingMove({ itemId, targetColId, targetRowId });
                    const item = columns.flatMap(c => c.items).find(i => i.id === itemId);
                    if (item) openPanel('view', 'task', item, null, false);
                    return;
                }
            }
            moveItem(itemId, targetColId, targetRowId);
        }
    };

    const handleConfirmMove = () => {
        if (pendingMove) {
            moveItem(pendingMove.itemId, pendingMove.targetColId, pendingMove.targetRowId);
            setPendingMove(null); setPanel(prev => ({ ...prev, isOpen: false }));
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
            if (formData.assignedUsersIds && formData.assignedUsersIds.length > 0) {
                for (const userId of formData.assignedUsersIds) {
                    const userTaskCount = columns.flatMap(c => c.items).filter(i => i.assignedUsers?.some((u: any) => u.id === userId)).length;
                    if (userTaskCount >= maxTasksPerUser) { alert(`USER LIMIT EXCEEDED!\n\nA maximum of ${maxTasksPerUser} tasks per user is allowed.`); return; }
                }
            }
            const finalContent = formData.content.trim() || 'none';
            await addItem({
                columnId: panel.extra.colId, rowId: panel.extra.rowId, title: finalTitle, 
                content: finalContent, color: formData.color, assignedUsersIds: formData.assignedUsersIds
            });
        }
        setPanel(prev => ({ ...prev, isOpen: false }));
    };

    const handleClearTasks = () => {
        if (!panel.item) return;
        let tasksToRemove: any[] = [];
        if (panel.type === 'column') {
            const col = columns.find(c => c.id === panel.item.id);
            if (col && col.items) tasksToRemove = col.items;
        } else if (panel.type === 'row') {
            if (panel.item.id === 'unlabeled') tasksToRemove = columns.flatMap(c => c.items).filter(i => i.rowId === null);
            else tasksToRemove = columns.flatMap(c => c.items).filter(i => i.rowId === panel.item.id);
        }
        if (tasksToRemove.length > 0) tasksToRemove.forEach(task => removeItem(task.id));
        setPanel(prev => ({ ...prev, isOpen: false }));
        setIsClearingSidebar(false);
    };

    const closeSidebar = () => {
        setPanel(prev => ({ ...prev, isOpen: false }));
        setIsDeletingSidebar(false); setIsClearingSidebar(false); setPendingMove(null);
    };

    const getItems = (colId: number, rowId: number | null) => {
        const col = columns.find(c => c.id === colId);
        if (!col) return [];
        let result = col.items.filter(item => item.rowId === rowId);
        if (filteredUserIds.length > 0) result = result.filter(item => item.assignedUsers?.some((u: any) => filteredUserIds.includes(u.id)));
        if (panel.isOpen && activeField === 'color' && panel.type === 'task' && panel.item) {
            result = result.map(item => item.id === panel.item.id ? { ...item, color: editValue } : item);
        }
        return result;
    };

    const renderCell = (col: any, rowId: number | null, isBacklog: boolean, isUnlabeled: boolean = false) => {
        const items = getItems(col.id, rowId);
        const droppableId = `cell-${col.id}-${rowId}`;
        const isOverLimit = col.limit > 0 && col.items.length > col.limit;
        
        // ZMIANA KOLORÓW: Tło opiera się tylko na kolumnie, nie na wierszu!
        const liveColColor = (panel.isOpen && activeField === 'color' && panel.type === 'column' && panel.item?.id === col.id) ? editValue : col.color;
        const cellBgColor = isOverLimit ? '#fef2f2' : (isBacklog ? 'transparent' : (liveColColor || '#ffffff'));
        const cellBorderColor = isOverLimit ? '#f87171' : ((isBacklog || isUnlabeled) ? '#d1d5db' : (liveColColor && liveColColor !== '#ffffff' ? liveColColor : '#e5e7eb'));

        return (
            <div 
                key={droppableId}
                className={`group flex-shrink-0 border-r-2 transition-colors duration-200 flex flex-col min-h-[140px] cursor-pointer relative
                    ${(isBacklog || isUnlabeled) ? 'border-dashed' : ''}
                    ${isOverLimit ? 'ring-inset ring-2 ring-red-400/50' : ''}
                `}
                style={{ width: `${COLUMN_WIDTH}px`, minWidth: `${COLUMN_WIDTH}px`, backgroundColor: cellBgColor, borderColor: cellBorderColor }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isDeletingSidebar || isClearingSidebar) return;
                    const target = e.target as HTMLElement;
                    if (target === e.currentTarget || target.classList.contains('flex-1') || target.closest('.group\\/empty')) {
                        if (panel.isOpen) openPanel('add', 'task', null, { colId: col.id, rowId }, false);
                    }
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (isDeletingSidebar || isClearingSidebar) return;
                    const target = e.target as HTMLElement;
                    if (target === e.currentTarget || target.classList.contains('flex-1') || target.closest('.group\\/empty')) {
                        openPanel('add', 'task', null, { colId: col.id, rowId }, true);
                    }
                }}
            >
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors"></div>
                <Droppable droppableId={droppableId} type="task">
                    {(provided, snapshot) => (
                        <div 
                            ref={provided.innerRef} {...provided.droppableProps}
                            className={`flex-1 flex flex-col transition-colors h-full relative ${snapshot.isDraggingOver ? (isOverLimit ? 'bg-red-500/10' : 'bg-black/5 shadow-inner') : ''}`}
                            style={{ paddingLeft: `${CELL_PADDING_X}px`, paddingRight: `${CELL_PADDING_X}px`, paddingTop: `${CELL_PADDING_TOP}px`, paddingBottom: `${CELL_PADDING_BOTTOM}px` }}
                        >
                            {items.map((item, idx) => {
                                const isEditedTask = panel.isOpen && panel.type === 'task' && panel.item?.id === item.id;
                                return (
                                    <Task 
                                        key={item.id} item={item} index={idx} columns={columns} rows={rows} 
                                        onClick={() => { if (isDeletingSidebar || isClearingSidebar) return; if (panel.isOpen) openPanel('view', 'task', item, null, false); }}
                                        onDoubleClick={() => { if (isDeletingSidebar || isClearingSidebar) return; openPanel('view', 'task', item, null, true); }}
                                        isEdited={isEditedTask}
                                    />
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none pl-8">
                    <span className="text-[11px] italic text-gray-400 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">Double click to add task</span>
                </div>
            </div>
        );
    };

    const renderTeamBar = () => {
        if (!headerNode) return null;
        return createPortal(
            <div className="flex items-center gap-4 pl-8 h-14">
                {users.map(u => {
                    const taskCount = columns.flatMap(c => c.items).filter(i => i.assignedUsers?.some((a: any) => a.id === u.id)).length;
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
                                onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('text/plain', u.id.toString()); e.dataTransfer.effectAllowed = 'copy'; }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 ${!isOverLimit ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'} ${isFiltered ? 'bg-blue-100 text-blue-700 border-blue-500 ring-4 ring-blue-500/20' : isOverLimit ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 transition-all'}`}
                            >
                                {u.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <span className={`text-[11px] font-black mt-1 leading-none ${isOverLimit ? 'text-gray-400' : 'text-gray-500'}`}>{taskCount}/{maxTasksPerUser}</span>
                        </div>
                    );
                })}
                {filteredUserIds.length > 0 && (
                    <button 
                        onClick={() => setFilteredUserIds([])} 
                        title="Clear Filters" 
                        className=" ml-2 text-red-500 hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-200">
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
                panel={panel} setPanel={setPanel} formData={formData} setFormData={setFormData}
                activeField={activeField} editValue={editValue} setEditValue={setEditValue} startEdit={startEdit} cancelEdit={cancelEdit} 
                saveEdit={saveEdit} handleKeyDownTitle={handleKeyDownTitle} handleKeyDownDefault={handleKeyDownDefault}
                handlePanelSaveGlobal={handlePanelSaveGlobal} handleClearTasks={handleClearTasks}
                SIDEBAR_WIDTH={SIDEBAR_WIDTH} SIDEBAR_LEFT_PADDING={SIDEBAR_LEFT_PADDING} SIDEBAR_RIGHT_PADDING={SIDEBAR_RIGHT_PADDING} DETAILS_FIELD_RADIUS={DETAILS_FIELD_RADIUS} FOOTER_HEIGHT={FOOTER_HEIGHT} FOOTER_LEFT_RATIO={FOOTER_LEFT_RATIO} FOOTER_RIGHT_RATIO={FOOTER_RIGHT_RATIO}
                onAssigneeDrop={onAssigneeDrop} onRemoveAssignee={onRemoveAssignee} dispatchHover={() => {}} 
                isDeleting={isDeletingSidebar} setIsDeleting={setIsDeletingSidebar} isClearing={isClearingSidebar} setIsClearing={setIsClearingSidebar} pendingMove={pendingMove} setPendingMove={setPendingMove} handleConfirmMove={handleConfirmMove}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex-1 overflow-auto p-4 pt-0 mt-4" onClick={() => { if (panel.isOpen && !isDeletingSidebar && !isClearingSidebar) closeSidebar(); }}>
                        <div id="kanban-board-container" className="inline-block min-w-full pb-20 bg-white border-2 border-gray-200 rounded-2xl shadow-sm mt-16">
                            
                            <div className="flex sticky top-0 z-20 items-stretch border-b-2 border-gray-200 bg-white shadow-sm h-[88px]">
                                <div className="w-56 h-full flex-shrink-0 border-r-2 border-gray-200 bg-white relative overflow-hidden group/corner">
                                    <button onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('add', 'column', null, null, false); }} className="absolute inset-0 w-full h-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer outline-none font-black text-[12px] uppercase tracking-widest flex items-start justify-end pt-3.5 pr-4" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}> Add Column &rarr; </button>
                                    <button onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('add', 'row', null, null, false); }} className="absolute inset-0 w-full h-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer outline-none font-black text-[12px] uppercase tracking-widest flex items-end justify-start pb-3.5 pl-4 bg-gray-50/50" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}> Add Row &darr; </button>
                                    <div className="absolute inset-0 pointer-events-none"><svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100"><line x1="0" y1="0" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg></div>
                                </div>
                                 
                                {backlogColumn && (() => {
                                    const isEditedBacklog = panel.isOpen && panel.type === 'column' && panel.item?.id === backlogColumn.id;
                                    return (
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; if (panel.isOpen) openPanel('view', 'column', backlogColumn, null, false); }}
                                            onDoubleClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('view', 'column', backlogColumn, null, true); }}
                                            className={`group flex-shrink-0 border-r-2 border-dashed flex flex-col items-center justify-center transition-colors select-none cursor-pointer relative ${isEditedBacklog ? 'ring-inset ring-4 ring-blue-500 bg-blue-50/30 z-30' : ''}`}
                                            style={{ width: `${COLUMN_WIDTH}px`, minWidth: `${COLUMN_WIDTH}px`, borderColor: isEditedBacklog ? '#3b82f6' : '#d1d5db', backgroundColor: isEditedBacklog ? '#eff6ff' : 'transparent' }}
                                        >
                                            <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors"></div>
                                            <h3 className="font-black text-sm tracking-widest uppercase text-center w-full truncate text-gray-400 px-4 relative z-10">{backlogColumn.title}</h3>
                                            <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"><span className="text-[10px] italic text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">Double click to view</span></div>
                                        </div>
                                    );
                                })()}

                                <Droppable droppableId="board-columns" direction="horizontal" type="column">
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex h-full items-stretch">
                                            {draggableColumns.map((col, index) => {
                                                const isOverLimit = col.limit > 0 && col.items.length > col.limit;
                                                const liveColColor = (panel.isOpen && activeField === 'color' && panel.type === 'column' && panel.item?.id === col.id) ? editValue : col.color;
                                                const isEditedCol = panel.isOpen && panel.type === 'column' && panel.item?.id === col.id;

                                                return (
                                                    <Draggable key={`col-${col.id}`} draggableId={`col-${col.id}`} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div 
                                                                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; if (panel.isOpen) openPanel('view', 'column', col, null, false); }}
                                                                onDoubleClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('view', 'column', col, null, true); }}
                                                                className={`group flex-shrink-0 border-r-2 flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing transition-shadow transition-colors relative ${snapshot.isDragging ? 'z-50 shadow-2xl ring-2 ring-purple-500 border-none rounded-xl' : ''} ${isOverLimit ? 'ring-inset ring-2 ring-red-500' : ''} ${isEditedCol ? 'ring-inset ring-4 ring-blue-500 z-30' : ''}`}
                                                                style={{ width: `${COLUMN_WIDTH}px`, minWidth: `${COLUMN_WIDTH}px`, backgroundColor: isEditedCol ? '#eff6ff' : (isOverLimit ? '#fef2f2' : (liveColColor || '#ffffff')), borderColor: isEditedCol ? '#3b82f6' : (isOverLimit ? '#ef4444' : (liveColColor && liveColColor !== '#ffffff' ? liveColColor : '#e5e7eb')), ...provided.draggableProps.style }}
                                                            >
                                                                <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors"></div>
                                                                <div className="flex flex-col items-center justify-center w-full px-4 mt-2 relative z-10">
                                                                    <h3 className={`font-black text-sm tracking-widest uppercase text-center w-full truncate ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>{col.title}</h3>
                                                                    {col.limit > 0 && <span className={`text-xs font-bold mt-2 px-3 py-1 rounded-full border ${isOverLimit ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100/80 text-gray-500 border-gray-200'}`}>WIP: {col.items.length} / {col.limit}</span>}
                                                                </div>
                                                                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"><span className="text-[10px] italic text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">Drag to reorder / Double click</span></div>
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
                                            const isEditedRow = panel.isOpen && panel.type === 'row' && panel.item?.id === row.id;

                                            return (
                                                <Draggable key={`row-${row.id}`} draggableId={`row-${row.id}`} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} className={`flex relative border-b-2 border-gray-200 transition-shadow transition-colors ${snapshot.isDragging ? 'z-50 ring-4 ring-purple-500 shadow-2xl bg-white rounded-xl overflow-hidden' : ''}`} style={{ ...provided.draggableProps.style }}>
                                                            {/* ZMIANA: Kolor wiersza uderza TYLKO na ten boczny kafelek nagłówkowy! */}
                                                            <div 
                                                                {...provided.dragHandleProps}
                                                                onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; if (panel.isOpen) openPanel('view', 'row', row, null, false); }}
                                                                onDoubleClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('view', 'row', row, null, true); }}
                                                                className={`group w-56 flex-shrink-0 border-r-2 border-gray-200 p-6 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing transition-colors select-none relative ${isEditedRow ? 'ring-inset ring-4 ring-blue-500 z-30' : ''}`}
                                                                style={{ backgroundColor: isEditedRow ? '#eff6ff' : liveRowColor }}
                                                            >
                                                                <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors"></div>
                                                                <span className="font-black text-sm uppercase tracking-widest text-gray-900 drop-shadow-sm mb-2 relative z-10">{row.title}</span>
                                                                <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"><span className="text-[10px] italic text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">Drag to reorder / Double click</span></div>
                                                            </div>

                                                            {backlogColumn && renderCell(backlogColumn, row.id, true)}
                                                            {draggableColumns.map(col => renderCell(col, row.id, false))}
                                                            
                                                            <div className="flex-1 bg-transparent"></div>
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
                                {/* Unlabeled*/}
                                <div 
                                    onClick={(e) => { e.stopPropagation(); if(isDeletingSidebar||isClearingSidebar)return; openPanel('view', 'row', { id: 'unlabeled', title: 'Unlabeled' }, null, false); }}
                                    onDoubleClick={(e) => { e.stopPropagation(); if(isDeletingSidebar||isClearingSidebar)return; openPanel('view', 'row', { id: 'unlabeled', title: 'Unlabeled' }, null, true); }}
                                    className={`group w-56 flex-shrink-0 border-r-2 border-dashed flex flex-col items-center justify-center transition-colors select-none cursor-pointer relative ${panel.isOpen && panel.type === 'row' && panel.item?.id === 'unlabeled' ? 'ring-inset ring-4 ring-blue-500 bg-blue-50/30 z-30' : ''}`}
                                    style={{ borderColor: panel.isOpen && panel.type === 'row' && panel.item?.id === 'unlabeled' ? '#3b82f6' : '#d1d5db', backgroundColor: panel.isOpen && panel.type === 'row' && panel.item?.id === 'unlabeled' ? '#eff6ff' : 'transparent' }}
                                >
                                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors"></div>
                                    <h3 className="font-black text-sm tracking-widest uppercase text-center w-full truncate text-gray-400 px-4 relative z-10">Unlabeled</h3>
                                    <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <span className="text-[10px] italic text-gray-400 bg-white/70 px-2 py-0.5 rounded-full">Double click to view</span>
                                    </div>
                                </div>

                                {backlogColumn && renderCell(backlogColumn, null, true, true)}
                                {draggableColumns.map(col => renderCell(col, null, false, true))}
                                <div className="flex-1 bg-transparent" onClick={(e) => e.stopPropagation()}></div>
                            </div>
                        </div>
                    </div>
                </DragDropContext>
                
                {(isDeletingSidebar || isClearingSidebar) && (
                    <div 
                        className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-300 pointer-events-auto"
                        onClick={() => { setIsDeletingSidebar(false); setIsClearingSidebar(false); }}
                    />
                )}
            </div>
        </div>
    );
};

export default KanbanBoard;