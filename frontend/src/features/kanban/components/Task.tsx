import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, X, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useKanbanStore, KanbanItem } from '../../../store/useKanbanStore';
import { useUserStore } from '../../../store/useUserStore';

interface TaskProps {
    item: KanbanItem;
    index: number;
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
    const { updateItem, removeItem, columns, moveItem } = useKanbanStore();
    const { users } = useUserStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [tempContent, setTempContent] = useState(item.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
            const len = tempContent.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, [isEditing]);

    const handleSave = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const finalContent = tempContent.trim();
        if (finalContent && finalContent !== item.content) {
            await updateItem(item.id, finalContent); 
        } else if (!finalContent) {
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

    // Logika wyliczająca aktualne pozycje, aby sterować strzałkami
    const currentColIndex = columns.findIndex(c => c.id === item.columnId);
    const isUnassigned = item.assignedToId === null || item.assignedToId === undefined;
    const currentUserIndex = isUnassigned ? users.length : users.findIndex(u => u.id === item.assignedToId);

    const canMoveLeft = currentColIndex > 0;
    const canMoveRight = currentColIndex < columns.length - 1;
    const canMoveUp = currentUserIndex > 0;
    const canMoveDown = currentUserIndex < users.length;

    const handleMoveLeft = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canMoveLeft) moveItem(item.id, columns[currentColIndex - 1].id, isUnassigned ? null : item.assignedToId as any);
    };
    const handleMoveRight = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canMoveRight) moveItem(item.id, columns[currentColIndex + 1].id, isUnassigned ? null : item.assignedToId as any);
    };
    const handleMoveUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canMoveUp) moveItem(item.id, item.columnId, users[currentUserIndex - 1].id);
    };
    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canMoveDown) {
            const nextUserId = currentUserIndex === users.length - 1 ? null : users[currentUserIndex + 1].id;
            moveItem(item.id, item.columnId, nextUserId as any);
        }
    };

    return (
        <Draggable draggableId={`item-${item.id}`} index={index} isDragDisabled={isEditing}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`w-full p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg text-gray-800 text-sm transition-all group relative flex flex-col gap-3 ${
                        snapshot.isDragging ? 'shadow-2xl ring-2 ring-purple-500 z-50 cursor-grabbing rotate-2' : 'cursor-grab'
                    }`}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <textarea 
                                ref={textareaRef}
                                rows={2}
                                className="w-full bg-gray-50 border border-purple-300 rounded-lg p-3 outline-none resize-none text-base focus:ring-2 focus:ring-purple-500 transition-shadow"
                                value={tempContent}
                                onChange={handleInputResize}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-end gap-2 mt-1">
                                <button onClick={handleCancel} className="px-3 py-1 text-gray-500 hover:text-gray-700 rounded-md bg-gray-100 hover:bg-gray-200 font-medium transition-colors">Anuluj</button>
                                <button onClick={handleSave} className="px-4 py-1 bg-purple-600 text-white rounded-md font-bold hover:bg-purple-700 transition-colors shadow-sm">Zapisz</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 break-words whitespace-pre-wrap leading-relaxed text-[15px]">
                                {item.content}
                            </div>
                            
                            {/* Panel akcji pojawiający się po najechaniu */}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
                                    <button onClick={handleMoveLeft} disabled={!canMoveLeft} className={`p-1.5 rounded-md transition-colors ${canMoveLeft ? 'text-gray-500 hover:bg-white hover:text-purple-600 shadow-sm' : 'text-gray-300 cursor-not-allowed'}`} title="Przesuń w lewo"><ArrowLeft size={16} /></button>
                                    <button onClick={handleMoveUp} disabled={!canMoveUp} className={`p-1.5 rounded-md transition-colors ${canMoveUp ? 'text-gray-500 hover:bg-white hover:text-purple-600 shadow-sm' : 'text-gray-300 cursor-not-allowed'}`} title="Przesuń w górę"><ArrowUp size={16} /></button>
                                    <button onClick={handleMoveDown} disabled={!canMoveDown} className={`p-1.5 rounded-md transition-colors ${canMoveDown ? 'text-gray-500 hover:bg-white hover:text-purple-600 shadow-sm' : 'text-gray-300 cursor-not-allowed'}`} title="Przesuń w dół"><ArrowDown size={16} /></button>
                                    <button onClick={handleMoveRight} disabled={!canMoveRight} className={`p-1.5 rounded-md transition-colors ${canMoveRight ? 'text-gray-500 hover:bg-white hover:text-purple-600 shadow-sm' : 'text-gray-300 cursor-not-allowed'}`} title="Przesuń w prawo"><ArrowRight size={16} /></button>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-purple-600 transition-colors" title="Edytuj"><Edit2 size={16} /></button>
                                    <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-500 transition-colors" title="Usuń"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default Task;