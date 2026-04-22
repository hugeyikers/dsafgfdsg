import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useUserStore } from '../../store/useUserStore';
import Task from './components/Task';
import { X, ListTodo } from 'lucide-react';

import EditSidebar, { PanelState, PanelMode, PanelType } from './components/EditSidebar';

const TASK_WIDTH = 180; 
const CELL_PADDING_X = 15;     
const CELL_PADDING_TOP = 16;   
const CELL_PADDING_BOTTOM = 40; 
const COLUMN_WIDTH = TASK_WIDTH + (CELL_PADDING_X * 2);

const SIDEBAR_LEFT_PADDING = 20;
const SIDEBAR_RIGHT_PADDING = 20;
const SIDEBAR_CONTENT_WIDTH = 360; 
const SIDEBAR_WIDTH = SIDEBAR_CONTENT_WIDTH + SIDEBAR_LEFT_PADDING + SIDEBAR_RIGHT_PADDING; 

const FOOTER_HEIGHT = 80;  
const FOOTER_LEFT_RATIO = 0.25;  
const FOOTER_RIGHT_RATIO = 0.75; 
const DETAILS_FIELD_RADIUS = '10px'; 

const KanbanBoard = () => {
    const { columns = [], rows = [], fetchBoard, addColumn, addRow, moveItem, reorderColumns, reorderRows, removeItem, updateItem, addItem, updateColumn, updateRow } = useKanbanStore();
    const { users, fetchUsers, maxTasksPerUser = 5 } = useUserStore();
    
    const [dragState, setDragState] = useState<{ isDragging: boolean; type: string | null; id: string | null }>({ isDragging: false, type: null, id: null });
    const [filteredUserIds, setFilteredUserIds] = useState<number[]>([]);
    const [headerNode, setHeaderNode] = useState<HTMLElement | null>(null);

    const [isDeletingSidebar, setIsDeletingSidebar] = useState(false);
    const [isClearingSidebar, setIsClearingSidebar] = useState(false);
    const [pendingMove, setPendingMove] = useState<{itemId: number, targetColId: number, targetRowId: number | null, targetIndex?: number} | null>(null);

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
        if (panel.isOpen && panel.item) {
            let updatedItem: any = null;
            if (panel.type === 'task') {
                for (const col of columns) {
                    const found = col.items.find(i => i.id === panel.item.id);
                    if (found) { updatedItem = found; break; }
                }
            } else if (panel.type === 'column') {
                updatedItem = columns.find(c => c.id === panel.item.id);
            } else if (panel.type === 'row' && panel.item.id !== 'unlabeled') {
                updatedItem = rows.find(r => r.id === panel.item.id);
            }

            if (updatedItem && JSON.stringify(updatedItem) !== JSON.stringify(panel.item)) {
                setPanel(prev => ({ ...prev, item: updatedItem }));
                if (panel.type === 'task') {
                    setFormData(prev => ({ ...prev, assignedUsersIds: updatedItem.assignedUsers?.map((u: any) => u.id) || [] }));
                }
            }
        }
    }, [columns, rows, panel.isOpen, panel.item?.id, panel.type]);

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
        setDragState({ isDragging: true, type: start.type || 'task', id: start.draggableId });
    };

    const backlogColumn = columns.find(c => c.title === 'Backlog');
    const draggableColumns = columns.filter(c => c.title !== 'Backlog');

    const handleDragEnd = (result: any) => {
        setDragState({ isDragging: false, type: null, id: null });

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
            const targetIndex = destination.index;

            if (sourceColId !== targetColId) {
                const targetCol = columns.find(c => c.id === targetColId);
                if (targetCol && targetCol.limit > 0 && targetCol.items.length >= targetCol.limit) {
                    setPendingMove({ itemId, targetColId, targetRowId, targetIndex });
                    const item = columns.flatMap(c => c.items).find(i => i.id === itemId);
                    if (item) openPanel('view', 'task', item, null, false);
                    return;
                }
            }
            moveItem(itemId, targetColId, targetRowId, targetIndex);
        }
    };

    const handleConfirmMove = () => {
        if (pendingMove) {
            moveItem(pendingMove.itemId, pendingMove.targetColId, pendingMove.targetRowId, pendingMove.targetIndex);
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
        result.sort((a, b) => (a.order || 0) - (b.order || 0));
        return result;
    };

    const renderDummyCell = (col: any, rowId: number | null, isUnlabeled: boolean = false) => {
        const items = getItems(col.id, rowId);
        const isOverLimit = col.limit > 0 && col.items.length > col.limit;
        let cellBgColor = (col.color && col.color !== '#ffffff') ? col.color : 'var(--bg-card)';
        if (isOverLimit) cellBgColor = 'rgba(239, 68, 68, 0.1)';

        const realCell = document.getElementById(`cell-wrapper-${col.id}-${rowId}`);
        const exactHeight = realCell ? `${realCell.offsetHeight}px` : 'auto';

        return (
            <div
                key={`dummy-${col.id}-${rowId}`}
                className={`flex-shrink-0 flex flex-col pointer-events-none border-t-2 ${isUnlabeled ? 'border-dashed' : 'border-solid'} border-[var(--border-base)]`}
                style={{
                    width: '100%',
                    height: exactHeight,
                    minHeight: '140px',
                    backgroundColor: cellBgColor,
                    paddingLeft: `${CELL_PADDING_X}px`,
                    paddingRight: `${CELL_PADDING_X}px`,
                    paddingTop: `${CELL_PADDING_TOP}px`,
                    paddingBottom: `${CELL_PADDING_BOTTOM}px`,
                    overflow: 'hidden'
                }}
            >
                {items.map((item) => {
                    const totalSubtasks = item.subtasks?.length || 0;
                    const completedSubtasks = item.subtasks?.filter((s:any) => s.isDone).length || 0;
                    const hasCustomColor = item.color && item.color !== '#ffffff';
                    
                    const dummyItemBgColor = !item.color || item.color === '#ffffff' ? 'var(--bg-card)' : item.color;

                    return (
                        <div key={item.id} className="relative w-full mb-3 flex flex-col justify-between rounded-[10px] border shadow-sm min-h-[85px]"
                             style={{ backgroundColor: dummyItemBgColor, borderColor: 'var(--border-base)', padding: '12px 16px 28px' }}>
                            <div className="flex-1 w-full text-left mb-2">
                                <p className="text-[13px] font-semibold leading-[1.3] break-words" style={{ color: hasCustomColor ? '#111827' : 'var(--text-main)' }}>
                                    {item.title || "Untitled Task"}
                                </p>
                            </div>
                            <div 
                            className="w-full flex justify-between items-end mt-auto">
                                {totalSubtasks > 0 ? (
                                    <div 
                                    className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${hasCustomColor ? 'bg-black/10 text-[#111827]' : 'bg-[var(--bg-page)] text-[var(--text-muted)]'}`}>
                                        <ListTodo size={12} strokeWidth={2.5} className="mr-1" />
                                        <span>
                                            {completedSubtasks}/{totalSubtasks}
                                        </span>
                                    </div>
                                ) : <div />}
                                {item.assignedUsers && item.assignedUsers.length > 0 && (
                                    <div className="flex -space-x-1.5">
                                        {item.assignedUsers.map((user: any, uIdx: number) => (
                                            <div key={user.id} className="w-6 h-6 rounded-full bg-[var(--accent-primary)] border-[1.5px] border-[var(--bg-card)] flex items-center justify-center text-white text-[9px] font-bold" style={{ zIndex: 10 - uIdx }}>
                                                {user.fullName.substring(0, 2).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderCell = (col: any, rowId: number | null, isBacklog: boolean, isUnlabeled: boolean = false) => {
        const items = getItems(col.id, rowId);
        const droppableId = `cell-${col.id}-${rowId}`;
        const isOverLimit = col.limit > 0 && col.items.length > col.limit;
        
        const liveColColor = (panel.isOpen && activeField === 'color' && panel.type === 'column' && panel.item?.id === col.id) ? editValue : col.color;
        const isEditedCol = panel.isOpen && panel.type === 'column' && panel.item?.id === col.id;
        
        // Dodano logikę podświetlania pola, do którego dodajemy nowe zadanie
        const isAddingTaskHere = panel.isOpen && panel.mode === 'add' && panel.type === 'task' && panel.extra?.colId === col.id && panel.extra?.rowId === rowId;

        const isDraggedColumn = dragState.isDragging && dragState.type === 'column' && dragState.id === `col-${col.id}`;

        let cellBgColor = (liveColColor && liveColColor !== '#ffffff') ? liveColColor : 'var(--bg-card)';
        if (isOverLimit) cellBgColor = 'rgba(239, 68, 68, 0.1)';
        else if (isBacklog || isUnlabeled) {
            cellBgColor = (liveColColor && liveColColor !== '#ffffff') ? liveColColor : 'var(--bg-page)';
        }

        const cellBorderColor = isOverLimit ? 'var(--status-error)' : 'var(--border-base)';

        return (
            <div 
                id={`cell-wrapper-${col.id}-${rowId}`}
                key={droppableId}
                className={`group flex-shrink-0 border-r-2 transition-all duration-200 flex flex-col min-h-[140px] cursor-pointer relative
                    ${(isBacklog || isUnlabeled) ? 'border-dashed' : ''}
                    ${isEditedCol || isAddingTaskHere ? 'ring-inset ring-4 ring-[var(--accent-primary)] z-30' : ''}
                `}
                style={{ 
                    width: `${COLUMN_WIDTH}px`, minWidth: `${COLUMN_WIDTH}px`, 
                    backgroundColor: cellBgColor, 
                    borderColor: isEditedCol || isAddingTaskHere ? 'var(--accent-primary)' : cellBorderColor,
                    opacity: isDraggedColumn ? 0.3 : 1,
                    filter: isDraggedColumn ? 'grayscale(1)' : 'none'
                }}
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
                            className={`flex-1 flex flex-col transition-colors h-full relative ${snapshot.isDraggingOver ? (isOverLimit ? 'bg-[var(--status-error)]/10 ring-inset ring-4 ring-[var(--status-error)]/50' : 'bg-[var(--accent-primary-light)]/40 ring-inset ring-4 ring-[var(--accent-primary)]/50') : ''}`}
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
                    <span 
                        style={{
                            padding:5
                        }}
                        className="text-[9px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/70 px-2 py-0.5 rounded-full shadow-sm border border-[var(--border-base)]">
                            Double click to add task
                    </span>
                </div>
            </div>
        );
    };

    const renderTeamBar = () => {
        if (!headerNode) return null;
        return createPortal(
            <div className="flex items-center gap-4 pl-8 h-14">
                
                {filteredUserIds.length > 0 && (
                    <button 
                        onClick={() => setFilteredUserIds([])} 
                        title="Clear Filters" 
                        className="mr-2 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 p-2.5 rounded-lg transition-colors border border-transparent hover:border-[var(--status-error)]/30">
                        <X size={22} />
                    </button>
                )}

                {users.map(u => {
                    const taskCount = columns.flatMap(c => c.items).filter(i => i.assignedUsers?.some((a: any) => a.id === u.id)).length;
                    const isOverLimit = taskCount >= maxTasksPerUser;
                    const isFiltered = filteredUserIds.includes(u.id);
                    const isDimmed = filteredUserIds.length > 0 && !isFiltered;

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
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 ${!isOverLimit ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'} ${isFiltered ? 'bg-[var(--accent-primary-light)] text-[var(--accent-primary)] border-[var(--accent-primary)] ring-4 ring-[var(--accent-primary)]/20' : isOverLimit ? 'bg-[var(--bg-page)] text-[var(--text-muted)] border-[var(--border-base)]' : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-base)] hover:border-[var(--accent-primary)] transition-all'}`}
                            >
                                {u.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <span className={`text-[11px] font-black mt-1 leading-none ${isOverLimit ? 'text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>{taskCount}/{maxTasksPerUser}</span>
                        </div>
                    );
                })}
            </div>,
            headerNode
        );
    };

    return (
        <div className="h-full flex w-full bg-[var(--bg-page)] relative overflow-hidden transition-colors duration-300">
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
                    <div className="flex-1 overflow-auto p-4 pt-0 mt-4" onClick={() => { if (panel.isOpen && !isDeletingSidebar && !isClearingSidebar && !dragState.isDragging) closeSidebar(); }}>
                        <div id="kanban-board-container" className="inline-block min-w-full pb-20 bg-[var(--bg-card)] border-2 border-[var(--border-base)] rounded-2xl shadow-sm mt-16 transition-colors duration-300">
                            
                            <div className="flex sticky top-0 z-[35] items-stretch border-b-2 border-[var(--border-base)] bg-[var(--bg-card)] shadow-sm h-[88px] transition-colors duration-300">
                                <div className="w-56 h-full flex-shrink-0 border-r-2 border-[var(--border-base)] bg-[var(--bg-page)] relative overflow-hidden group/corner transition-colors duration-300">
                                    <button onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('add', 'column', null, null, false); }} className="absolute inset-0 w-full h-full text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] transition-colors cursor-pointer outline-none font-black text-[12px] uppercase tracking-widest flex items-start justify-end pt-3.5 pr-4" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}> Add Column &rarr; </button>
                                    <button onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('add', 'row', null, null, false); }} className="absolute inset-0 w-full h-full text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] transition-colors cursor-pointer outline-none font-black text-[12px] uppercase tracking-widest flex items-end justify-start pb-3.5 pl-4 bg-[var(--bg-page)]/50" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}> Add Row &darr; </button>
                                    <div className="absolute inset-0 pointer-events-none"><svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100"><line x1="0" y1="0" x2="100" y2="100" stroke="var(--border-base)" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg></div>
                                </div>
                                 
                                {backlogColumn && (() => {
                                    const isEditedBacklog = panel.isOpen && panel.type === 'column' && panel.item?.id === backlogColumn.id;
                                    return (
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; if (panel.isOpen) openPanel('view', 'column', backlogColumn, null, false); }}
                                            onDoubleClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('view', 'column', backlogColumn, null, true); }}
                                            className={`group flex-shrink-0 border-r-2 border-dashed flex flex-col items-center justify-center transition-colors select-none cursor-pointer relative ${isEditedBacklog ? 'ring-inset ring-4 ring-[var(--accent-primary)] z-30' : ''}`}
                                            style={{ width: `${COLUMN_WIDTH}px`, minWidth: `${COLUMN_WIDTH}px`, borderColor: isEditedBacklog ? 'var(--accent-primary)' : 'var(--border-base)', backgroundColor: 'var(--bg-page)' }}
                                        >
                                            <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors"></div>
                                            <h3 className="font-black text-sm tracking-widest uppercase text-center w-full truncate text-[var(--text-muted)] px-4 relative z-10">{backlogColumn.title}</h3>
                                            <div 
                                                className="absolute bottom-0.5 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                    <span 
                                                        style={{paddingRight:5, paddingLeft:5, paddingTop:3, paddingBottom:3}}
                                                        className="text-[9px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/70 px-2 py-0.5 rounded-full">
                                                        Double click to view details
                                                    </span>
                                            </div>
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
                                                                className={`group flex-shrink-0 border-r-2 flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing transition-shadow transition-colors relative ${snapshot.isDragging ? 'z-[9999] shadow-2xl ring-4 ring-[var(--accent-primary)] border-transparent rounded-xl' : ''} ${isOverLimit ? 'ring-inset ring-2 ring-[var(--status-error)]' : ''} ${isEditedCol && !snapshot.isDragging ? 'ring-inset ring-4 ring-[var(--accent-primary)] z-30' : ''}`}
                                                                style={{ width: `${COLUMN_WIDTH}px`, minWidth: `${COLUMN_WIDTH}px`, backgroundColor: isOverLimit ? 'rgba(239, 68, 68, 0.1)' : (liveColColor && liveColColor !== '#ffffff' ? liveColColor : 'var(--bg-card)'), borderColor: isEditedCol ? 'var(--accent-primary)' : (isOverLimit ? 'var(--status-error)' : 'var(--border-base)'), ...provided.draggableProps.style }}
                                                            >
                                                                <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors rounded-xl"></div>
                                                                <div className="flex flex-col items-center justify-center w-full px-4 mt-2 relative z-10">
                                                                    <h3 style={{ color: isOverLimit ? 'var(--status-error)' : (liveColColor && liveColColor !== '#ffffff' ? '#111827' : 'var(--text-main)') }} className="font-black text-sm tracking-widest uppercase text-center w-full truncate">{col.title}</h3>
                                                                    {col.limit > 0 && <span style={{paddingRight:5, paddingLeft:5, paddingTop:3, paddingBottom:3}} className={`text-xs font-bold mt-2 px-3 py-1 rounded-full border ${isOverLimit ? 'bg-[var(--status-error)]/10 text-[var(--status-error)] border-[var(--status-error)]' : 'bg-[var(--bg-page)] text-[var(--text-muted)] border-[var(--border-base)]'}`}>WIP: {col.items.length} / {col.limit}</span>}
                                                                </div>
                                                                <div
                                                                    className="absolute bottom-0.5 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                                        <span 
                                                                        style={{
                                                                            padding:5
                                                                        }}
                                                                        className="text-[9px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/70 px-2 py-0.5 rounded-full">
                                                                        Drag to reorder / Double click to view details
                                                                        </span>
                                                                </div>
                                                                
                                                                {snapshot.isDragging && dragState.type === 'column' && dragState.id === `col-${col.id}` && (
                                                                    <div className="absolute left-[-4px] w-[calc(100%+8px)] flex flex-col pointer-events-none z-[9999] opacity-95 shadow-2xl bg-[var(--bg-card)] rounded-b-xl"
                                                                         style={{ top: 'calc(100% + 2px)', borderLeft: '4px solid var(--accent-primary)', borderRight: '4px solid var(--accent-primary)', borderBottom: '4px solid var(--accent-primary)' }}>
                                                                        {rows.map(row => renderDummyCell(col, row.id))}
                                                                        {renderDummyCell(col, null, true)}
                                                                    </div>
                                                                )}
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
                                                        <div ref={provided.innerRef} {...provided.draggableProps} className={`flex relative border-b-2 border-[var(--border-base)] transition-shadow transition-colors ${snapshot.isDragging ? 'z-50 ring-4 ring-[var(--accent-primary)] shadow-2xl bg-[var(--bg-card)] rounded-xl overflow-hidden' : ''}`} style={{ ...provided.draggableProps.style }}>
                                                            <div 
                                                                {...provided.dragHandleProps}
                                                                onClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; if (panel.isOpen) openPanel('view', 'row', row, null, false); }}
                                                                onDoubleClick={(e) => { e.stopPropagation(); if (isDeletingSidebar || isClearingSidebar) return; openPanel('view', 'row', row, null, true); }}
                                                                className={`group w-56 flex-shrink-0 border-r-2 border-[var(--border-base)] p-6 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing transition-colors select-none relative ${isEditedRow && !snapshot.isDragging ? 'ring-inset ring-4 ring-[var(--accent-primary)] z-30' : ''}`}
                                                                style={{ backgroundColor: liveRowColor === '#ffffff' ? 'var(--bg-card)' : liveRowColor }}
                                                            >
                                                                <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors"></div>
                                                                <span style={{ color: liveRowColor && liveRowColor !== '#ffffff' ? '#111827' : 'var(--text-main)' }} className="font-black text-sm uppercase tracking-widest drop-shadow-sm mb-2 relative z-10">{row.title}</span>
                                                                <div 
                                                                    className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                                        <span 
                                                                        style={{padding:5}}
                                                                        className="text-[9px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/70 px-2 py-0.5 rounded-full">
                                                                        Drag to reorder / Double click to view details
                                                                        </span>
                                                                </div>
                                                            </div>

                                                            {backlogColumn && renderCell(backlogColumn, row.id, true, false)}
                                                            {draggableColumns.map(col => renderCell(col, row.id, false, false))}
                                                            
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

                            <div className="flex relative border-b-2 border-[var(--border-base)]" style={{ backgroundColor: 'transparent' }}>
                                <div 
                                    onClick={(e) => { e.stopPropagation(); if(isDeletingSidebar||isClearingSidebar)return; openPanel('view', 'row', { id: 'unlabeled', title: 'Unlabeled' }, null, false); }}
                                    onDoubleClick={(e) => { e.stopPropagation(); if(isDeletingSidebar||isClearingSidebar)return; openPanel('view', 'row', { id: 'unlabeled', title: 'Unlabeled' }, null, true); }}
                                    className={`group w-56 flex-shrink-0 border-r-2 border-dashed flex flex-col items-center justify-center transition-colors select-none cursor-pointer relative ${panel.isOpen && panel.type === 'row' && panel.item?.id === 'unlabeled' ? 'ring-inset ring-4 ring-[var(--accent-primary)] z-30' : ''}`}
                                    style={{ borderColor: panel.isOpen && panel.type === 'row' && panel.item?.id === 'unlabeled' ? 'var(--accent-primary)' : 'var(--border-base)', backgroundColor: 'var(--bg-page)' }}
                                >
                                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/[0.03] pointer-events-none transition-colors"></div>
                                    <h3 className="font-black text-sm tracking-widest uppercase text-center w-full truncate text-[var(--text-muted)] px-4 relative z-10">Unlabeled</h3>
                                    <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <span 
                                        className="text-[9px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/70 px-2 py-0.5 rounded-full"
                                        style={{
                                            padding:5
                                        }}
                                        >
                                        Double click to view details
                                        </span>
                                    </div>
                                </div>

                                {backlogColumn && renderCell(backlogColumn, null, true, true)}
                                {draggableColumns.map(col => renderCell(col, null, false, true))}
                                <div className="flex-1" style={{ backgroundColor: 'var(--bg-page)' }} onClick={(e) => e.stopPropagation()}></div>
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