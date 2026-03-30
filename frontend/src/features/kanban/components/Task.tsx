import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { KanbanItem, KanbanColumn, KanbanRow } from '../../../store/useKanbanStore';

interface TaskProps {
    item: KanbanItem;
    index: number;
    columns: KanbanColumn[];
    rows: KanbanRow[];
    onClick: () => void;
    onDoubleClick: () => void;
<<<<<<< HEAD
    isEditing?: boolean; 
    onHover: (e: React.MouseEvent | null, title: string | null, subtitle?: string) => void;
=======
    onHover?: (title: string | null, subtitle?: string) => void; 
>>>>>>> f62be26 (update UI i funkcjonalnosci)
}

const Task: React.FC<TaskProps> = ({ item, index, onClick, onDoubleClick, isEditing, onHover }) => {

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDoubleClick();
    };

    return (
        <Draggable draggableId={`task-${item.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
<<<<<<< HEAD
                    
                    // Podpięcie okienka "About"
                    onMouseEnter={(e) => onHover(e, `Task: ${item.title}`, 'Double click to view or edit details')}
                    onMouseLeave={(e) => onHover(e, null)}

                    // CZYSTE KLASY CSS: Tylko bezpieczne kolory i cienie
                    className={`relative w-full mb-3 p-3 flex flex-col justify-between rounded-xl border-2 transition-colors transition-shadow duration-200 select-none group min-h-[90px] overflow-hidden cursor-grab active:cursor-grabbing
                        ${snapshot.isDragging ? 'shadow-2xl z-50 ring-2 ring-purple-500 border-transparent' : 'border-gray-200 hover:border-purple-300 hover:shadow-md'}
                        ${isEditing && !snapshot.isDragging ? 'ring-2 ring-purple-500 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] z-30' : ''}
                    `}
                    style={{ 
                        ...provided.draggableProps.style, 
                        backgroundColor: item.color || '#ffffff',
                        borderLeftColor: item.color && item.color !== '#ffffff' ? item.color : undefined,
                        borderLeftWidth: item.color && item.color !== '#ffffff' ? '6px' : '2px',
=======
                    onDragOver={handleNativeDragOver}
                    onDragEnter={handleNativeDragEnter}
                    onDragLeave={handleNativeDragLeave}
                    onDrop={handleNativeDrop}
                    onMouseEnter={() => onHover && onHover(`Task: ${item.title}`, 'Double click to edit details')}
                    onMouseLeave={() => onHover && onHover(null)}
                    className={`relative w-full mb-3 p-3 flex flex-col justify-between rounded-xl border border-gray-200 group min-h-[90px] cursor-pointer transition-colors transition-shadow duration-200
                        ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-purple-500 border-transparent z-[9999]' : 'shadow-sm hover:border-purple-400 hover:shadow-md'}
                        ${isNativeDragOver ? 'ring-4 ring-blue-500 bg-blue-50 scale-105 z-40' : ''} 
                    `}
                    style={{ 
                        ...provided.draggableProps.style, 
                        backgroundColor: isNativeDragOver ? '#eff6ff' : (item.color || '#ffffff'),
                        zIndex: snapshot.isDragging ? 9999 : undefined
>>>>>>> f62be26 (update UI i funkcjonalnosci)
                    }}
                >
                    <div className="flex items-center justify-center flex-1 px-1 mb-2 w-full text-center pointer-events-none relative z-20">
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
<<<<<<< HEAD
=======

                    <div className="absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 pl-8">
                        <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-gray-100 shadow-sm">Double click</span>
                    </div>
>>>>>>> f62be26 (update UI i funkcjonalnosci)
                </div>
            )}
        </Draggable>
    );
};

export default Task;