import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useKanbanStore, KanbanItem, KanbanColumn, KanbanRow } from '../../../store/useKanbanStore';
import { ListTodo } from 'lucide-react'; // IKONA SUBTASKÓW

interface TaskProps {
    item: KanbanItem;
    index: number;
    columns: KanbanColumn[];
    rows: KanbanRow[];
    onClick: () => void;
    onDoubleClick: () => void;
    onHover?: (title: string | null, subtitle?: string) => void;
    isEdited?: boolean;
}

const Task: React.FC<TaskProps> = ({ item, index, columns, onClick, onDoubleClick, onHover, isEdited }) => {
    const { updateItem } = useKanbanStore();
    const [isNativeDragOver, setIsNativeDragOver] = useState(false);

    const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); onClick(); };
    const handleDoubleClick = (e: React.MouseEvent) => { e.stopPropagation(); onDoubleClick(); };

    const handleNativeDragOver = (e: React.DragEvent) => { e.preventDefault(); };
    const handleNativeDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsNativeDragOver(true); };
    const handleNativeDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsNativeDragOver(false); };

    const handleNativeDrop = (e: React.DragEvent) => {
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

    return (
        <Draggable draggableId={`item-${item.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                    onClick={handleClick} onDoubleClick={handleDoubleClick}
                    onDragOver={handleNativeDragOver} onDragEnter={handleNativeDragEnter} onDragLeave={handleNativeDragLeave} onDrop={handleNativeDrop}
                    onMouseEnter={() => onHover && onHover(`Task: ${item.title}`, 'Double click to edit details')} onMouseLeave={() => onHover && onHover(null)}
                    className={`relative w-full mb-3 p-3 flex flex-col justify-between rounded-[10px] border border-gray-200 group min-h-[85px] cursor-pointer transition-all duration-200
                        ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-purple-500 border-transparent z-[9999]' : 'shadow-sm hover:border-purple-400 hover:shadow-md'}
                        ${isNativeDragOver ? 'ring-4 ring-blue-500 bg-blue-50 scale-105 z-40' : ''} 
                        ${isEdited && !snapshot.isDragging && !isNativeDragOver ? 'ring-4 ring-blue-500 border-transparent z-30 scale-[1.02]' : ''}
                    `}
                    style={{ 
                        ...provided.draggableProps.style, 
                        backgroundColor: isNativeDragOver ? '#eff6ff' : (isEdited ? '#eff6ff' : (item.color || '#ffffff')),
                        zIndex: snapshot.isDragging ? 9999 : (isEdited ? 30 : undefined)
                    }}
                >
                    <div className="flex-1 w-full text-left mb-3 relative z-20">
                        <p className="text-[13px] font-semibold text-gray-800 leading-[1.3] break-words select-none">
                            {item.title || "Untitled Task"}
                        </p>
                    </div>

                    <div className="w-full flex justify-between items-end mt-auto select-none pointer-events-none relative z-20">
                        {/* Wskaźnik subtasków po lewej (jeśli są) */}
                        {totalSubtasks > 0 ? (
                            <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isAllDone ? 'bg-green-100 text-green-700' : 'bg-black/5 text-gray-500'}`}>
                                <ListTodo size={12} strokeWidth={2.5}/>
                                <span>{completedSubtasks}/{totalSubtasks}</span>
                            </div>
                        ) : (
                            <div />
                        )}

                        {/* Ikonki użytkowników po prawej */}
                        {item.assignedUsers && item.assignedUsers.length > 0 ? (
                            <div className="flex -space-x-1.5 overflow-hidden">
                                {item.assignedUsers.map((user: any, idx: number) => (
                                    <div 
                                        key={user.id}
                                        className="w-6 h-6 rounded-full bg-indigo-500 border-[1.5px] border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm"
                                        title={user.fullName}
                                        style={{ zIndex: item.assignedUsers!.length - idx }}
                                    >
                                        {user.fullName.substring(0, 2).toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-6"></div>
                        )}
                    </div>

                    <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 pl-8">
                        <span style={{ padding: 2 }} className="text-[8px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-gray-100 shadow-sm">
                            Double click to view details
                        </span>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default Task;