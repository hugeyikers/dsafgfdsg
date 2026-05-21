import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useKanbanStore, KanbanItem, KanbanColumn, KanbanRow } from '../../../store/useKanbanStore';
import { ListTodo, ArrowUpToLine, Network } from 'lucide-react';

interface TaskProps {
    item: KanbanItem;
    index: number;
    columns: KanbanColumn[];
    rows: KanbanRow[];
    onClick: () => void;
    onDoubleClick: () => void;
    onHover?: (title: string | null, subtitle?: string) => void;
    isEdited?: boolean;
    openedPanelItem?: any | null;
    relationSelect?: { active: boolean, type: 'parent' | 'children', sourceItem: any | null, selectedIds: number[] };
    onRelationSelectToggle?: (item: any) => void;
}

const Task: React.FC<TaskProps> = ({ item, index, columns, onClick, onDoubleClick, onHover, isEdited, openedPanelItem, relationSelect, onRelationSelectToggle }) => {
    const { updateItem } = useKanbanStore();
    const [isNativeDragOver, setIsNativeDragOver] = useState(false);

    const isParentOfOpened = openedPanelItem?.parentId === item.id;
    const isChildOfOpened = item.parentId === openedPanelItem?.id;
    const isSelectMode = relationSelect?.active;
    const isSelected = isSelectMode && relationSelect?.selectedIds.includes(item.id);

    let isSelectDisabled = false;
    if (isSelectMode && relationSelect?.sourceItem) {
        if (item.id === relationSelect.sourceItem.id) isSelectDisabled = true; // Zablokuj samego siebie
        if (relationSelect.type === 'parent') {
            if (relationSelect.sourceItem.childs?.some((c:any) => c.id === item.id)) isSelectDisabled = true; // Nie może być rodzicem, jeśli jest dzieckiem
        } else {
            if (item.parentId && item.parentId !== relationSelect.sourceItem.id) isSelectDisabled = true; // Należy już do kogoś innego
        }
    }

    const handleClick = (e: React.MouseEvent) => { 
        e.stopPropagation(); 
        if (isSelectMode) {
            if (!isSelectDisabled && onRelationSelectToggle) onRelationSelectToggle(item);
            return;
        }
        onClick(); 
    };
    const handleDoubleClick = (e: React.MouseEvent) => { e.stopPropagation(); onDoubleClick(); };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsNativeDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsNativeDragOver(false); };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsNativeDragOver(false);
        const userIdStr = e.dataTransfer.getData('text/plain');
        if (!userIdStr) return;
        const userId = parseInt(userIdStr, 10);
        if (isNaN(userId)) return;

        const currentUserIds = item.assignedUsers?.map((u: any) => u.id) || [];
        if (currentUserIds.includes(userId)) return;

        const userTaskCount = columns.flatMap(c => c.items).filter(i => i.assignedUsers?.some((u: any) => u.id === userId)).length;
        if (userTaskCount >= 5) { alert(`USER LIMIT EXCEEDED!\n\nA maximum of 5 tasks per user is allowed.`); return; }
        updateItem(item.id, { assignedUsersIds: [...currentUserIds, userId] });
    };

    const totalSubtasks = item.subtasks?.length || 0;
    const completedSubtasks = item.subtasks?.filter(s => s.isDone).length || 0;
    const isAllDone = totalSubtasks > 0 && completedSubtasks === totalSubtasks;
    const hasCustomColor = item.color && item.color !== '#ffffff';
    const itemBgColor = !item.color || item.color === '#ffffff' ? 'var(--bg-card)' : item.color;

    let ringClasses = snapshot => snapshot.isDragging ? 'shadow-2xl ring-2 ring-[var(--accent-primary)] border-transparent z-[9999]' : 'shadow-sm hover:border-[var(--accent-primary)] hover:shadow-md';
    let extraStyles: any = {};

    if (isSelectMode) {
        if (isSelected) ringClasses = () => 'ring-4 ring-blue-500 border-transparent scale-[1.02] z-40 shadow-xl';
        else if (isSelectDisabled) { ringClasses = () => 'opacity-30 grayscale cursor-not-allowed border-transparent ring-0'; extraStyles = { pointerEvents: 'none' }; }
        else ringClasses = () => 'ring-2 ring-transparent hover:ring-blue-400 cursor-pointer shadow-sm';
    } else {
        if (isEdited) {
            ringClasses = snapshot => !snapshot.isDragging ? 'ring-4 ring-[var(--accent-primary)] border-transparent z-30 scale-[1.02] shadow-xl' : '';
        } else if (isParentOfOpened) {
            ringClasses = snapshot => !snapshot.isDragging ? 'ring-[3px] ring-green-500 border-transparent z-20 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : '';
            extraStyles = { backgroundColor: hasCustomColor ? itemBgColor : 'rgba(34, 197, 94, 0.1)' }; 
        } else if (isChildOfOpened) {
            ringClasses = snapshot => !snapshot.isDragging ? 'ring-[3px] ring-yellow-500 border-transparent z-20 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : '';
            extraStyles = { backgroundColor: hasCustomColor ? itemBgColor : 'rgba(234, 179, 8, 0.1)' }; 
        }
    }

    return (
        <Draggable draggableId={`item-${item.id}`} index={index} isDragDisabled={isSelectMode}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                    onClick={handleClick} onDoubleClick={handleDoubleClick}
                    onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onMouseEnter={() => onHover && onHover(`Task: ${item.title}`, isSelectMode ? 'Click to select' : 'Double click to edit details')} onMouseLeave={() => onHover && onHover(null)}
                    className={`relative w-full mb-3 flex flex-col justify-between rounded-[10px] border group min-h-[85px] transition-all duration-200
                        ${ringClasses(snapshot)}
                        ${isNativeDragOver ? 'ring-4 ring-[var(--accent-primary)] scale-105 z-40' : ''} 
                    `}
                    style={{ 
                        ...provided.draggableProps.style, 
                        backgroundColor: isNativeDragOver ? 'var(--accent-primary-light)' : itemBgColor,
                        borderColor: 'var(--border-base)',
                        color: hasCustomColor ? '#111827' : 'var(--text-main)', 
                        zIndex: snapshot.isDragging ? 9999 : (isEdited ? 30 : undefined),
                        paddingTop: '12px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '28px',
                        ...extraStyles
                    }}
                >
                    <div className="flex-1 w-full text-left mb-2 relative z-20 pointer-events-none">
                        {(item.parentId || (item.childs && item.childs.length > 0)) && (
                            <div className="flex gap-1.5 mb-1.5 flex-wrap">
                                {item.parentId && (
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-500/20 px-1.5 py-0.5 rounded shadow-sm border border-green-500/30 uppercase">
                                        <ArrowUpToLine size={10} strokeWidth={3} /> Parent
                                    </div>
                                )}
                                {item.childs && item.childs.length > 0 && (
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-yellow-600 bg-yellow-500/20 px-1.5 py-0.5 rounded shadow-sm border border-yellow-500/30 uppercase">
                                        <Network size={10} strokeWidth={3} /> {item.childs.length} Children
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-[13px] font-semibold leading-[1.3] break-words select-none mt-1" style={{ color: 'inherit' }}>
                            {item.title || "Untitled Task"}
                        </p>
                    </div>

                    <div className="w-full flex justify-between items-end mt-auto select-none pointer-events-none relative z-20">
                        {totalSubtasks > 0 ? (
                            <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isAllDone ? 'bg-[var(--status-ok)]/20 text-[var(--status-ok)]' : (hasCustomColor ? 'bg-black/10 text-[#111827]' : 'bg-[var(--bg-page)] text-[var(--text-muted)]')}`}>
                                <ListTodo size={12} strokeWidth={2.5}/>
                                <span>{completedSubtasks}/{totalSubtasks}</span>
                            </div>
                        ) : <div />}

                        {item.assignedUsers && item.assignedUsers.length > 0 ? (
                            <div className="flex -space-x-1.5 overflow-hidden">
                                {item.assignedUsers.map((user: any, idx: number) => (
                                    <div key={user.id} className="w-6 h-6 rounded-full bg-[var(--accent-primary)] border-[1.5px] border-[var(--bg-card)] flex items-center justify-center text-white text-[9px] font-bold shadow-sm" style={{ zIndex: item.assignedUsers!.length - idx }}>
                                        {user.fullName.substring(0, 2).toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        ) : <div className="h-6"></div>}
                    </div>

                    {!isSelectMode && (
                        <div className="absolute bottom-1.5 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            <span className="text-[9px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/90 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-[var(--border-base)] shadow-sm">
                                Double click to view details
                            </span>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default Task;