import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useKanbanStore, KanbanItem, KanbanColumn, KanbanRow } from '../../../store/useKanbanStore';
import { useUserStore } from '../../../store/useUserStore';
import { UserPlus, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react';

interface TaskProps {
    item: KanbanItem;
    index: number;
    columns: KanbanColumn[];
    rows: KanbanRow[];
}

const Task: React.FC<TaskProps> = ({ item, index, columns, rows }) => {
    const { updateItem, moveItem } = useKanbanStore();
    const { users } = useUserStore();
    
    const [showDetails, setShowDetails] = useState(false);
    const [showAssign, setShowAssign] = useState(false);

    // Szukanie Kolumn (Prawo / Lewo)
    const currentColIndex = columns.findIndex(c => c.id === item.columnId);
    const prevColId = currentColIndex > 0 ? columns[currentColIndex - 1].id : null;
    const nextColId = currentColIndex < columns.length - 1 ? columns[currentColIndex + 1].id : null;

    // Szukanie Wierszy (Góra / Dół) - dołączamy wirtualny wiersz z `null` na nieprzypisane
    const rowArray = [...rows, {id: null, title: 'Brak', order: 999}];
    const currentRowIndex = rowArray.findIndex(r => r.id === item.rowId);
    
    const prevRowId = currentRowIndex > 0 ? rowArray[currentRowIndex - 1].id : undefined;
    const nextRowId = currentRowIndex !== -1 && currentRowIndex < rowArray.length - 1 ? rowArray[currentRowIndex + 1].id : undefined;

    // Funkcja blokująca "chwytanie" Drag&Drop podczas klikania w guziki
    const stopDrag = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    };

    return (
        <Draggable draggableId={`item-${item.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`relative w-full py-6 px-7 rounded-xl border border-gray-200 shadow-sm group min-h-[100px] flex flex-col overflow-hidden transition-all
                        ${snapshot.isDragging ? 'shadow-2xl z-50 ring-2 ring-purple-500 scale-105' : ''}
                    `}
                    style={{ 
                        ...provided.draggableProps.style, 
                        backgroundColor: item.color || '#ffffff' 
                    }}
                >
                    {/* --- STRZAŁKI NAWIGACYJNE NA KRAWĘDZIACH --- */}
                    
                    {/* Strzałka Lewo */}
                    {prevColId !== null && (
                        <button 
                            onMouseDown={stopDrag} 
                            onTouchStart={stopDrag}
                            onClick={(e) => { e.stopPropagation(); moveItem(item.id, prevColId, item.rowId); }} 
                            className="absolute left-0 top-0 bottom-0 w-6 bg-black/5 hover:bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-30 text-gray-700"
                        >
                            <ChevronLeft size={16}/>
                        </button>
                    )}
                    {/* Strzałka Prawo */}
                    {nextColId !== null && (
                        <button 
                            onMouseDown={stopDrag} 
                            onTouchStart={stopDrag}
                            onClick={(e) => { e.stopPropagation(); moveItem(item.id, nextColId, item.rowId); }} 
                            className="absolute right-0 top-0 bottom-0 w-6 bg-black/5 hover:bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-30 text-gray-700"
                        >
                            <ChevronRight size={16}/>
                        </button>
                    )}
                    {/* Strzałka Góra */}
                    {prevRowId !== undefined && (
                        <button 
                            onMouseDown={stopDrag} 
                            onTouchStart={stopDrag}
                            onClick={(e) => { e.stopPropagation(); moveItem(item.id, item.columnId, prevRowId); }} 
                            className="absolute top-0 left-0 right-0 h-5 bg-black/5 hover:bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-30 text-gray-700"
                        >
                            <ChevronUp size={16}/>
                        </button>
                    )}
                    {/* Strzałka Dół */}
                    {nextRowId !== undefined && (
                        <button 
                            onMouseDown={stopDrag} 
                            onTouchStart={stopDrag}
                            onClick={(e) => { e.stopPropagation(); moveItem(item.id, item.columnId, nextRowId); }} 
                            className="absolute bottom-0 left-0 right-0 h-5 bg-black/5 hover:bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-30 text-gray-700"
                        >
                            <ChevronDown size={16}/>
                        </button>
                    )}

                    {/* --- TREŚĆ KARTY --- */}
                    <div className="flex-1 pb-2">
                        <p className="text-sm font-bold text-gray-800 break-words">{item.title}</p>
                    </div>

                    {/* Guzik Szczegółów "?" */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                        <button 
                            onMouseDown={stopDrag} 
                            onTouchStart={stopDrag}
                            onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }} 
                            className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-purple-100 shadow-sm text-xs font-bold hover:scale-110 transition-transform"
                        >
                            ?
                        </button>
                    </div>

                    {/* Avatar Przypisanego Użytkownika */}
                    <div className="mt-auto pt-3 flex justify-end relative z-20">
                        <button 
                            onMouseDown={stopDrag} 
                            onTouchStart={stopDrag}
                            onClick={(e) => { e.stopPropagation(); setShowAssign(!showAssign); }} 
                            className="relative hover:scale-110 transition-transform"
                        >
                            {item.assignedTo ? (
                                <div className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm" title={item.assignedTo.fullName}>
                                    {item.assignedTo.fullName.substring(0, 2).toUpperCase()}
                                </div>
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center text-gray-500">
                                    <UserPlus size={14} />
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Popover - Przypisz Usera */}
                    {showAssign && (
                        <div 
                            onMouseDown={stopDrag} 
                            onTouchStart={stopDrag}
                            className="absolute bottom-10 right-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 text-sm flex flex-col gap-1 cursor-default"
                        >
                            <span className="font-bold text-xs text-gray-500 mb-1">Przypisz do:</span>
                            <button onClick={(e) => { e.stopPropagation(); updateItem(item.id, { assignedToId: null }); setShowAssign(false); }} className="text-left px-2 py-1 hover:bg-gray-100 rounded text-gray-500">Brak przypisania</button>
                            {users.map(u => (
                                <button key={u.id} onClick={(e) => { e.stopPropagation(); updateItem(item.id, { assignedToId: u.id }); setShowAssign(false); }} className="text-left px-2 py-1 hover:bg-purple-50 rounded font-medium flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-[8px] font-bold">{u.fullName.substring(0,2).toUpperCase()}</div>
                                    {u.fullName}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Popover - Szczegóły Taska (?) */}
                    {showDetails && (
                        <div 
                            onMouseDown={stopDrag} 
                            onTouchStart={stopDrag}
                            className="absolute top-10 right-0 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4 cursor-default"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-xs text-gray-500 uppercase">Szczegóły Zadania</h4>
                                <button onClick={(e) => { e.stopPropagation(); setShowDetails(false); }} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                            </div>
                            
                            <label className="block text-xs font-bold mb-1">Opis:</label>
                            <textarea 
                                className="w-full text-sm p-2 border rounded-lg bg-gray-50 mb-3 resize-none focus:outline-none focus:border-purple-500"
                                rows={3}
                                defaultValue={item.content}
                                onBlur={(e) => updateItem(item.id, { content: e.target.value })}
                            />
                            
                            <div className="flex gap-4 mb-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400">Utworzono:</label>
                                    <span className="text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Brak'}</span>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400">Zaktualizowano:</label>
                                    <span className="text-xs">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Brak'}</span>
                                </div>
                            </div>

                            <label className="block text-xs font-bold mb-1">Kolor karty:</label>
                            <div className="flex gap-2">
                                {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                    <button 
                                        key={color} 
                                        onClick={(e) => { e.stopPropagation(); updateItem(item.id, { color }); }}
                                        className={`w-6 h-6 rounded-full border border-gray-300 ${item.color === color ? 'ring-2 ring-purple-500' : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default Task;