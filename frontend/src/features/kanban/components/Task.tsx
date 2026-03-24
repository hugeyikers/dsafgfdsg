// frontend/src/features/kanban/components/Task.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, X, User, AlignLeft } from 'lucide-react';
import { useKanbanStore, KanbanItem } from '../../../store/useKanbanStore';
import { useUserStore } from '../../../store/useUserStore';

interface TaskProps {
    item: KanbanItem;
    index: number;
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
    const { updateItem, removeItem } = useKanbanStore();
    const { users } = useUserStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(item.title);
    const [tempContent, setTempContent] = useState(item.content || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [isEditing, tempContent]);

    const handleSave = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const finalTitle = tempTitle.trim();
        
        // Zapisujemy tylko jeśli cokolwiek się zmieniło
        if (finalTitle && (finalTitle !== item.title || tempContent !== (item.content || ''))) {
            await updateItem(item.id, { title: finalTitle, content: tempContent }); 
        } else if (!finalTitle) {
             setTempTitle(item.title);
             setTempContent(item.content || '');
        }
        setIsEditing(false);
    };

    const handleCancel = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setTempTitle(item.title);
        setTempContent(item.content || '');
        setIsEditing(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Usunąć zadanie?')) {
            removeItem(item.id);
        }
    };

    const handleUserAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const newUserId = val ? parseInt(val) : null;
        await updateItem(item.id, { assignedToId: newUserId });
    };

    return (
        <Draggable draggableId={`item-${item.id}`} index={index} isDragDisabled={isEditing}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`w-full p-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all group relative flex flex-col gap-2 ${
                        snapshot.isDragging ? 'shadow-xl ring-2 ring-purple-500 z-50 cursor-grabbing rotate-2' : 'cursor-grab'
                    }`}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <input 
                                autoFocus
                                className="w-full font-bold bg-gray-50 border border-purple-200 rounded p-2 outline-none text-sm focus:ring-1 focus:ring-purple-500 text-gray-800"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                placeholder="Tytuł zadania..."
                                onClick={(e) => e.stopPropagation()}
                            />
                            <textarea 
                                ref={textareaRef}
                                rows={2}
                                placeholder="Dodaj dokładniejszy opis..."
                                className="w-full bg-gray-50 border border-purple-200 rounded p-2 outline-none resize-none text-xs focus:ring-1 focus:ring-purple-500 text-gray-600"
                                value={tempContent}
                                onChange={(e) => setTempContent(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-end gap-2 mt-1">
                                <button onClick={handleCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded bg-gray-100 hover:bg-gray-200"><X size={14} /></button>
                                <button onClick={handleSave} className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700">Zapisz</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 flex flex-col gap-1">
                                    <span className="font-bold text-gray-800 text-sm leading-snug break-words">
                                        {item.title}
                                    </span>
                                    
                                    {/* Subtelny podgląd opisu, jeśli istnieje */}
                                    {item.content && (
                                        <div className="flex items-start gap-1 text-gray-500 mt-1">
                                            <AlignLeft size={12} className="mt-[2px] shrink-0" />
                                            <span className="text-xs line-clamp-2 break-words leading-relaxed" title={item.content}>
                                                {item.content}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-purple-600"><Edit2 size={12} /></button>
                                    <button onClick={handleDelete} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={12} /></button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-1 pt-2 border-t border-gray-100">
                                <User size={14} className="text-gray-400 shrink-0" />
                                <select 
                                    className="text-xs bg-transparent border-none text-gray-500 cursor-pointer outline-none hover:text-purple-600 transition-colors flex-1"
                                    value={item.assignedToId || ''}
                                    onChange={handleUserAssign}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <option value="">Nieprzypisane</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.fullName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default Task;