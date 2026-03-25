// frontend/src/features/kanban/components/Task.tsx
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ArrowLeft, ArrowRight, CornerDownRight, User, Palette } from 'lucide-react';
import { useKanbanStore, KanbanItem } from '../../../store/useKanbanStore';
import TaskDetailsModal from './TaskDetailsModal';

interface TaskProps {
    item: KanbanItem;
    index: number;
}

const Task: React.FC<TaskProps> = ({ item, index }) => {
    // Pobieramy dane z Twojego useKanbanStore
    const { columns, moveItem } = useKanbanStore();
    
    // Stan do otwierania modalu szczegółów (?)
    const [showDetails, setShowDetails] = useState(false);

    // --- LOGIKA STRZAŁEK SZYBKIEGO PRZENOSZENIA ZADANIA (Zgodnie ze szkicem) ---
    const handleQuickMove = async (e: React.MouseEvent, direction: 'left' | 'right') => {
        e.stopPropagation(); // Ważne: Nie odpalamy kliknięcia na karcie!

        // 1. Znajdujemy obecną kolumnę
        const currentColumn = columns.find(c => c.id === item.columnId);
        if (!currentColumn) return;

        // 2. Znajdujemy jej indeks w posortowanej tablicy kolumn
        // (Zakładamy, że columns w store są już posortowane po 'order')
        const currentColumnIndex = columns.findIndex(c => c.id === currentColumn.id);
        if (currentColumnIndex === -1) return;

        // 3. Obliczamy ID docelowej kolumny
        let targetColumnId: number;
        if (direction === 'left') {
            if (currentColumnIndex === 0) return; // Jesteśmy w pierwszej kolumnie
            targetColumnId = columns[currentColumnIndex - 1].id;
        } else {
            if (currentColumnIndex === columns.length - 1) return; // Jesteśmy w ostatniej
            targetColumnId = columns[currentColumnIndex + 1].id;
        }

        // 4. Uruchamiamy moveItem (Używam Twojej logiki moveItem - targetRowId zostaje null)
        await moveItem(item.id, item.columnId, targetColumnId, item.rowId || null, index, 0); 
    };

    // --- LOGIKA GENEROWANIA INICJAŁÓW UŻYTKOWNIKA (Zgodnie ze szkicem: MK) ---
    const getUserInitials = (fullName?: string) => {
        if (!fullName || fullName.trim() === '') return '?';
        const parts = fullName.trim().split(/\s+/); // Rozbijamy po białych znakach
        if (parts.length === 1) return fullName.charAt(0).toUpperCase();
        
        // Bierzemy pierwszą literę imienia i pierwszą nazwiska
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    };

    return (
        <>
            <Draggable draggableId={`item-${item.id}`} index={index} isDragDisabled={showDetails}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-full p-4 pr-11 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group relative flex flex-col gap-1 cursor-grab ${
                            snapshot.isDragging ? 'shadow-xl ring-2 ring-purple-500 z-50 rotate-2' : ''
                        }`}
                        // Kliknięcie w dowolne miejsce karty otwiera szczegóły (?)
                        onClick={() => setShowDetails(true)} 
                    >
                        
                        {/* 1. TYTUŁ (Czysty, estetyczny - plik "MK" w rogu) */}
                        <div className="flex items-start justify-between gap-3">
                            <span className="font-bold text-gray-900 text-sm leading-snug break-words">
                                {item.title}
                            </span>
                            
                            {/* PRZYPISANY UŻYTKOWNIK (Avatar ze szkicu: "MK") */}
                            <div className="absolute top-2.5 right-2.5 flex items-center justify-center flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 shadow-inner"
                                 title={item.assignedTo?.fullName || 'Nieprzypisane'}>
                                {getUserInitials(item.assignedTo?.fullName)}
                            </div>
                        </div>

                        {/* 2. SUBTELNY PODGLĄD OPISU (Jeśli istnieje) */}
                        {item.content && (
                            <p className="text-xs text-gray-500 line-clamp-2 break-words leading-relaxed mt-1" title={item.content}>
                                {item.content}
                            </p>
                        )}

                        {/* 3. PASEK AKCJI (Zgodnie ze szkicem: <-  ?  ->) */}
                        <div className="flex justify-between items-center gap-2 mt-3.5 pt-2 border-t border-slate-100 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity">
                            
                            {/* Strzałka w LEWO (<-) */}
                            <button 
                                onClick={(e) => handleQuickMove(e, 'left')} 
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                title="Szybko przenieś w lewo"
                            >
                                <ArrowLeft size={16} />
                            </button>

                            {/* Szczegóły (?) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowDetails(true); }}
                                className="mx-auto text-xl font-medium text-gray-400 hover:text-purple-600 transition-colors"
                                title="Zobacz szczegóły zadania"
                            >
                                ?
                            </button>

                            {/* Strzałka w PRAWO (->) */}
                            <button 
                                onClick={(e) => handleQuickMove(e, 'right')} 
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                title="Szybko przenieś w prawo"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </Draggable>

            {/* MODAL SZCZEGÓŁÓW ZADANIA (?) */}
            {showDetails && (
                <TaskDetailsModal item={item} onClose={() => setShowDetails(false)} />
            )}
        </>
    );
};

export default Task;