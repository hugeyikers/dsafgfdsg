import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, Check, X } from 'lucide-react';
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
        if (tempContent.trim()) {
            updateItem(item.id, tempContent);
        } else {
            setTempContent(item.content);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempContent(item.content);
        setIsEditing(false);
    };

    return (
        <Draggable draggableId={`item-${item.id}`} index={index} isDragDisabled={isEditing}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`px-4 py-3 rounded-full border-2 border-gray-400 bg-[#EBEBEB] text-black font-medium text-sm transition-shadow group relative flex items-center justify-between min-h-[48px] ${
                        snapshot.isDragging ? 'shadow-lg scale-105 z-50' : 'shadow-none'
                    }`}
                >
                    {isEditing ? (
                        <div className="flex items-center w-full gap-2">
                            <input 
                                autoFocus
                                className="flex-1 bg-transparent outline-none border-b border-gray-400 text-center"
                                value={tempContent}
                                onChange={(e) => setTempContent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                            <button onClick={handleSave} className="text-green-600 hover:scale-110"><Check size={16} /></button>
                            <button onClick={handleCancel} className="text-red-500 hover:scale-110"><X size={16} /></button>
                        </div>
                    ) : (
                        <>
                            <span className="flex-1 text-center truncate pr-2">{item.content}</span>
                            
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity absolute right-4"
                                title="Edytuj zadanie"
                            >
                                <Edit2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default Task;