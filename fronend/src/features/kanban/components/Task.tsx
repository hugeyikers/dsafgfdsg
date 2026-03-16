import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, Check, X, Menu } from 'lucide-react';
import { useKanbanStore } from '../../../store/useKanbanStore';

interface TaskProps {
    item: any;
    index: number;
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
    const { updateItem } = useKanbanStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [tempContent, setTempContent] = useState(item.content);

    const handleSave = () => {
        const finalContent = tempContent.trim();
        if (finalContent) {
            updateItem(item.id, finalContent);
        } else {
            setTempContent(item.content);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempContent(item.content);
        setIsEditing(false);
    };

    const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTempContent(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <Draggable draggableId={`item-${item.id}`} index={index} isDragDisabled={isEditing}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`w-[280px] px-2 py-3 rounded-[24px] border-2 border-gray-400 bg-[#EBEBEB] text-black font-medium text-sm transition-shadow group relative flex items-center justify-between min-h-[44px] box-border ${
                        snapshot.isDragging ? 'shadow-lg scale-105 z-50 cursor-grabbing' : 'shadow-none cursor-grab'
                    }`}
                >
                    {isEditing ? (
                        <div className="flex items-center w-full gap-2 px-2 z-10">
                            <textarea 
                                autoFocus
                                rows={1}
                                className="flex-1 bg-transparent outline-none text-center w-full resize-none overflow-hidden leading-normal py-1 px-1"
                                value={tempContent}
                                onChange={handleInputResize}
                                onKeyDown={handleKeyDown}
                                onFocus={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                    
                                    const length = e.target.value.length;
                                    e.target.setSelectionRange(length, length);
                                }}
                            />
                            <button onClick={handleSave} className="text-green-600 hover:scale-110 flex-shrink-0"><Check size={16} /></button>
                            <button onClick={handleCancel} className="text-red-500 hover:scale-110 flex-shrink-0"><X size={16} /></button>
                        </div>
                    ) : (
                        <>
                            <div className="w-8 flex justify-center items-center flex-shrink-0 text-gray-400 pointer-events-none">
                                <Menu size={16} />
                            </div>
                            
                            <div className="flex-1 min-w-0 px-1 text-center break-words whitespace-pre-wrap leading-normal">
                                {item.content}
                            </div>
                            
                            <div className="w-8 flex justify-center items-center flex-shrink-0">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        setIsEditing(true);
                                    }}
                                    className="text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edytuj zadanie"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default Task;