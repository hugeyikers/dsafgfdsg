import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useKanbanStore } from '../../store/useKanbanStore';
import Column from './components/Column';
import { Plus, Trash2, X } from 'lucide-react';

const KanbanBoard = () => {
    const { columns, fetchBoard, addColumn, moveItem, moveItemsBatch, selectedItems, clearSelection, reorderColumns, removeItem, removeColumn } = useKanbanStore();
    const [newColTitle, setNewColTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    const [dragType, setDragType] = useState<string | null>(null);
    const [colToDelete, setColToDelete] = useState<number | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

    const [targetColForTasks, setTargetColForTasks] = useState<string>('');

    useEffect(() => {
        fetchBoard();
    }, []);

    const handleDragStart = (start: any) => {
        setDragType(start.type);
    };

    const handleDragEnd = (result: any) => {
        setDragType(null);

        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (destination.droppableId === 'trash-zone-col') {
            const colId = parseInt(draggableId.split('-')[1]);
            if (!isNaN(colId)) {
                setColToDelete(colId);
            }
            return;
        }

        if (destination.droppableId === 'trash-zone-task') {
            const itemId = parseInt(draggableId.split('-')[1]);
            if (!isNaN(itemId)) {
                setTaskToDelete(itemId);
            }
            return;
        }

        if (type === 'COLUMN') {
            const newColumnOrder = Array.from(columns);
            const [removed] = newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, removed);
            
            const newOrderIds = newColumnOrder.map(c => c.id);
            reorderColumns(newOrderIds);
            return;
        }

        const itemId = parseInt(draggableId.split('-')[1]);
        const targetColId = parseInt(destination.droppableId.split('-')[1]);

        moveItem(itemId, targetColId);
    };

    const handleAddColumn = () => {
        if (!newColTitle.trim()) return;
        addColumn(newColTitle, 0); 
        setNewColTitle('');
        setIsAdding(false);
    };

    const handleConfirmDeleteColumn = async () => {
        if (colToDelete !== null) {
            const colIndex = columns.findIndex(c => c.id === colToDelete);
            const deletingColObj = columns[colIndex];
            
            if (deletingColObj && deletingColObj.items.length > 0 && targetColForTasks !== '') {
                const targetColId = parseInt(targetColForTasks);
                if (!isNaN(targetColId)) {
                    const itemIdsToMove = deletingColObj.items.map(item => item.id);
                    await moveItemsBatch(itemIdsToMove, targetColId);
                }
            }
            
            await removeColumn(colToDelete);
            setColToDelete(null);
            setTargetColForTasks('');
        }
    };

    const handleCancelDeleteColumn = () => {
        setColToDelete(null);
        setTargetColForTasks('');
    };

    const deletingColObj = colToDelete !== null ? columns.find(c => c.id === colToDelete) : null;
    const hasTasks = deletingColObj ? deletingColObj.items.length > 0 : false;
    const otherColumns = colToDelete !== null ? columns.filter(c => c.id !== colToDelete) : [];

    return (
        <div className="h-full flex flex-col w-full pt-8 relative">
            
            {taskToDelete !== null && (
                <style>{`[data-rbd-draggable-id="item-${taskToDelete}"] { opacity: 0 !important; pointer-events: none !important; }`}</style>
            )}

            <div className="flex justify-end items-center mb-6 px-6 flex-shrink-0 h-12">
                <div className="flex gap-4 items-center">
                    
                    {selectedItems.length > 0 && (
                        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full border-[2px] border-gray-300">
                           <span className="text-sm font-medium text-gray-800">{selectedItems.length} selected</span>
                           <button onClick={clearSelection} className="text-xs text-red-500 font-bold hover:text-red-700 uppercase tracking-wider transition-colors">Clear</button>
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        {isAdding ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    className="px-4 py-2 border-[3px] border-purple-500 rounded-full text-sm outline-none bg-white text-black font-medium w-48 transition-colors focus:bg-purple-50"
                                    placeholder="Column Name..."
                                    value={newColTitle}
                                    onChange={e => setNewColTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                                    autoFocus
                                />
                                <button 
                                    onClick={handleAddColumn} 
                                    className="bg-purple-500 text-white px-5 py-2 rounded-full text-sm font-bold border-[3px] border-purple-500 hover:bg-transparent hover:text-purple-600 transition-colors"
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={() => setIsAdding(false)} 
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full border-[3px] border-purple-500 bg-white text-black font-bold text-sm hover:bg-purple-50 transition-colors group"
                            >
                                <Plus size={18} className="text-purple-500 group-hover:scale-110 transition-transform" /> Add Column
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Droppable droppableId="board" direction="horizontal" type="COLUMN">
                        {(provided) => (
                            <div 
                                className="kanban-columns-container flex flex-1 gap-6 overflow-x-auto items-start pb-4"
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
                                                className={`transition-opacity duration-200 ${colToDelete === col.id ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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

                    <div className="relative w-1/2 self-center mt-0 mb-24 h-24 flex-shrink-0">
                        <Droppable droppableId="trash-zone-col" type="COLUMN" isDropDisabled={dragType !== 'COLUMN'}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`absolute inset-0 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${
                                        dragType === 'COLUMN' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
                                    } ${
                                        snapshot.isDraggingOver 
                                            ? 'bg-red-200 border-red-500 text-red-600 scale-[1.02]' 
                                            : 'bg-red-50 border-red-400 text-red-500'
                                    }`}
                                >
                                    <Trash2 size={40} className={`transition-transform duration-300 ${snapshot.isDraggingOver ? 'scale-110' : 'scale-100'}`} />
                                    <div className="hidden">{provided.placeholder}</div>
                                </div>
                            )}
                        </Droppable>

                        <Droppable droppableId="trash-zone-task" isDropDisabled={dragType === 'COLUMN'}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`absolute inset-0 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${
                                        dragType !== 'COLUMN' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
                                    } ${
                                        snapshot.isDraggingOver 
                                            ? 'bg-red-200 border-red-500 text-red-600 scale-[1.02]' 
                                            : 'bg-red-50 border-red-400 text-red-500 hover:bg-red-100 hover:text-red-600'
                                    }`}
                                >
                                    <Trash2 size={40} className={`transition-transform duration-300 ${snapshot.isDraggingOver ? 'scale-110' : 'scale-100'}`} />
                                    <div className="hidden">{provided.placeholder}</div>
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>

            <div className="absolute bottom-4 left-6 text-[11px] leading-relaxed text-gray-400 font-medium pointer-events-none select-none z-0">
                <p>Copyright Drużyna Pierścienia 2026</p>
                <p>Jakub Malinowski, Piotr Ostaszewski, Jakub Klimas, Adrian Skamarski, Radosław Matusiak</p>
            </div>

            {colToDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all px-4">
                    <div className="bg-[#EBEBEB] p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full border-2 border-gray-400 box-border">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Usunąć kolumnę?</h2>
                        
                        {hasTasks ? (
                            <div className="w-full flex flex-col mb-6">
                                <p className="text-gray-700 text-sm text-center mb-3 font-medium">
                                    Ta kolumna zawiera <b>{deletingColObj?.items.length}</b> zadań. Co chcesz z nimi zrobić?
                                </p>
                                {otherColumns.length > 0 ? (
                                    <select 
                                        className="w-full py-2 px-3 border-2 border-gray-400 bg-white text-black text-sm outline-none rounded-none focus:border-purple-500 transition-colors"
                                        value={targetColForTasks}
                                        onChange={(e) => setTargetColForTasks(e.target.value)}
                                    >
                                        <option value="">-- Usuń wszystkie zadania --</option>
                                        {otherColumns.map(c => (
                                            <option key={c.id} value={c.id}>Przenieś do: {c.title}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-red-500 text-xs text-center font-bold uppercase mt-1">Brak innych kolumn - zadania zostaną trwale skasowane.</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-700 text-sm text-center mb-6 font-medium">
                                Ta operacja jest nieodwracalna. Kolumna zostanie trwale usunięta.
                            </p>
                        )}

                        <div className="flex justify-center gap-6 w-full">
                            <button 
                                onClick={handleConfirmDeleteColumn}
                                className="w-24 py-1.5 rounded-none bg-[#FF6B6B] text-black font-bold hover:bg-[#ff5252] border border-[#FF6B6B] transition-colors text-sm"
                            >
                                Tak
                            </button>
                            <button 
                                onClick={handleCancelDeleteColumn}
                                className="w-24 py-1.5 rounded-none bg-white text-black font-bold hover:bg-gray-50 border-2 border-gray-400 transition-colors text-sm"
                            >
                                Nie
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {taskToDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all px-4">
                    <div className="bg-[#EBEBEB] p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full border-2 border-gray-400 box-border">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Usunąć zadanie?</h2>
                        <p className="text-gray-700 text-sm text-center mb-6 font-medium">
                            Ta operacja jest nieodwracalna. Zadanie zostanie trwale skasowane z tablicy.
                        </p>
                        <div className="flex justify-center gap-6 w-full">
                            <button 
                                onClick={() => {
                                    removeItem(taskToDelete);
                                    setTaskToDelete(null);
                                }}
                                className="w-24 py-1.5 rounded-none bg-[#FF6B6B] text-black font-bold hover:bg-[#ff5252] border border-[#FF6B6B] transition-colors text-sm"
                            >
                                Tak
                            </button>
                            <button 
                                onClick={() => setTaskToDelete(null)}
                                className="w-24 py-1.5 rounded-none bg-white text-black font-bold hover:bg-gray-50 border-2 border-gray-400 transition-colors text-sm"
                            >
                                Nie
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;