import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { KanbanColumn, useKanbanStore } from '../../../store/useKanbanStore';
import Task from './Task';
import { MoreVertical, Plus, Trash, Trash2, Edit2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

interface ColumnProps {
    column: KanbanColumn;
}

const Column: React.FC<ColumnProps> = ({ column }) => {
    const { updateColumn, removeColumn, addItem, selectedItems, moveBatch } = useKanbanStore();
    const [newItemContent, setNewItemContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(column.title);
    const [tempLimit, setTempLimit] = useState(column.limit);

    // Limit Logic
    const isOverLimit = column.limit > 0 && column.items.length > column.limit;
    
    // Check if dragging logic allows adding items here (soft limit)
    // The requirement says: "jak przekroczy to dalej pozwala dodać ale wywala alert i w gui na czerwono zmienia kolor sekcji"

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemContent.trim()) return;
        
        // Warn if adding this item will exceed or further exceed the limit
        if (column.limit > 0 && column.items.length >= column.limit) {
            if (!confirm("Limit przekroczony! Czy na pewno chcesz dodać zadanie?")) return;
        }

        addItem(column.id, newItemContent);
        setNewItemContent('');
    };

    const handleUpdateColumn = () => {
        updateColumn(column.id, { title: tempTitle, limit: tempLimit });
        setIsEditing(false);
    };

    const handleMoveSelectedHere = () => {
        moveBatch(column.id);
    }

    return (
        <div className={`flex flex-col w-80 min-w-[20rem] rounded-lg shadow-md transition-colors duration-300 max-h-full
            ${isOverLimit ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-100 border border-gray-200'}
        `}>
            {/* Header */}
            <div className={`p-3 border-b border-gray-200 flex justify-between items-start rounded-t-lg
                ${isOverLimit ? 'bg-red-100' : 'bg-gray-200'}
            `}>
                {isEditing ? (
                    <div className="flex flex-col gap-2 w-full">
                        <input className="text-sm p-1 rounded border" value={tempTitle} onChange={e => setTempTitle(e.target.value)} placeholder="Name" />
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-600">Max:</span>
                            <input className="text-sm p-1 rounded border w-16" type="number" value={tempLimit} onChange={e => setTempLimit(parseInt(e.target.value))} />
                        </div>
                        <div className="flex gap-2 justify-end mt-1">
                            <button onClick={handleUpdateColumn} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Save</button>
                            <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700 truncate" title={column.title}>{column.title}</h3>
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-gray-600"><Edit2 size={14} /></button>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isOverLimit ? 'bg-red-500 text-white font-bold' : 'bg-gray-300 text-gray-600'}`}>
                                {column.items.length} / {column.limit === 0 ? '∞' : column.limit}
                            </span>
                            {isOverLimit && <AlertTriangle size={14} className="text-red-500" />}
                            <button onClick={() => { if(confirm('Delete column?')) removeColumn(column.id) }} className="text-red-300 hover:text-red-500"><Trash size={14} /></button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Move Batch Here Button (Only visible if items selected elsewhere) */}
            {selectedItems.length > 0 && !selectedItems.every(id => column.items.some(i => i.id === id)) && (
                <button 
                    onClick={handleMoveSelectedHere}
                    className="m-2 py-1 px-2 bg-blue-100 text-blue-600 text-xs rounded hover:bg-blue-200 flex items-center justify-center gap-1 dashed border border-blue-300"
                >
                    Move {selectedItems.length} selected here
                </button>
            )}

            {/* Task List */}
            <Droppable droppableId={`col-${column.id}`}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 overflow-y-auto min-h-[100px] ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`}
                    >
                        {column.items.map((item, index) => (
                            <Task key={item.id} item={item} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            {/* Add Item Footer */}
            <form onSubmit={handleAddItem} className="p-3 border-t border-gray-200 bg-white/50 rounded-b-lg">
                <div className="flex gap-2">
                    <input 
                        className="flex-1 w-full text-sm p-2 border rounded focus:outline-none focus:border-indigo-500"
                        placeholder="Add task..."
                        value={newItemContent}
                        onChange={e => setNewItemContent(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                        <Plus size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Column;
