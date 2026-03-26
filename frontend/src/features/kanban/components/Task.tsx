import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useKanbanStore, KanbanItem, KanbanColumn, KanbanRow } from '../../../store/useKanbanStore';

interface TaskProps {
    item: KanbanItem;
    index: number;
    columns: KanbanColumn[];
    rows: KanbanRow[];
    onClick: () => void;
    onDoubleClick: () => void;
}

const Task: React.FC<TaskProps> = ({ item, index, columns, onClick, onDoubleClick }) => {
    const { updateItem } = useKanbanStore();
    const [isNativeDragOver, setIsNativeDragOver] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDoubleClick();
    };

    const handleNativeDragOver = (e: React.DragEvent) => { e.preventDefault(); };
    const handleNativeDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsNativeDragOver(true); };
    const handleNativeDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsNativeDragOver(false); };

    const handleNativeDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsNativeDragOver(false);

        const userIdStr = e.dataTransfer.getData('text/plain');
        if (!userIdStr) return;

        const userId = parseInt(userIdStr, 10);
        if (isNaN(userId)) return;

        if (item.assignedToId === userId) return;

        const userTaskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === userId).length;
        if (userTaskCount >= 5) {
            alert(`USER LIMIT EXCEEDED!\n\nA maximum of 5 tasks per user is allowed.`);
            return;
        }

        updateItem(item.id, { assignedToId: userId });
    };

    return (
        <Draggable draggableId={`item-${item.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                    
                    onDragOver={handleNativeDragOver}
                    onDragEnter={handleNativeDragEnter}
                    onDragLeave={handleNativeDragLeave}
                    onDrop={handleNativeDrop}

                    className={`relative w-full mb-3 p-3 flex flex-col justify-between rounded-xl border border-gray-200 group min-h-[90px] overflow-hidden cursor-pointer transition-all duration-200
                        ${snapshot.isDragging ? 'shadow-2xl z-50 ring-2 ring-purple-500' : 'shadow-sm hover:border-purple-400 hover:shadow-md'}
                        ${isNativeDragOver ? 'ring-4 ring-blue-500 bg-blue-50 scale-105 z-40' : ''} 
                    `}
                    style={{ 
                        ...provided.draggableProps.style, 
                        backgroundColor: isNativeDragOver ? '#eff6ff' : (item.color || '#ffffff') 
                    }}
                >
                    <div className="flex items-center justify-center flex-1 px-1 mb-2 w-full text-center pointer-events-none relative z-20">
                        {/* Wyświetlamy dokładnie item.title z bazy */}
                        <p className="text-[13px] font-extrabold text-gray-900 break-words leading-tight tracking-tight select-none w-full">
                            {item.title || "Untitled Task"}
                        </p>
                    </div>

                    <div className="w-full flex justify-start mt-auto select-none pointer-events-none relative z-20">
                        {item.assignedTo ? (
                            <div 
                                className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                                title={item.assignedTo.fullName}
                            >
                                {item.assignedTo.fullName.substring(0, 2).toUpperCase()}
                            </div>
                        ) : (
                            <div className="text-[9px] font-semibold italic text-gray-400 border border-dashed border-gray-300 px-2 py-0.5 rounded-full bg-white/70">
                                Unassigned
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 pl-8">
                        <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">Double click for details</span>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default Task;