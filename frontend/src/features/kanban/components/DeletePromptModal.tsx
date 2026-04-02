import React from 'react';
import { useKanbanStore } from '../../../store/useKanbanStore';

interface DeletePromptModalProps {
    prompt: { type: 'task' | 'column' | 'row', id: number, hasItems: boolean };
    onClose: () => void;
    targetMoveId: number | 'unlabeled';
    setTargetMoveId: (id: number | 'unlabeled') => void;
}

const DeletePromptModal: React.FC<DeletePromptModalProps> = ({ prompt, onClose, targetMoveId, setTargetMoveId }) => {
    const { columns = [], rows = [], removeColumn, removeRow } = useKanbanStore();

    const handleMoveAndDelete = () => {
        if (prompt.type === 'column') {
            if (targetMoveId === 'unlabeled') return alert("You must select another column to move the tasks to.");
            removeColumn(prompt.id, 'move_tasks', targetMoveId as number);
        } else { 
            removeRow(prompt.id, 'move_tasks', targetMoveId === 'unlabeled' ? null : targetMoveId); 
        }
        onClose();
    };

    const handleDeleteAll = () => {
        prompt.type === 'column' ? removeColumn(prompt.id, 'delete_tasks') : removeRow(prompt.id, 'delete_tasks');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-w-md w-full animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <h3 className="text-xl font-bold mb-6 text-center text-gray-900 leading-snug">
                        This {prompt.type} contains tasks. What do you want to do with them?
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Move tasks to:</label>
                            <select 
                                className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                                value={targetMoveId} onChange={(e) => setTargetMoveId(e.target.value === 'unlabeled' ? 'unlabeled' : parseInt(e.target.value))}
                            >
                                {prompt.type === 'column' 
                                    ? columns.filter(c => c.id !== prompt.id).map(c => <option key={c.id} value={c.id}>{c.title}</option>) 
                                    : <> <option value="unlabeled">Unlabeled zone</option> {rows.filter(r => r.id !== prompt.id).map(r => <option key={r.id} value={r.id}>{r.title}</option>)} </>
                                }
                            </select>
                            <button onClick={handleMoveAndDelete} className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
                                Move tasks & Delete {prompt.type}
                            </button>
                        </div>
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">or</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                        <button onClick={handleDeleteAll} className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-sm transition-colors border border-red-100 shadow-sm">
                            Delete all tasks permanently
                        </button>
                        <button onClick={onClose} className="py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors text-gray-600 shadow-sm">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeletePromptModal;