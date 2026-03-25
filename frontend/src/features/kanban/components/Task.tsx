import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useKanbanStore, KanbanItem, KanbanColumn, KanbanRow } from '../../../store/useKanbanStore';
import { useUserStore } from '../../../store/useUserStore';
import { UserPlus, X, HelpCircle, Calendar, User, Save, Ban, Edit3, Trash2 } from 'lucide-react';

interface TaskProps {
    item: KanbanItem;
    index: number;
    columns: KanbanColumn[];
    rows: KanbanRow[];
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
    // Wyciągamy updateItem i removeItem ze store'a
    const { updateItem, removeItem } = useKanbanStore();
    const { users } = useUserStore();
    
    const [showDetails, setShowDetails] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [editData, setEditData] = useState({
        title: item.title || '',
        content: item.content || '',
        color: item.color || '#ffffff',
        assignedToId: item.assignedToId || null,
    });

    const stopDrag = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditData({
            title: item.title || '',
            content: item.content || '',
            color: item.color || '#ffffff',
            assignedToId: item.assignedToId || null,
        });
        setIsEditing(false);
        setShowDetails(true);
    };

    const handleSaveChanges = () => {
        updateItem(item.id, editData);
        setIsEditing(false);
    };

    // Funkcja obsługująca usuwanie z potwierdzeniem
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Blokujemy drag i zamknięcie modala
        
        // Wyświetlamy standardowy komunikat potwierdzający (po angielsku)
        const confirmed = window.confirm("Are you sure you want to delete this task? This action cannot be undone.");
        
        if (confirmed) {
            removeItem(item.id); // Usuwamy z bazy
            setShowDetails(false); // Zamykamy modal
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return `${date.toLocaleDateString()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* --- KARTA ZADANIA (WIDOK KANBAN) --- */}
            <Draggable draggableId={`item-${item.id}`} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onDoubleClick={handleDoubleClick}
                        className={`relative w-full p-4 flex flex-col items-center justify-center rounded-2xl border border-gray-200 shadow-sm group min-h-[110px] overflow-hidden transition-all duration-200 cursor-pointer text-center
                            ${snapshot.isDragging ? 'shadow-2xl z-50 ring-2 ring-purple-500 scale-105' : 'hover:border-purple-300 hover:shadow-md'}
                        `}
                        style={{ 
                            ...provided.draggableProps.style, 
                            backgroundColor: item.color || '#ffffff' 
                        }}
                    >
                        {/* TYTUŁ ZADANIA */}
                        <div className="flex items-center justify-center flex-1 py-1 px-1">
                            <p className="text-sm font-extrabold text-gray-950 break-words leading-tight tracking-tight select-none">
                                {item.title || "Untitled"}
                            </p>
                        </div>

                        {/* ETYKIETA ASSIGNEE */}
                        <div className="mt-3 select-none">
                            {item.assignedTo ? (
                                <div className="border border-gray-200 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-[10px] font-semibold inline-block shadow-inner tracking-tight">
                                    {item.assignedTo.fullName}
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-300 bg-white text-gray-400 px-3 py-1 rounded-full text-[10px] font-medium italic inline-block tracking-tight">
                                    Unassigned
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Draggable>

            {/* --- MODAL SZCZEGÓŁÓW / EDYCJI --- */}
            {showDetails && (
                <div 
                    onMouseDown={stopDrag} onTouchStart={stopDrag}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4"
                    onClick={() => setShowDetails(false)} 
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        
                        {/* Główny kontener z paddingiem (Safe Zone) - p-[40px] (ok. +5px od standardowego p-8) */}
                        <div className="p-[40px] flex flex-col w-full h-full bg-white">
                            
                            {/* NAGŁÓWEK (Krzyżyk) */}
                            <div className="flex justify-end items-center mb-6">
                                <button 
                                    onClick={() => setShowDetails(false)} 
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={24}/>
                                </button>
                            </div>

                            {/* CIAŁO MODALA (Zawartość) */}
                            <div className="flex flex-col gap-6">
                                
                                {/* TYTUŁ */}
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>Title</label>
                                    {isEditing ? (
                                        <input 
                                            className="w-full text-base font-bold p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all shadow-inner"
                                            value={editData.title}
                                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                                            placeholder="Enter task title..."
                                            autoFocus
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                            {item.title || "Untitled"}
                                        </h2>
                                    )}
                                </div>

                                {/* ASSIGNEE */}
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>Assignee</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <select
                                                className="w-full text-sm p-4 pr-10 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all shadow-inner appearance-none cursor-pointer"
                                                value={editData.assignedToId || ''}
                                                onChange={(e) => setEditData({...editData, assignedToId: e.target.value ? parseInt(e.target.value) : null})}
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 shadow-inner w-max pr-6">
                                            {item.assignedTo ? (
                                                <>
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                                        {item.assignedTo.fullName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-gray-800 font-semibold">{item.assignedTo.fullName}</span>
                                                </>
                                            ) : (
                                                <span className="italic text-gray-400 text-sm pl-1 pr-2">Unassigned</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* OPIS */}
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>Description</label>
                                    {isEditing ? (
                                        <textarea 
                                            className="w-full text-sm p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none min-h-[150px] shadow-inner"
                                            value={editData.content}
                                            onChange={(e) => setEditData({...editData, content: e.target.value})}
                                            placeholder="Add details, steps, notes..."
                                        />
                                    ) : (
                                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 min-h-[100px] shadow-inner">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {item.content && item.content !== 'brak' ? item.content : <span className="italic text-gray-400">No description provided.</span>}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* DATY */}
                                <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50/80 rounded-xl border border-gray-100 shadow-inner">
                                    <div className="flex items-start gap-3.5">
                                        <div className="mt-1 text-purple-400"><Calendar size={18} /></div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created</label>
                                            <span className="text-sm text-gray-800 font-semibold">{item.createdAt ? formatDateTime(item.createdAt) : 'No data'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3.5">
                                        <div className="mt-1 text-purple-400"><Calendar size={18} /></div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Modified</label>
                                            <span className="text-sm text-gray-800 font-semibold">{item.updatedAt ? formatDateTime(item.updatedAt) : 'No data'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* WYBÓR KOLORU */}
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>Task Color</label>
                                    {isEditing ? (
                                        <div className="flex gap-3.5">
                                            {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                                <button 
                                                    key={color} 
                                                    onClick={() => setEditData({...editData, color})}
                                                    className={`w-9 h-9 rounded-full border border-gray-300 transition-all hover:scale-110 shadow
                                                        ${editData.color === color ? 'ring-2 ring-purple-500 ring-offset-2 scale-110' : ''}
                                                    `}
                                                    style={{ backgroundColor: color }}
                                                    title={`Set this color`}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        item.color && item.color !== '#ffffff' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: item.color }} />
                                                <span className="text-xs font-semibold text-gray-600">Card marked with this color.</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            
                            {/* STOPKA Z PRZYCISKAMI */}
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3 relative">
                                {isEditing ? (
                                    <>
                                        <button 
                                            onClick={() => setIsEditing(false)}
                                            className="px-5 py-2.5 flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
                                        >
                                            <Ban size={16}/> Cancel
                                        </button>
                                        <button 
                                            onClick={handleSaveChanges}
                                            className="px-6 py-2.5 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
                                        >
                                            <Save size={16}/> Save changes
                                        </button>
                                    </>
                                ) : (
                                    // WIDOK PODGLĄDU - Przyciski Usuń i Edytuj obok siebie
                                    <>
                                        {/* PRZYCISK USUWANIA (Czerwony) - Teraz dostępny na poziomie formularza */}
                                        <button 
                                            onClick={handleDelete}
                                            className="px-5 py-2.5 flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors shadow-sm border border-red-200"
                                        >
                                            <Trash2 size={16}/> Delete Task
                                        </button>

                                        {/* PRZYCISK EDYCJI (Czarny) */}
                                        <button 
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2.5 flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors shadow-md"
                                        >
                                            <Edit3 size={16}/> Edit
                                        </button>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Task;