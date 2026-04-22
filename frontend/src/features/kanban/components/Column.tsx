import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanColumn, useKanbanStore } from '../../../store/useKanbanStore';
import Task from './Task';
import { Edit2, Check, X, Trash2 } from 'lucide-react';

interface ColumnProps {
    column: KanbanColumn;
    onDeleteClick: () => void;
}

const Column: React.FC<ColumnProps> = ({ column, onDeleteClick }) => {
    const { updateColumn, addItem, columns } = useKanbanStore();
    const [newItemContent, setNewItemContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    const [isEditingCol, setIsEditingCol] = useState(false);
    const [tempTitle, setTempTitle] = useState(column.title);
    const [tempLimit, setTempLimit] = useState(column.limit);

    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [pendingTaskContent, setPendingTaskContent] = useState('');

    const handleAddItem = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const content = newItemContent.trim();
        if (!content) return;

        const isDuplicate = columns.some(col => 
            col.items.some(item => item.content.toLowerCase() === content.toLowerCase())
        );

        if (isDuplicate) {
            setPendingTaskContent(content);
            setShowDuplicateWarning(true);
        } else {
            executeAdd(content);
        }
    };

    const executeAdd = (content: string) => {
        addItem(column.id, content);
        setNewItemContent('');
        setIsAdding(false);
        setShowDuplicateWarning(false);
        setPendingTaskContent('');
    };

    const handleCancelDuplicate = () => {
        setShowDuplicateWarning(false);
        setPendingTaskContent('');
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
    
    // Zmienne dynamiczne! border-[var(...)]
    const borderColorClass = isOverLimit ? 'border-[var(--status-error)]' : 'border-[var(--status-ok)]';
    const bgColorClass = isOverLimit ? 'bg-[var(--status-error)]/10' : 'bg-[var(--bg-card)]';

    const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewItemContent(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddItem();
        }
    };

    return (
        <div className="flex flex-col w-[300px] flex-shrink-0 relative">
            <div className={`flex flex-col border-[3px] ${borderColorClass} rounded-[30px] overflow-hidden relative transition-colors duration-300`}>
                <div className={`flex justify-center items-center p-3 border-b-[3px] ${borderColorClass} relative ${bgColorClass} min-h-[56px] transition-colors duration-300 z-10`}>
                    {isEditingCol ? (
                        <input 
                            autoFocus
                            className="font-medium text-lg text-[var(--text-main)] text-center outline-none border-b-2 border-gray-400 w-3/4 bg-transparent"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveColumn()}
                        />
                    ) : (
                        <h3 className={`font-medium text-xl transition-colors duration-300 px-6 ${isOverLimit ? 'text-[var(--status-error)]' : 'text-[var(--text-main)]'}`}>
                            {column.title}
                        </h3>
                    )}
                    
                    {!isEditingCol && (
                        <div className="absolute right-3 flex flex-col items-center gap-1">
                            <button 
                                onClick={() => setIsAdding(!isAdding)}
                                className={`text-2xl font-light hover:scale-110 transition-transform leading-none ${isOverLimit ? 'text-[var(--status-error)]' : 'text-[var(--text-main)]'}`}
                            >
                                +
                            </button>
                            <button 
                                onClick={onDeleteClick}
                                className={`hover:scale-110 transition-transform ${isOverLimit ? 'text-[var(--status-error)] hover:opacity-80' : 'text-[var(--text-muted)] hover:text-[var(--status-error)]'}`}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden transition-colors duration-300 ${bgColorClass}`}>
                    <div className="h-3 w-full flex-shrink-0" />
                    <Droppable droppableId={`col-${column.id}`}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex-1 flex flex-col items-center gap-3 min-h-[200px] w-full"
                            >
                                {isAdding && (
                                    <form onSubmit={handleAddItem} className="mb-1 w-[280px]">
                                        <textarea 
                                            autoFocus
                                            rows={1}
                                            className="w-full py-3.5 px-4 border-2 border-[var(--border-base)] rounded-[24px] text-center text-sm outline-none bg-[var(--bg-card)] text-[var(--text-main)] resize-none overflow-hidden leading-normal"
                                            placeholder="Nazwa zadania..."
                                            value={newItemContent}
                                            onChange={handleInputResize}
                                            onKeyDown={handleKeyDown}
                                            onBlur={() => {
                                                if(!newItemContent.trim()) setIsAdding(false);
                                            }}
                                        />
                                    </form>
                                )}
                                {column.items.map((item, index) => (
                                    <Task key={item.id} item={item} index={index} columns={columns} rows={[]} onClick={()=>{}} onDoubleClick={()=>{}} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <div className="h-3 w-full flex-shrink-0" />
                </div>
            </div>

            <div className={`flex items-center gap-2 mt-1 ml-4 text-sm font-medium transition-colors duration-300 ${isOverLimit ? 'text-[var(--status-error)]' : 'text-[var(--text-main)]'}`}>
                {isEditingCol ? (
                    <>
                        <span>Max:</span>
                        <input 
                            type="number"
                            min="0"
                            className="w-12 text-center border-b border-[var(--border-base)] outline-none bg-transparent text-[var(--text-main)]"
                            value={tempLimit}
                            onChange={(e) => setTempLimit(parseInt(e.target.value) || 0)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveColumn()}
                        />
                        <button onClick={handleSaveColumn} className="text-[var(--status-ok)] hover:scale-110 ml-1"><Check size={16} /></button>
                        <button onClick={handleCancelEdit} className="text-[var(--status-error)] hover:scale-110"><X size={16} /></button>
                    </>
                ) : (
                    <>
                        <span>Max: {column.limit === 0 ? '∞' : column.limit}</span>
                        <button 
                            onClick={() => setIsEditingCol(true)}
                            className={`${isOverLimit ? 'text-[var(--status-error)] hover:opacity-80' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'} transition-colors`}
                        >
                            <Edit2 size={14} />
                        </button>
                    </>
                )}
            </div>

            {showDuplicateWarning && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all px-4">
                    <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full border-2 border-[var(--border-base)] box-border">
                        <h2 className="text-xl font-bold text-[var(--text-main)] mb-2 text-center">Uwaga, duplikat!</h2>
                        <p className="text-[var(--text-muted)] text-sm text-center mb-6 font-medium">
                            Zadanie o nazwie <b>"{pendingTaskContent}"</b> już istnieje na tablicy. Czy na pewno chcesz dodać kolejne o takiej samej nazwie?
                        </p>
                        <div className="flex justify-center gap-6 w-full">
                            <button 
                                onClick={() => executeAdd(pendingTaskContent)} 
                                className="w-24 py-1.5 rounded-none bg-[var(--status-error)] text-white font-bold hover:opacity-90 border border-transparent transition-colors text-sm"
                            >
                                Tak
                            </button>
                            <button 
                                onClick={handleCancelDuplicate} 
                                className="w-24 py-1.5 rounded-none bg-[var(--bg-page)] text-[var(--text-main)] font-bold hover:bg-[var(--border-base)] border-2 border-[var(--border-base)] transition-colors text-sm"
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

export default Column;