import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import { useKanbanStore, KanbanItem, KanbanColumn, KanbanRow } from '../../../store/useKanbanStore';
import { useUserStore } from '../../../store/useUserStore';
import { X, Calendar, Save, Ban, Edit3, Trash2 } from 'lucide-react';

interface TaskProps {
    item: KanbanItem;
    index: number;
    columns: KanbanColumn[];
    rows: KanbanRow[];
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
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
        e.stopPropagation(); // To sprawia, że dwuklik na tasku NIE wywołuje dodawania nowego taska pod spodem
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
        const finalData = { ...editData };
        if (!finalData.content || finalData.content.trim() === '') {
            finalData.content = 'none';
        }
        updateItem(item.id, finalData);
        setIsEditing(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        const confirmed = window.confirm("Are you sure you want to delete this task? This action cannot be undone.");
        if (confirmed) {
            removeItem(item.id); 
            setShowDetails(false); 
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return `${date.toLocaleDateString()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Draggable draggableId={`item-${item.id}`} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onDoubleClick={handleDoubleClick}
                        // ZMIANA: w-full i mb-3 gwarantują poprawny layout wewnątrz uproszczonego modala
                        className={`relative w-full mb-3 p-3 flex flex-col items-center justify-center rounded-xl border border-gray-200 group min-h-[85px] overflow-hidden cursor-pointer text-center transition-shadow transition-colors duration-200
                            ${snapshot.isDragging ? 'shadow-2xl z-50 ring-2 ring-purple-500' : 'shadow-sm hover:border-purple-400 hover:shadow-md'}
                        `}
                        style={{ 
                            ...provided.draggableProps.style, 
                            backgroundColor: item.color || '#ffffff' 
                        }}
                    >
                        <div className="flex items-center justify-center flex-1 px-1">
                            <p className="text-[13px] font-extrabold text-gray-900 break-words leading-tight tracking-tight select-none">
                                {item.title || "Untitled Task"}
                            </p>
                        </div>

                        <div className="mt-2 select-none">
                            {item.assignedTo ? (
                                <div className="border border-gray-200 bg-gray-50 text-gray-600 px-2.5 py-0.5 rounded-full text-[9px] font-bold inline-block shadow-inner tracking-tight truncate max-w-[120px]">
                                    {item.assignedTo.fullName}
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-300 bg-white text-gray-400 px-2.5 py-0.5 rounded-full text-[9px] font-semibold italic inline-block tracking-tight">
                                    Unassigned
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Draggable>

            {/* MODAL SZCZEGÓŁÓW / EDYCJI */}
            {showDetails && createPortal(
                <div 
                    onMouseDown={stopDrag} onTouchStart={stopDrag}
                    onDoubleClick={(e) => e.stopPropagation()} 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 sm:p-6"
                    onClick={() => setShowDetails(false)} 
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="relative flex items-center justify-center p-6 border-b border-gray-100 bg-white">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                                {isEditing ? 'Edit Task' : 'Task Details'}
                            </h3>
                            <button 
                                onClick={() => setShowDetails(false)} 
                                className="absolute right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        <div className="p-6 sm:p-10 flex flex-col gap-6 overflow-y-auto bg-white">
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>Title</label>
                                {isEditing ? (
                                    <input 
                                        className="w-full text-base font-bold p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner"
                                        value={editData.title}
                                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                                        placeholder="Enter task title..."
                                        autoFocus
                                    />
                                ) : (
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                        {item.title || "Untitled Task"}
                                    </h2>
                                )}
                            </div>

                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>Assignee</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <select
                                            className="w-full text-sm p-4 pr-10 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner appearance-none cursor-pointer"
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

                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2.5 ${isEditing ? 'text-xs text-gray-500' : 'text-[10px] text-gray-400'}`}>Description</label>
                                {isEditing ? (
                                    <textarea 
                                        className="w-full text-sm p-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none min-h-[150px] shadow-inner"
                                        value={editData.content === 'none' ? '' : editData.content}
                                        onChange={(e) => setEditData({...editData, content: e.target.value})}
                                        placeholder="Add details, steps, notes..."
                                    />
                                ) : (
                                    <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 min-h-[100px] shadow-inner">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {item.content && item.content.trim() !== '' && item.content !== 'none' 
                                                ? item.content 
                                                : <span className="italic text-gray-400">No description provided.</span>
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

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
                        
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                            <div>
                                {isEditing ? null : (
                                    <button 
                                        onClick={handleDelete}
                                        className="px-5 py-2.5 flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-colors shadow-sm border border-red-200"
                                    >
                                        <Trash2 size={16}/> Delete Task
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
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
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors shadow-md"
                                    >
                                        <Edit3 size={16}/> Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}
        </>
    );
};

export default Task;