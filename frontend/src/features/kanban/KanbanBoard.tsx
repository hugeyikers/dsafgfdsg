// Placeholder for KanbanBoard
// This will be the main component
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import Column from './components/Column';
import { Plus, Trash2 } from 'lucide-react';

const KanbanBoard = () => {
    const { columns, fetchBoard, addColumn, moveItem, moveBatch, selectedItems, clearSelection, reorderColumns } = useKanbanStore();
    const [newColTitle, setNewColTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchBoard();
    }, []);

    const handleDragEnd = (result: any) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Column Reordering
        if (type === 'COLUMN') {
            const newColumnOrder = Array.from(columns);
            const [removed] = newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, removed);
            
            const newOrderIds = newColumnOrder.map(c => c.id);
            reorderColumns(newOrderIds);
            return;
        }

        // Item Reordering / Moving
        // Parse IDs (assuming draggableId is item-ID)
        const itemId = parseInt(draggableId.split('-')[1]);
        const targetColId = parseInt(destination.droppableId.split('-')[1]);

        moveItem(itemId, targetColId);
    };

    const handleAddColumn = () => {
        if (!newColTitle.trim()) return;
        addColumn(newColTitle, 0); // Default unlimited
        setNewColTitle('');
        setIsAdding(false);
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
                <div className="flex gap-4">
                    {selectedItems.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded border border-blue-200">
                           <span className="text-sm text-blue-700">{selectedItems.length} selected</span>
                           <button onClick={clearSelection} className="text-xs text-blue-500 hover:underline">Clear</button>
                           {/* Batch move dropdown could go here, for now relying on drag or individual arrows */}
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        {isAdding ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    className="border rounded px-2 py-1 text-sm"
                                    placeholder="Column Name"
                                    value={newColTitle}
                                    onChange={e => setNewColTitle(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={handleAddColumn} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Save</button>
                                <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-700">X</button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
                            >
                                <Plus size={18} /> Add Column
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="board" direction="horizontal" type="COLUMN">
                    {(provided) => (
                        <div 
                            className="flex gap-6 h-full overflow-x-auto pb-4 items-start"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {columns.map((col, index) => (
                                <Draggable key={col.id} draggableId={`col-${col.id}`} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <Column column={col} />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;
