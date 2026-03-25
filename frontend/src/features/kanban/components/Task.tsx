import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useKanbanStore, KanbanItem, KanbanColumn, KanbanRow } from '../../../store/useKanbanStore';
import { useUserStore } from '../../../store/useUserStore';
import { UserPlus, X, HelpCircle, Calendar, User } from 'lucide-react';

interface TaskProps {
    item: KanbanItem;
    index: number;
    columns: KanbanColumn[];
    rows: KanbanRow[];
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
    const { updateItem } = useKanbanStore();
    const { users } = useUserStore();
    
    const [showDetails, setShowDetails] = useState(false);
    const [showAssign, setShowAssign] = useState(false);

    const stopDrag = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    };

    return (
        <>
            <Draggable draggableId={`item-${item.id}`} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`relative w-full p-4 rounded-2xl border border-gray-200 shadow-sm group min-h-[100px] flex flex-col justify-center overflow-hidden transition-all duration-200
                            ${snapshot.isDragging ? 'shadow-2xl z-50 ring-2 ring-purple-500 scale-105' : 'hover:border-purple-300 hover:shadow-md'}
                        `}
                        style={{ 
                            ...provided.draggableProps.style, 
                            backgroundColor: item.color || '#ffffff' 
                        }}
                    >
                        {/* TYTUŁ - Wyśrodkowany, z mniejszą czcionką i bezpiecznym marginesem od ikon */}
                        <div className="flex items-center justify-center py-2 px-1">
                            <p className="text-sm font-bold text-gray-950 break-words leading-tight tracking-tight text-center">
                                {item.title || "Bez tytułu"}
                            </p>
                        </div>

                        {/* PASEK AKCJI - Pokazuje się po najechaniu, ikony są mniejsze */}
                        <div className="absolute bottom-2 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            
                            <div className="relative">
                                <button 
                                    onMouseDown={stopDrag} onTouchStart={stopDrag}
                                    onClick={(e) => { e.stopPropagation(); setShowAssign(!showAssign); setShowDetails(false); }} 
                                    className="relative hover:scale-110 transition-transform flex items-center justify-center"
                                >
                                    {item.assignedTo ? (
                                        <div className="w-6 h-6 rounded-full bg-indigo-500 border border-white flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
                                            {item.assignedTo.fullName.substring(0, 2).toUpperCase()}
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-purple-600 shadow-inner">
                                            <UserPlus size={12} />
                                        </div>
                                    )}
                                </button>

                                {showAssign && (
                                    <div 
                                        onMouseDown={stopDrag} onTouchStart={stopDrag}
                                        className="absolute bottom-8 right-0 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-2 text-sm flex flex-col gap-1 cursor-default animate-in fade-in zoom-in-95"
                                    >
                                        <div className="flex justify-between items-center px-2 py-1">
                                            <span className="font-bold text-[10px] text-gray-400 uppercase">Wykonawca</span>
                                            <button onClick={(e) => { e.stopPropagation(); setShowAssign(false); }} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); updateItem(item.id, { assignedToId: null }); setShowAssign(false); }} className="text-left px-2 py-1.5 hover:bg-gray-50 rounded-lg text-xs">Brak</button>
                                        {users.map(u => (
                                            <button key={u.id} onClick={(e) => { e.stopPropagation(); updateItem(item.id, { assignedToId: u.id }); setShowAssign(false); }} className="text-left px-2 py-1.5 hover:bg-purple-50 rounded-lg flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[8px] font-bold">{u.fullName.substring(0,2).toUpperCase()}</div>
                                                <span className="text-xs">{u.fullName}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onMouseDown={stopDrag} onTouchStart={stopDrag}
                                onClick={(e) => { e.stopPropagation(); setShowDetails(true); setShowAssign(false); }} 
                                className="w-6 h-6 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-purple-100 hover:text-purple-700 shadow-sm transition-all"
                            >
                                <HelpCircle size={14}/>
                            </button>
                        </div>
                    </div>
                )}
            </Draggable>

            {/* MODAL EDYCJI - Bez zmian w logice, poprawione paddingi */}
            {showDetails && (
                <div 
                    onMouseDown={stopDrag} onTouchStart={stopDrag}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowDetails(false)} 
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-900">Edycja Zadania</h3>
                            <button onClick={() => setShowDetails(false)} className="p-1 text-gray-400 hover:text-red-500"><X size={20}/></button>
                        </div>

                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tytuł</label>
                                <input 
                                    className="w-full text-sm font-bold p-3 border border-gray-200 rounded-xl focus:border-purple-500 outline-none shadow-inner"
                                    defaultValue={item.title}
                                    onBlur={(e) => updateItem(item.id, { title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Opis</label>
                                <textarea 
                                    className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:border-purple-500 outline-none resize-none min-h-[100px] shadow-inner"
                                    defaultValue={item.content}
                                    onBlur={(e) => updateItem(item.id, { content: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-1">
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase">Utworzono</label>
                                    <span className="text-xs font-semibold">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase">Edytowano</label>
                                    <span className="text-xs font-semibold">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Kolor karty</label>
                                <div className="flex gap-2">
                                    {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                        <button 
                                            key={color} 
                                            onClick={() => updateItem(item.id, { color })}
                                            className={`w-7 h-7 rounded-full border ${item.color === color ? 'ring-2 ring-purple-500 ring-offset-2' : 'border-gray-200'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={() => setShowDetails(false)}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                            >
                                Gotowe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Task;