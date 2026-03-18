import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, Check, X, Menu } from 'lucide-react';
import { useKanbanStore, KanbanItem } from '../../../store/useKanbanStore';

interface TaskProps {
    item: KanbanItem;
    index: number;
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
    const { updateItem, removeItem } = useKanbanStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [tempContent, setTempContent] = useState(item.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
            // Cursor at end
            const len = tempContent.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, [isEditing]);

    const handleSave = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const finalContent = tempContent.trim();
        if (finalContent && finalContent !== item.content) {
            await updateItem(item.id, finalContent); // assignedToId is unchanged (undefined)
        } else if (!finalContent) {
             // If empty, maybe delete? Or revert?
             // Let's revert for safety, unless user explicitly deletes
             setTempContent(item.content);
        }
        setIsEditing(false);
    };

    const handleCancel = (e?: React.MouseEvent) => {
        e?.stopPropagation();
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
        if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Usunąć zadanie?')) {
            removeItem(item.id);
        }
    };

    return (
        <Draggable draggableId={`item-${item.id}`} index={index} isDragDisabled={isEditing}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`w-full p-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md text-gray-800 text-sm transition-all group relative flex flex-col gap-2 ${
                        snapshot.isDragging ? 'shadow-xl ring-2 ring-purple-500 z-50 cursor-grabbing rotate-2' : 'cursor-grab'
                    }`}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <textarea 
                                ref={textareaRef}
                                rows={1}
                                className="w-full bg-gray-50 border border-purple-200 rounded p-2 outline-none resize-none text-sm focus:ring-1 focus:ring-purple-500"
                                value={tempContent}
                                onChange={handleInputResize}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={handleCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded bg-gray-100 hover:bg-gray-200"><X size={14} /></button>
                                <button onClick={handleSave} className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700">Zapisz</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 break-words whitespace-pre-wrap leading-relaxed">
                                {item.content}
                            </div>
                            
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        setIsEditing(true);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-purple-600"
                                    title="Edytuj"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                                    title="Usuń"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default Task;