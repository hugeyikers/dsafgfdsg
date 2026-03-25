// frontend/src/features/kanban/components/TaskDetailsModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Edit2, Check, AlignLeft, CalendarCheck, CalendarClock, Trash2, Heading } from 'lucide-react';
import { useKanbanStore, KanbanItem } from '../../../store/useKanbanStore';
import { format } from 'date-fns';

interface TaskDetailsModalProps {
  item: KanbanItem;
  onClose: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ item, onClose }) => {
  const { updateItem, removeItem } = useKanbanStore();
  
  // Stany edycji
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);
  
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [tempContent, setTempContent] = useState(item.content || '');
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingContent && contentAreaRef.current) {
        contentAreaRef.current.style.height = 'auto';
        contentAreaRef.current.style.height = `${contentAreaRef.current.scrollHeight}px`;
        contentAreaRef.current.focus();
    }
  }, [isEditingContent, tempContent]);

  const handleSaveTitle = async () => {
    const finalTitle = tempTitle.trim();
    if (finalTitle && finalTitle !== item.title) {
      await updateItem(item.id, { title: finalTitle });
    } else if (!finalTitle) {
      setTempTitle(item.title);
    }
    setIsEditingTitle(false);
  };

  const handleSaveContent = async () => {
    if (tempContent !== (item.content || '')) {
      await updateItem(item.id, { content: tempContent });
    }
    setIsEditingContent(false);
  };

  const handleDelete = () => {
    if (window.confirm('Usunąć zadanie permanentnie?')) {
        removeItem(item.id);
        onClose();
    }
  };

  // Helper do formatowania dat
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';
    try {
        return format(new Date(dateString), 'dd.MM.yyyy HH:mm');
    } catch {
        return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Tło klikalne do zamknięcia */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* PANEL (Estetyczny pastelowy fiolet) */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Nagłówek Modalny */}
        <header className="flex items-center justify-between p-6 pb-5 bg-purple-50 border-b border-purple-100 rounded-t-3xl">
          <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                  <Heading size={20}/>
              </span>
              <h3 className="text-xl font-bold text-gray-950">Szczegóły zadania</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </header>

        {/* TREŚĆ */}
        <div className="p-8 flex flex-col gap-9 bg-white">
          
          {/* 1. TYTUŁ (Zgodnie ze szkicem: Edytowalny) */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-500 tracking-wider uppercase">Tytuł Zadania</span>
                {!isEditingTitle && (
                    <button onClick={() => setIsEditingTitle(true)} className="p-1 text-gray-400 hover:text-purple-600 transition-colors">
                        <Edit2 size={14} />
                    </button>
                )}
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
                <input 
                  ref={titleInputRef}
                  value={tempTitle}
                  onChange={e => setTempTitle(e.target.value)}
                  className="flex-1 text-base font-bold text-gray-900 px-3 py-2 border-2 border-purple-300 rounded-lg outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Wpisz tytuł zadania..."
                  onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                />
                <button onClick={handleSaveTitle} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"><Check size={18}/></button>
                <button onClick={() => { setTempTitle(item.title); setIsEditingTitle(false); }} className="p-2 text-red-500 bg-gray-50 rounded-lg hover:bg-red-100 transition-colors"><X size={18}/></button>
              </div>
            ) : (
              <p className="text-base font-bold text-gray-900 break-words leading-relaxed pl-1">
                {item.title}
              </p>
            )}
          </section>

          {/* 2. OPIS (Description, edytowalny) */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                    <AlignLeft size={16} className="text-gray-400" />
                    <span className="font-semibold text-sm text-gray-500 tracking-wider uppercase">Dokładny Opis</span>
                </div>
                {!isEditingContent && (
                    <button onClick={() => setIsEditingContent(true)} className="p-1.5 text-gray-400 hover:text-purple-600 rounded hover:bg-gray-100 transition-colors">
                        <Edit2 size={14} />
                    </button>
                )}
            </div>

            {isEditingContent ? (
                <div className="flex flex-col gap-3 w-full animate-in fade-in duration-150">
                    <textarea 
                        ref={contentAreaRef}
                        value={tempContent}
                        onChange={e => setTempContent(e.target.value)}
                        className="w-full text-sm text-gray-700 p-4 border border-slate-200 rounded-2xl outline-none resize-none min-h-[140px] focus:border-purple-300 focus:ring-purple-200"
                        placeholder="Dodaj tutaj dokładny opis zadania..."
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { setTempContent(item.content || ''); setIsEditingContent(false); }} className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Anuluj</button>
                        <button onClick={handleSaveContent} className="px-5 py-1.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">Zapisz opis</button>
                    </div>
                </div>
            ) : (
                <p className={`text-sm text-gray-700 break-words leading-relaxed pl-1 ${!item.content ? 'italic text-gray-400' : ''}`}>
                    {item.content || 'To zadanie nie posiada jeszcze dokładnego opisu...'}
                </p>
            )}
          </section>

          {/* 3. DATY I METADANE */}
          <section className="flex flex-col sm:flex-row gap-5 pt-6 border-t border-gray-100 text-gray-500 text-xs">
              <div className="flex items-center gap-2">
                  <CalendarClock size={15} />
                  <span>Utworzono: <strong>{formatDate(item.createdAt)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                  <CalendarCheck size={15} />
                  <span>Ostatnia modyfikacja: <strong>{formatDate(item.updatedAt)}</strong></span>
              </div>
          </section>
        </div>

        {/* STOPKA */}
        <footer className="p-6 pb-7 flex justify-end gap-3 bg-white border-t border-gray-100">
            <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
            >
                <Trash2 size={16}/> Usunąć?
            </button>
            <button 
                onClick={onClose}
                className="px-6 py-2 text-sm font-bold text-gray-900 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-100"
            >
                Zamknij
            </button>
        </footer>

      </div>
    </div>
  );
};

export default TaskDetailsModal;