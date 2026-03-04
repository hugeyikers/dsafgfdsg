import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { KanbanItem, useKanbanStore } from '../../../store/useKanbanStore';
import { Trash2, GripVertical, CheckSquare, Square, ArrowLeft, ArrowRight, Save, X } from 'lucide-react';

interface TaskProps {
    item: KanbanItem;
    index: number;
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
    const { removeItem, updateItem, toggleSelection, selectedItems, columns, moveItem } = useKanbanStore();
    const isSelected = selectedItems.includes(item.id);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(item.content);

    // Find current column index to determine neighbors for arrows
    const currentColumnIndex = columns.findIndex(c => c.id === item.columnId);
    const prevColumn = columns[currentColumnIndex - 1];
    const nextColumn = columns[currentColumnIndex + 1];

    const handleSave = () => {
        updateItem(item.id, editContent);
        setIsEditing(false);
    }

    return (
        <Draggable draggableId={`item-${item.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`bg-white p-3 mb-2 rounded shadow-sm border group hover:shadow-md transition-all
                        ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-gray-200'}
                        ${snapshot.isDragging ? 'rotate-2 shadow-xl opacity-90' : ''}
                    `}
                >
                    <div className="flex items-start gap-2">
                        {/* Drag Handle & Selection */}
                        <div className="flex flex-col gap-1 items-center pt-1" {...provided.dragHandleProps}>
                            <GripVertical size={14} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                            <button onClick={() => toggleSelection(item.id)} className="text-gray-400 hover:text-blue-500">
                                {isSelected ? <CheckSquare size={14} className="text-blue-500"/> : <Square size={14} />}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <div className="flex flex-col gap-2">
                                    <textarea 
                                        className="w-full text-sm p-1 border rounded resize-none" 
                                        rows={2}
                                        value={editContent} 
                                        onChange={e => setEditContent(e.target.value)} 
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleSave} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Save</button>
                                        <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p 
                                    className="text-sm text-gray-800 break-words cursor-pointer hover:bg-gray-50 rounded p-1"
                                    onClick={() => setIsEditing(true)}
                                >
                                    {item.content}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        {!isEditing && (
                             <div className="flex flex-col items-center gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} 
                                    className="text-gray-400 hover:text-red-600 p-1"
                                    title="Usuń zadanie"
                                >
                                    <Trash2 size={16} />
                                </button>
                             </div>
                        )}
                    </div>

                    {/* Manual Move Arrows */}
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
                         <button 
                            disabled={!prevColumn}
                            onClick={() => prevColumn && moveItem(item.id, prevColumn.id)}
                            className={`text-xs flex items-center text-gray-500 hover:text-indigo-600 ${!prevColumn && 'invisible'}`}
                            title={prevColumn?.title}
                         >
                            <ArrowLeft size={12} /> Left
                         </button>
                         <button 
                            disabled={!nextColumn}
                            onClick={() => nextColumn && moveItem(item.id, nextColumn.id)}
                            className={`text-xs flex items-center text-gray-500 hover:text-indigo-600 ${!nextColumn && 'invisible'}`}
                            title={nextColumn?.title}
                         >
                            Right <ArrowRight size={12} />
                         </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default Task;
