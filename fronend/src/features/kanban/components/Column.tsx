import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanColumn, useKanbanStore } from '../../../store/useKanbanStore';
import Task from './Task';
import { Edit2, Check, X } from 'lucide-react';

interface ColumnProps {
    column: KanbanColumn;
}

const Column: React.FC<ColumnProps> = ({ column }) => {
    const { updateColumn, addItem } = useKanbanStore();
    const [newItemContent, setNewItemContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    const [isEditingCol, setIsEditingCol] = useState(false);
    const [tempTitle, setTempTitle] = useState(column.title);
    const [tempLimit, setTempLimit] = useState(column.limit);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemContent.trim()) return;
        addItem(column.id, newItemContent);
        setNewItemContent('');
        setIsAdding(false);
    };

    const handleSaveColumn = () => {
        if (tempTitle.trim()) {
            updateColumn(column.id, { title: tempTitle, limit: tempLimit });
        }
        setIsEditingCol(false);
    };

    const handleCancelEdit = () => {
        setTempTitle(column.title);
        setTempLimit(column.limit);
        setIsEditingCol(false);
    };

    const isOverLimit = column.limit > 0 && column.items.length > column.limit;

    const borderColorClass = isOverLimit ? 'border-red-500' : 'border-[#00ff44]';
    const bgColorClass = isOverLimit ? 'bg-red-50' : 'bg-white';

    return (
        <div className="flex flex-col w-[300px] flex-shrink-0 relative">
            
            <div className={`flex flex-col border-[3px] ${borderColorClass} rounded-[30px] overflow-hidden relative transition-colors duration-300`}>
                
                <div className={`flex justify-center items-center p-3 border-b-[3px] ${borderColorClass} relative ${bgColorClass} min-h-[56px] transition-colors duration-300`}>
                    {isEditingCol ? (
                        <input 
                            autoFocus
                            className="font-medium text-lg text-black text-center outline-none border-b-2 border-gray-400 w-3/4 bg-transparent"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveColumn()}
                        />
                    ) : (
                        <h3 className={`font-medium text-lg transition-colors duration-300 ${isOverLimit ? 'text-red-700' : 'text-black'}`}>
                            {column.title}
                        </h3>
                    )}
                    
                    {!isEditingCol && (
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className={`absolute right-4 text-2xl font-light hover:scale-110 transition-transform ${isOverLimit ? 'text-red-700' : 'text-black'}`}
                            title="Dodaj zadanie"
                        >
                            +
                        </button>
                    )}
                </div>

                <Droppable droppableId={`col-${column.id}`}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 p-4 overflow-y-auto min-h-[200px] flex flex-col gap-3 transition-colors duration-300 ${bgColorClass}`}
                        >
                            {isAdding && (
                                <form onSubmit={handleAddItem} className="mb-2">
                                    <input 
                                        autoFocus
                                        className="w-full p-2 border border-gray-400 rounded-full text-center text-sm outline-none bg-white"
                                        placeholder="Nazwa zadania..."
                                        value={newItemContent}
                                        onChange={e => setNewItemContent(e.target.value)}
                                        onBlur={() => {
                                            if(!newItemContent.trim()) setIsAdding(false);
                                        }}
                                    />
                                </form>
                            )}

                            {column.items.map((item, index) => (
                                <Task key={item.id} item={item} index={index} />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>

            <div className={`flex items-center gap-2 mt-1 ml-4 text-sm font-medium transition-colors duration-300 ${isOverLimit ? 'text-red-600' : 'text-black'}`}>
                {isEditingCol ? (
                    <>
                        <span>Max:</span>
                        <input 
                            type="number"
                            min="0"
                            className="w-12 text-center border-b border-gray-400 outline-none bg-transparent text-black"
                            value={tempLimit}
                            onChange={(e) => setTempLimit(parseInt(e.target.value) || 0)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveColumn()}
                        />
                        <button onClick={handleSaveColumn} className="text-green-600 hover:scale-110 ml-1"><Check size={16} /></button>
                        <button onClick={handleCancelEdit} className="text-red-500 hover:scale-110"><X size={16} /></button>
                    </>
                ) : (
                    <>
                        <span>Max: {column.limit === 0 ? '∞' : column.limit}</span>
                        <button 
                            onClick={() => setIsEditingCol(true)}
                            className={`${isOverLimit ? 'text-red-500 hover:text-red-700' : 'text-gray-600 hover:text-black'} transition-colors`}
                            title="Edytuj kolumnę"
                        >
                            <Edit2 size={14} />
                        </button>
                    </>
                )}
            </div>
            
        </div>
    );
};

export default Column;