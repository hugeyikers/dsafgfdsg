<<<<<<< HEAD
import React, { useState } from 'react';
import { Plus, Trash2, X, Save, LayoutPanelLeft, PanelLeftClose, AlertTriangle } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { useKanbanStore } from '../../../store/useKanbanStore';

type PanelType = 'task' | 'column' | 'row';
type PanelMode = 'view' | 'add' | 'delete' | 'clear'; 
=======
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, LayoutPanelLeft, AlertTriangle } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { useKanbanStore } from '../../../store/useKanbanStore';

export type PanelType = 'task' | 'column' | 'row';
export type PanelMode = 'view' | 'add'; 
>>>>>>> f62be26 (update UI i funkcjonalnosci)

export interface PanelState {
    isOpen: boolean;
    type: PanelType;
    mode: PanelMode;
    item: any;
    extra?: any;
}

export interface EditSidebarProps {
    panel: PanelState;
    setPanel: React.Dispatch<React.SetStateAction<PanelState>>;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    activeField: string | null;
    editValue: any;
    setEditValue: React.Dispatch<React.SetStateAction<any>>;
    startEdit: (field: string, value: any) => void;
    cancelEdit: () => void;
    saveEdit: (forcedValue?: any) => Promise<void>;
    handleKeyDownTitle: (e: React.KeyboardEvent) => void;
    handleKeyDownDefault: (e: React.KeyboardEvent) => void;
    handlePanelSaveGlobal: () => Promise<void>;
<<<<<<< HEAD
    confirmPanelDelete: (targetMoveId?: number | 'unlabeled' | 'delete') => void;
    confirmClearTasks: () => Promise<void>;
    dispatchHover: (e: React.MouseEvent | null, title: string | null, subtitle?: string) => void;
=======
    handleClearTasks: () => void;
    dispatchHover: (title: string | null, subtitle?: string) => void;
    onAssigneeDrop: (userId: number) => void;
    isDeleting: boolean;
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    isClearing: boolean;
    setIsClearing: React.Dispatch<React.SetStateAction<boolean>>;
>>>>>>> f62be26 (update UI i funkcjonalnosci)
    SIDEBAR_WIDTH: number;
    SIDEBAR_LEFT_PADDING: number;
    SIDEBAR_RIGHT_PADDING: number;
    DETAILS_FIELD_RADIUS: string;
    FOOTER_HEIGHT: number;
}

const EditSidebar: React.FC<EditSidebarProps> = ({
    panel, setPanel, formData, setFormData, activeField, editValue, setEditValue, 
    startEdit, cancelEdit, saveEdit, handleKeyDownTitle, handleKeyDownDefault,
<<<<<<< HEAD
    handlePanelSaveGlobal, confirmPanelDelete, confirmClearTasks, dispatchHover,
=======
    handlePanelSaveGlobal, handleClearTasks, dispatchHover,
    onAssigneeDrop, isDeleting, setIsDeleting, isClearing, setIsClearing,
>>>>>>> f62be26 (update UI i funkcjonalnosci)
    SIDEBAR_WIDTH, SIDEBAR_LEFT_PADDING, SIDEBAR_RIGHT_PADDING, DETAILS_FIELD_RADIUS,
    FOOTER_HEIGHT
}) => {
    const { users = [] } = useUserStore();
<<<<<<< HEAD
    const { columns = [], rows = [] } = useKanbanStore();
    
=======
    const { columns = [], rows = [], removeColumn, removeRow, removeItem } = useKanbanStore();
    
    const [targetMoveId, setTargetMoveId] = useState<number | 'unlabeled'>('unlabeled');
    const [deleteAction, setDeleteAction] = useState<'move' | 'delete'>('move');
    const [isWipWarning, setIsWipWarning] = useState(false);

>>>>>>> f62be26 (update UI i funkcjonalnosci)
    const isBacklogPanel = panel.type === 'column' && panel.item?.title === 'Backlog';
    const isUnlabeledPanel = panel.type === 'row' && panel.item?.id === 'unlabeled';
    const isProtected = isBacklogPanel || isUnlabeledPanel;

<<<<<<< HEAD
    const closeBtnMouseDown = React.useRef(false);
    const [moveTargetId, setMoveTargetId] = React.useState<number | 'unlabeled' | 'delete'>('delete');
    const [isClearing, setIsClearing] = useState(false);

    const hasItems = () => {
        if (panel.type === 'task' || !panel.item) return false;
        if (panel.type === 'column') return columns.find(c => c.id === panel.item.id)?.items.length > 0;
        if (panel.type === 'row') {
            const rowId = panel.item.id === 'unlabeled' ? null : panel.item.id;
            return columns.some(c => c.items.some(i => i.rowId === rowId));
        }
        return false;
    };

    const handleClearWrapper = async () => {
        setIsClearing(true);
        await confirmClearTasks();
        setIsClearing(false);
    };

    const renderConfirmationBody = () => {
        const itemsExist = hasItems();
        
        if (panel.mode === 'clear') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4 mt-10">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
                        <Trash2 size={40} className={`text-orange-500 ${isClearing ? 'animate-pulse' : ''}`} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">Clear Tasks?</h2>
                    <p className="text-sm text-gray-500 leading-relaxed px-4">
                        Are you sure you want to permanently delete all tasks inside this {panel.type}? This action cannot be undone.
                    </p>
                </div>
            );
        }

        if (panel.mode === 'delete') {
            return (
                <div className="flex-1 flex flex-col items-center justify-start p-6 text-center gap-4 mt-10">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
                        <AlertTriangle size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">Are you sure?</h2>
                    
                    {!itemsExist || panel.type === 'task' ? (
                        <p className="text-sm text-gray-500 leading-relaxed px-4">
                            You are about to permanently delete this {panel.type}. This action cannot be undone.
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 leading-relaxed px-2 mb-2">
                                This {panel.type} contains tasks. What would you like to do with them?
                            </p>
                            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Action for existing tasks</label>
                                <select 
                                    className="w-full text-sm font-bold p-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
                                    value={moveTargetId} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setMoveTargetId(val === 'delete' || val === 'unlabeled' ? val : parseInt(val));
                                    }}
                                >
                                    <option value="delete">🗑️ Delete tasks permanently</option>
                                    {panel.type === 'column' && columns.filter(c => c.id !== panel.item.id).map(c => (
                                        <option key={c.id} value={c.id}>Move to: {c.title}</option>
                                    ))}
                                    {panel.type === 'row' && (
                                        <>
                                            <option value="unlabeled">Move to: Unlabeled zone</option>
                                            {rows.filter(r => r.id !== panel.item.id).map(r => (
                                                <option key={r.id} value={r.id}>Move to: {r.title}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return null;
=======
    const [isAssigneeDragOver, setIsAssigneeDragOver] = useState(false);
    const handleAssigneeDragOver = (e: React.DragEvent) => { e.preventDefault(); };
    const handleAssigneeDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsAssigneeDragOver(true); };
    const handleAssigneeDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsAssigneeDragOver(false); };
    const handleAssigneeDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsAssigneeDragOver(false);
        const userIdStr = e.dataTransfer.getData('text/plain');
        if (!userIdStr) return;
        const userId = parseInt(userIdStr, 10);
        if (!isNaN(userId)) onAssigneeDrop(userId);
>>>>>>> f62be26 (update UI i funkcjonalnosci)
    };

    useEffect(() => {
        if (!panel.isOpen) setIsWipWarning(false);
    }, [panel.isOpen]);

    useEffect(() => {
        if (isDeleting && panel.type === 'column' && panel.item) {
            const availableCols = columns.filter(c => c.id !== panel.item.id);
            setTargetMoveId(availableCols.length > 0 ? availableCols[0].id : 'unlabeled');
        } else if (isDeleting) {
            setTargetMoveId('unlabeled');
        }
    }, [isDeleting, panel.item, panel.type, columns]);

    const hasItems = panel.type === 'column' 
        ? (columns.find(c => c.id === panel.item?.id)?.items.length ?? 0) > 0
        : panel.type === 'row'
            ? columns.some(c => c.items.some(i => i.rowId === panel.item?.id))
            : false;

    const handleAddClick = () => {
        if (panel.type === 'task' && panel.mode === 'add') {
            const targetCol = columns.find(c => c.id === panel.extra?.colId);
            if (targetCol && targetCol.limit > 0 && targetCol.items.length >= targetCol.limit && !isWipWarning) {
                setIsWipWarning(true);
                return;
            }
        }
        handlePanelSaveGlobal();
    };

    const confirmDelete = () => {
        if (!panel.item) return;

        if (panel.type === 'task') {
            removeItem(panel.item.id);
        } else if (panel.type === 'column') {
            if (hasItems && deleteAction === 'move') {
                if (targetMoveId === 'unlabeled') {
                    alert("You must select another column to move the tasks to.");
                    return;
                }
                removeColumn(panel.item.id, 'move_tasks', targetMoveId as number);
            } else {
                removeColumn(panel.item.id, hasItems ? 'delete_tasks' : undefined);
            }
        } else if (panel.type === 'row') {
            if (hasItems && deleteAction === 'move') {
                removeRow(panel.item.id, 'move_tasks', targetMoveId === 'unlabeled' ? null : targetMoveId);
            } else {
                removeRow(panel.item.id, hasItems ? 'delete_tasks' : undefined);
            }
        }
        
        setPanel(prev => ({...prev, isOpen: false}));
        setIsDeleting(false);
    };

    return (
        <aside 
            style={{ width: panel.isOpen ? `${SIDEBAR_WIDTH}px` : '0px' }}
<<<<<<< HEAD
            className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.05)] ${!panel.isOpen ? 'border-r-0' : ''}`}
=======
            className={`flex flex-col bg-white border-gray-200 transition-all duration-300 ease-in-out z-40 overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.15)] flex-shrink-0 h-full ${panel.isOpen ? 'border-r' : ''}`}
>>>>>>> f62be26 (update UI i funkcjonalnosci)
        >
            <div style={{ width: `${SIDEBAR_WIDTH}px` }} className="flex flex-col h-full bg-gray-50/30">
                <div 
                    style={{ paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px`, height: 60, background: '#d9d9d9' }}
                    className="flex font-black items-center justify-between py-6 border-b border-gray-100 flex-shrink-0"
                >
                    <h3 className="text-lg text-gray-900 uppercase tracking-widest flex items-center gap-2">
<<<<<<< HEAD
                        {panel.mode === 'delete' ? (
                            <><AlertTriangle className="text-red-500" size={20}/> Delete {panel.type}</>
                        ) : panel.mode === 'clear' ? (
                            <><Trash2 className="text-orange-500" size={20}/> Clear {panel.type}</>
=======
                        {isDeleting ? (
                            <><Trash2 className="text-red-500" size={20}/> Delete {panel.type}</>
                        ) : isClearing ? (
                            <><Trash2 className="text-red-500" size={20}/> Clear Tasks</>
                        ) : isWipWarning ? (
                            <><AlertTriangle className="text-yellow-500" size={20}/> Limit Exceeded</>
>>>>>>> f62be26 (update UI i funkcjonalnosci)
                        ) : (
                            <><LayoutPanelLeft className="text-purple-500" size={20}/> {panel.mode === 'add' ? 'Add' : 'Details'} {panel.type}</>
                        )}
                    </h3>
                    <button 
                        onClick={() => {
                            setPanel(prev => ({...prev, isOpen: false}));
                            setIsDeleting(false);
                            setIsClearing(false);
                            setIsWipWarning(false);
                        }} 
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X size={25}/>
                    </button>
                </div>

<<<<<<< HEAD
                {panel.mode === 'delete' || panel.mode === 'clear' ? (
                    renderConfirmationBody()
                ) : (
                    <div 
                        style={{ paddingTop: `20px`, paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px` }}
                        className="flex-1 overflow-y-auto pb-6 flex flex-col gap-6"
                    >
                        <div>
                            <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'title' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Title</label>
                            {isProtected ? (
                                <div 
                                    className="text-xs font-medium text-gray-400 italic bg-gray-100 border border-gray-200 flex items-center" 
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', height: '56px' }}
                                >
                                    Title is locked for this element.
                                </div>
                            ) : panel.mode === 'add' ? (
                                <input 
                                    className="w-full text-base font-bold border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm"
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder={`Enter ${panel.type} title...`} autoFocus
                                />
                            ) : activeField === 'title' ? (
                                <div className="relative">
                                    <input 
                                        autoFocus
                                        className="w-full text-base font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                        value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownTitle}
                                    />
                                    <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Enter</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                </div>
                            ) : (
                                <div 
                                    className="group relative flex items-center border-2 border-transparent hover:border-purple-200 bg-transparent hover:bg-white transition-colors cursor-pointer"
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                    onDoubleClick={() => startEdit('title', panel.item.title)}
                                    onMouseEnter={(e) => dispatchHover(e, 'Task Title', 'Double click to edit title')}
                                    onMouseLeave={(e) => dispatchHover(e, null)}
                                >
                                    <h2 className="text-base font-bold text-gray-900 leading-tight break-words">{panel.item?.title || `Untitled ${panel.type}`}</h2>
                                    <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                        <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- ASSIGNEE (Czyste pole bez drag and dropa) --- */}
                        {panel.type === 'task' && (
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'assignedToId' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Assignee</label>
                                {panel.mode === 'add' ? (
                                    <select
                                        className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm appearance-none cursor-pointer"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }}
                                        value={formData.assignedToId || ''} onChange={(e) => setFormData({...formData, assignedToId: e.target.value ? parseInt(e.target.value) : null})}
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                                    </select>
                                ) : activeField === 'assignedToId' ? (
                                    <div className="relative">
                                        <select
                                            ref={(el) => {
                                                if (el && !el.dataset.opened) {
                                                    el.dataset.opened = 'true';
                                                    el.focus();
                                                    try { el.showPicker(); } catch (e) {} 
                                                }
                                            }}
                                            className="w-full text-sm font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm appearance-none cursor-pointer"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }}
                                            value={editValue || ''} onChange={(e) => setEditValue(e.target.value ? parseInt(e.target.value) : null)} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                                        </select>
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Select and click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Save</kbd> or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className={`group relative flex items-center gap-3 bg-white border-2 hover:border-purple-200 shadow-sm cursor-pointer transition-colors border-gray-100`}
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }}
                                        onDoubleClick={() => startEdit('assignedToId', panel.item.assignedToId)}
                                        onMouseEnter={(e) => dispatchHover(e, 'Assignee', 'Double click to reassign task')}
                                        onMouseLeave={(e) => dispatchHover(e, null)}
                                    >
                                        {panel.item?.assignedTo ? (
                                            <>
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-indigo-100 flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
                                                    {panel.item.assignedTo?.fullName?.substring(0,2).toUpperCase() || '?'}
                                                </div>
                                                <span className="text-sm text-gray-800 font-bold truncate">{panel.item.assignedTo.fullName}</span>
                                            </>
                                        ) : (
                                            <span className="italic text-gray-400 text-xs pl-1">Unassigned</span>
                                        )}
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {panel.type === 'task' && (
                            <div className="flex-1 flex flex-col min-h-[150px]">
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'content' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Description</label>
                                {panel.mode === 'add' ? (
                                    <textarea 
                                        className="w-full flex-1 text-sm py-4 border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all resize-none shadow-sm"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px' }} 
                                        value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Add details, steps, notes..."
                                    />
                                ) : activeField === 'content' ? (
                                    <div className="flex-1 flex flex-col">
                                        <textarea 
                                            autoFocus
                                            className="w-full flex-1 text-sm py-4 border-2 border-purple-400 bg-purple-50 focus:outline-none transition-all resize-none shadow-sm"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px' }} 
                                            value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                        />
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Ctrl + Enter</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative bg-white py-4 border-2 border-gray-100 hover:border-purple-200 flex-1 shadow-sm overflow-y-auto cursor-pointer transition-colors"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px' }}
                                        onDoubleClick={() => startEdit('content', panel.item.content === 'none' ? '' : panel.item.content)}
                                        onMouseEnter={(e) => dispatchHover(e, 'Task Description', 'Double click to edit details')}
                                        onMouseLeave={(e) => dispatchHover(e, null)}
                                    >
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {panel.item?.content && panel.item.content !== 'none' ? panel.item.content : <span className="italic text-gray-400">No description provided.</span>}
                                        </p>
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {panel.type === 'column' && !isBacklogPanel && (
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'limit' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>WIP Limit</label>
                                {panel.mode === 'add' ? (
                                    <select
                                        className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none shadow-sm cursor-pointer"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} 
                                        value={formData.limit || 0} onChange={(e) => setFormData({...formData, limit: parseInt(e.target.value)})}
                                    >
                                        <option value={0}>None (No limit)</option>
                                        {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                    </select>
                                ) : activeField === 'limit' ? (
                                    <div className="relative">
                                        <select
                                            ref={(el) => {
                                                if (el && !el.dataset.opened) {
                                                    el.dataset.opened = 'true';
                                                    el.focus();
                                                    try { el.showPicker(); } catch (e) {} 
                                                }
                                            }}
                                            className="w-full text-sm font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm cursor-pointer"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} 
                                            value={editValue} onChange={(e) => setEditValue(parseInt(e.target.value))} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                        >
                                            <option value={0}>None (No limit)</option>
                                            {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                    </select>
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Select and click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Save</kbd> or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative flex items-center bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                        onDoubleClick={() => startEdit('limit', panel.item.limit)}
                                        onMouseEnter={(e) => dispatchHover(e, 'WIP Limit', 'Double click to edit maximum allowed tasks')}
                                        onMouseLeave={(e) => dispatchHover(e, null)}
                                    >
                                        <span className="text-sm font-bold text-gray-800">{panel.item.limit === 0 ? 'None (No limit)' : panel.item.limit}</span>
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
=======
                <div 
                    style={{ paddingTop: `20px`, paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px` }}
                    className="flex-1 overflow-y-auto pb-6 flex flex-col gap-6"
                >
                    {isDeleting ? (
                        <>
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 text-red-800 text-sm">
                                <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <span className="font-bold block mb-1">Danger Zone!</span>
                                    {panel.type === 'task' ? (
                                        <span>Are you sure you want to permanently delete this task? This action is irreversible.</span>
                                    ) : hasItems ? (
                                        <span>This {panel.type} contains tasks. What do you want to do with them before deleting?</span>
                                    ) : (
                                        <span>Are you sure you want to permanently delete this {panel.type}? This action is irreversible.</span>
                                    )}
                                </div>
                            </div>

                            {panel.type !== 'task' && hasItems && (
                                <div className="flex flex-col gap-4 mt-2">
                                    <label className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-xl transition-colors ${deleteAction === 'move' ? 'border-purple-400 bg-purple-50/50' : 'border-gray-100 hover:border-purple-200'}`}>
                                        <input type="radio" checked={deleteAction === 'move'} onChange={() => setDeleteAction('move')} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                                        <span className="text-sm font-bold text-gray-800">Move tasks to another {panel.type}</span>
                                    </label>
                                    
                                    {deleteAction === 'move' && (
                                        <div className="pl-11 pr-2 -mt-2 mb-2">
                                            <select
                                                className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none focus:border-purple-500 rounded-xl px-4 py-3 shadow-sm cursor-pointer"
                                                value={targetMoveId}
                                                onChange={(e) => setTargetMoveId(e.target.value === 'unlabeled' ? 'unlabeled' : parseInt(e.target.value))}
                                            >
                                                {panel.type === 'column' 
                                                    ? columns.filter(c => c.id !== panel.item.id).map(c => <option key={c.id} value={c.id}>{c.title}</option>) 
                                                    : <> <option value="unlabeled">Unlabeled zone</option> {rows.filter(r => r.id !== panel.item.id).map(r => <option key={r.id} value={r.id}>{r.title}</option>)} </>
                                                }
                                            </select>
                                        </div>
                                    )}

                                    <label className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-xl transition-colors ${deleteAction === 'delete' ? 'border-red-400 bg-red-50' : 'border-red-50 hover:border-red-200 bg-red-50/30'}`}>
                                        <input type="radio" checked={deleteAction === 'delete'} onChange={() => setDeleteAction('delete')} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                                        <span className="text-sm font-bold text-red-600">Delete all tasks permanently</span>
                                    </label>
                                </div>
                            )}
                        </>
                    ) : isClearing ? (
                        <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 flex gap-4 text-red-800 text-base mt-2">
                            <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                            <div>
                                <span className="font-black block mb-2 text-lg">Danger Zone!</span>
                                <span>Are you sure you want to permanently delete all tasks in this {isBacklogPanel ? 'Backlog' : panel.type}? This action is irreversible.</span>
                            </div>
                        </div>
                    ) : isWipWarning ? (
                        <div className="p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-100 flex gap-4 text-yellow-800 text-base mt-2">
                            <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                            <div>
                                <span className="font-black block mb-2 text-lg">WIP Limit Warning!</span>
                                <span>Adding a new task will exceed the column's Work-In-Progress limit. Are you sure you want to proceed?</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'title' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Title</label>
                                {panel.mode === 'add' ? (
                                    <input 
                                        className="w-full text-base font-bold border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                        value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder={`Enter ${panel.type} title...`} autoFocus
                                    />
                                ) : activeField === 'title' ? (
                                    <div className="relative">
                                        <input 
                                            autoFocus
                                            className="w-full text-base font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                            value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownTitle}
                                        />
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Enter</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative flex items-center border-2 border-transparent hover:border-purple-200 bg-transparent hover:bg-white transition-colors cursor-pointer"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                        onDoubleClick={() => startEdit('title', panel.item.title)}
                                        onMouseEnter={() => dispatchHover('Task Title', 'Double click to edit title')}
                                        onMouseLeave={() => dispatchHover(null)}
                                    >
                                        <h2 className="text-base font-bold text-gray-900 leading-tight break-words">{panel.item?.title || `Untitled ${panel.type}`}</h2>
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span>
>>>>>>> f62be26 (update UI i funkcjonalnosci)
                                        </div>
                                    </div>
                                )}
                            </div>
<<<<<<< HEAD
                        )}

                        <div>
                            <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'color' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Color</label>
                            {isProtected ? (
                                <div 
                                    className="text-xs font-medium text-gray-400 italic bg-gray-100 border border-gray-200 flex items-center" 
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', height: '56px' }}
                                >
                                    Color is locked for this element.
                                </div>
                            ) : panel.mode === 'add' ? (
                                <div 
                                    className="flex gap-3 flex-wrap items-center bg-white border-2 border-gray-200 shadow-sm" 
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}
                                >
                                    {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                        <button 
                                            key={color} onClick={() => setFormData({...formData, color})}
                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${formData.color === color ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            ) : activeField === 'color' ? (
                                <div tabIndex={0} ref={el => el?.focus()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit(); }} onKeyDown={handleKeyDownDefault} className="outline-none">
                                    <div 
                                        className="flex gap-3 flex-wrap items-center bg-purple-50 shadow-sm" 
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}
                                    >
                                        {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(c => (
                                            <button 
                                                key={c} 
                                                onMouseDown={(e) => e.preventDefault()} 
                                                onClick={() => setEditValue(c)} 
                                                onDoubleClick={(e) => { e.preventDefault(); setEditValue(c); setTimeout(() => saveEdit(c), 0); }} 
                                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${editValue === c ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-transparent'}`} 
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click to preview, <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Double click</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                </div>
                            ) : (
                                <div 
                                    className="group relative flex items-center gap-3 bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors"
                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                    onDoubleClick={() => startEdit('color', panel.item.color)}
                                    onMouseEnter={(e) => dispatchHover(e, 'Label Color', 'Double click to change element color')}
                                    onMouseLeave={(e) => dispatchHover(e, null)}
                                >
                                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner flex-shrink-0" style={{ backgroundColor: panel.item?.color || '#ffffff' }} />
                                    <span className="text-sm font-bold text-gray-800">Card Color</span>
                                    <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                        <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {panel.mode === 'view' && panel.item?.createdAt && (
                            <div className="border-t border-gray-200 space-y-3" style={{ marginTop: 'auto', paddingTop: '20px', marginBottom: '10px' }}>
                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span className="uppercase font-bold tracking-wider">Created</span>
                                    <span className="font-semibold">{new Date(panel.item.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span className="uppercase font-bold tracking-wider">Last modified</span>
                                    <span className="font-semibold">{new Date(panel.item.updatedAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ height: `${FOOTER_HEIGHT}px` }} className="flex border-t border-gray-200 bg-white flex-shrink-0 w-full">
                    {panel.mode === 'add' ? (
                        <>
                            <button key="btn-cancel" onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="flex-[2] h-full flex items-center justify-center bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors border-r border-gray-200">
                                Cancel
                            </button>
                            <button key="btn-add" onClick={handlePanelSaveGlobal} className="flex-1 h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                                <Plus size={18} className="mr-2"/> Add
                            </button>
                        </>
                    ) : activeField ? (
                        <>
                            <button key="btn-discard" onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }} className="flex-[2] h-full flex items-center justify-center bg-red-50 text-red-600 border-r border-gray-200 text-xs font-bold hover:bg-red-100 transition-colors">
                                Discard
                            </button>
                            <button key="btn-save" onMouseDown={(e) => { e.preventDefault(); saveEdit(); }} className="flex-1 h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                                <Save size={18} className="mr-2"/> Save
                            </button>
                        </>
                    ) : panel.mode === 'delete' || panel.mode === 'clear' ? (
                        <>
                            <button key="btn-dismiss-confirm" onClick={() => setPanel(prev => ({...prev, mode: 'view'}))} className="flex-1 h-full flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors border-r border-gray-300">
                                Dismiss
                            </button>
                            <button 
                                key="btn-apply-confirm" 
                                disabled={isClearing}
                                onClick={() => panel.mode === 'delete' ? confirmPanelDelete(moveTargetId) : handleClearWrapper()} 
                                className={`flex-[2] h-full flex items-center justify-center text-white text-xs font-bold transition-colors ${panel.mode === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'} ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Save size={16} className="mr-2"/> {isClearing ? 'Clearing...' : 'Save & Apply'}
                            </button>
                        </>
                    ) : (
                        <>
                            {panel.type === 'task' ? (
                                <button key="btn-delete-task" onClick={() => setPanel(prev => ({...prev, mode: 'delete'}))} className="flex-[2] h-full flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors border-r border-gray-200" title={`Delete Task`}>
                                    <Trash2 size={20} className="mr-2"/> Delete Task
                                </button>
                            ) : isProtected ? (
                                <button key="btn-clear-protected" onClick={() => setPanel(prev => ({...prev, mode: 'clear'}))} className="flex-[2] h-full flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 text-xs font-bold transition-colors border-r border-gray-200">
                                    <Trash2 size={16} className="mr-2"/> Clear Tasks
                                </button>
                            ) : (
                                <>
                                    <button key="btn-delete" onClick={() => setPanel(prev => ({...prev, mode: 'delete'}))} className="flex-1 h-full flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors border-r border-gray-200" title={`Delete ${panel.type}`}>
                                        <Trash2 size={20}/>
                                    </button>
                                    <button key="btn-clear" onClick={() => setPanel(prev => ({...prev, mode: 'clear'}))} className="flex-1 h-full flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors border-r border-gray-200 text-[11px] font-bold leading-tight px-2 text-center" title={`Clear all tasks in ${panel.type}`}>
                                        Clear<br/>Tasks
                                    </button>
                                </>
                            )}
                            <button 
                                key="btn-close"
                                onMouseDown={() => { closeBtnMouseDown.current = true; }}
                                onMouseLeave={() => { closeBtnMouseDown.current = false; }}
                                onClick={() => { 
                                    if (closeBtnMouseDown.current) {
                                        setPanel(prev => ({...prev, isOpen: false})); 
                                    }
                                    closeBtnMouseDown.current = false;
                                }}
                                className="flex-1 h-full flex items-center justify-center bg-gray-900 text-white hover:bg-black transition-colors"
                                title="Close Details"
                            >
                                <PanelLeftClose size={22} />
                            </button>
=======

                            {panel.type === 'task' && (
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'assignedToId' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Assignee</label>
                                    {panel.mode === 'add' ? (
                                        <select
                                            className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm appearance-none cursor-pointer"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }}
                                            value={formData.assignedToId || ''} onChange={(e) => setFormData({...formData, assignedToId: e.target.value ? parseInt(e.target.value) : null})}
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                                        </select>
                                    ) : activeField === 'assignedToId' ? (
                                        <div className="relative">
                                            <select
                                                ref={(el) => {
                                                    if (el && !el.dataset.opened) {
                                                        el.dataset.opened = 'true';
                                                        el.focus();
                                                        try { el.showPicker(); } catch (e) {} 
                                                    }
                                                }}
                                                className="w-full text-sm font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm appearance-none cursor-pointer"
                                                style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }}
                                                value={editValue || ''} onChange={(e) => setEditValue(e.target.value ? parseInt(e.target.value) : null)} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                                            </select>
                                            <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Select and click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Save</kbd> or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div 
                                            className={`group relative flex items-center gap-3 bg-white border-2 hover:border-purple-200 shadow-sm cursor-pointer transition-colors
                                                ${isAssigneeDragOver ? 'ring-4 ring-blue-500 bg-blue-50 border-blue-500' : 'border-gray-100'}
                                            `}
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }}
                                            onDoubleClick={() => startEdit('assignedToId', panel.item.assignedToId)}
                                            onMouseEnter={() => dispatchHover('Assignee', 'Double click to reassign task or drop user here')}
                                            onMouseLeave={() => dispatchHover(null)}
                                            onDragOver={handleAssigneeDragOver}
                                            onDragEnter={handleAssigneeDragEnter}
                                            onDragLeave={handleAssigneeDragLeave}
                                            onDrop={handleAssigneeDrop}
                                        >
                                            {panel.item?.assignedTo ? (
                                                <>
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-indigo-100 flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
                                                        {panel.item.assignedTo?.fullName?.substring(0,2).toUpperCase() || '?'}
                                                    </div>
                                                    <span className="text-sm text-gray-800 font-bold truncate">{panel.item.assignedTo.fullName}</span>
                                                </>
                                            ) : (
                                                <span className="italic text-gray-400 text-xs pl-1 select-none">Unassigned</span>
                                            )}
                                            <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {panel.type === 'task' && (
                                <div className="flex-1 flex flex-col min-h-[150px]">
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'content' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Description</label>
                                    {panel.mode === 'add' ? (
                                        <textarea 
                                            className="w-full flex-1 text-sm py-4 border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all resize-none shadow-sm"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '10px', paddingRight: '14px', paddingTop: '7px' }}
                                            value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Add details, steps, notes..."
                                        />
                                    ) : activeField === 'content' ? (
                                        <div className="flex-1 flex flex-col">
                                            <textarea 
                                                autoFocus
                                                className="w-full flex-1 text-sm py-4 border-2 border-purple-400 bg-purple-50 focus:outline-none transition-all resize-none shadow-sm"
                                                style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '10px', paddingRight: '14px', paddingTop: '7px' }}
                                                value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                            />
                                            <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Ctrl + Enter</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="group relative bg-white py-4 border-2 border-gray-100 hover:border-purple-200 flex-1 shadow-sm overflow-y-auto cursor-pointer transition-colors"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '10px', paddingRight: '14px', paddingTop: '7px' }}
                                            onDoubleClick={() => startEdit('content', panel.item.content === 'none' ? '' : panel.item.content)}
                                            onMouseEnter={() => dispatchHover('Task Description', 'Double click to edit details')}
                                            onMouseLeave={() => dispatchHover(null)}
                                        >
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed select-none">
                                                {panel.item?.content && panel.item.content !== 'none' ? panel.item.content : <span className="italic text-gray-400">No description provided.</span>}
                                            </p>
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {panel.type === 'column' && !isBacklogPanel && (
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'limit' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>WIP Limit</label>
                                    {panel.mode === 'add' ? (
                                        <select
                                            className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none shadow-sm cursor-pointer"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} 
                                            value={formData.limit || 0} onChange={(e) => setFormData({...formData, limit: parseInt(e.target.value)})}
                                        >
                                            <option value={0}>None (No limit)</option>
                                            {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                        </select>
                                    ) : activeField === 'limit' ? (
                                        <div className="relative">
                                            <select
                                                ref={(el) => {
                                                    if (el && !el.dataset.opened) {
                                                        el.dataset.opened = 'true';
                                                        el.focus();
                                                        try { el.showPicker(); } catch (e) {} 
                                                    }
                                                }}
                                                className="w-full text-sm font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm cursor-pointer"
                                                style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} 
                                                value={editValue} onChange={(e) => setEditValue(parseInt(e.target.value))} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                            >
                                                <option value={0}>None (No limit)</option>
                                                {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                            </select>
                                            <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Select and click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Save</kbd> or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="group relative flex items-center bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                            onDoubleClick={() => startEdit('limit', panel.item.limit)}
                                            onMouseEnter={() => dispatchHover('WIP Limit', 'Double click to edit maximum allowed tasks')}
                                            onMouseLeave={() => dispatchHover(null)}
                                        >
                                            <span className="text-sm font-bold text-gray-800 select-none">{panel.item.limit === 0 ? 'None (No limit)' : panel.item.limit}</span>
                                            <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'color' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Color</label>
                                {isBacklogPanel ? (
                                    <div 
                                        className="text-xs font-medium text-gray-400 italic bg-gray-100 border border-gray-200 flex items-center" 
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', height: '56px' }}
                                    >
                                        Backlog color is locked.
                                    </div>
                                ) : panel.mode === 'add' ? (
                                    <div 
                                        className="flex gap-3 flex-wrap items-center bg-white border-2 border-gray-200 shadow-sm" 
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}
                                    >
                                        {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                            <button 
                                                key={color} onClick={() => setFormData({...formData, color})}
                                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${formData.color === color ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                ) : activeField === 'color' ? (
                                    <div tabIndex={0} ref={el => el?.focus()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit(); }} onKeyDown={handleKeyDownDefault} className="outline-none">
                                        <div 
                                            className="flex gap-3 flex-wrap items-center bg-purple-50 shadow-sm" 
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}
                                        >
                                            {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(c => (
                                                <button 
                                                    key={c} 
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => setEditValue(c)} 
                                                    onDoubleClick={(e) => { e.preventDefault(); setEditValue(c); setTimeout(() => saveEdit(c), 0); }} 
                                                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${editValue === c ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-transparent'}`} 
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click to preview, <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Double click</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative flex items-center gap-3 bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                        onDoubleClick={() => startEdit('color', panel.item.color)}
                                        onMouseEnter={() => dispatchHover('Label Color', 'Double click to change element color')}
                                        onMouseLeave={() => dispatchHover(null)}
                                    >
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner flex-shrink-0" style={{ backgroundColor: panel.item?.color || '#ffffff' }} />
                                        <span className="text-sm font-bold text-gray-800 select-none">Card Color</span>
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {panel.mode === 'view' && panel.item?.createdAt && (
                                <div className="border-t border-gray-200 space-y-3" style={{ marginTop: 'auto', paddingTop: '20px', marginBottom: '10px' }}>
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 select-none">
                                        <span className="uppercase font-bold tracking-wider">Created</span>
                                        <span className="font-semibold">{new Date(panel.item.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 select-none">
                                        <span className="uppercase font-bold tracking-wider">Last modified</span>
                                        <span className="font-semibold">{new Date(panel.item.updatedAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div style={{ height: `${FOOTER_HEIGHT}px` }} className="flex border-t border-gray-200 bg-white flex-shrink-0">
                    {isDeleting ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-del" onClick={() => setIsDeleting(false)} className="w-full h-full flex items-center justify-center bg-white text-gray-600 hover:text-gray-900 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel">
                                    <X size={24}/>
                                </button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-del" onClick={confirmDelete} className="w-full h-full flex items-center justify-center bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer rounded-none outline-none select-none">
                                    <Trash2 size={18} className="mr-2"/> Confirm Delete
                                </button>
                            </div>
                        </>
                    ) : isClearing ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-clear" onClick={() => setIsClearing(false)} className="w-full h-full flex items-center justify-center bg-white text-gray-600 hover:text-gray-900 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel">
                                    <X size={24}/>
                                </button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-clear" onClick={handleClearTasks} className="w-full h-full flex items-center justify-center bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer rounded-none outline-none select-none">
                                    <Trash2 size={18} className="mr-2"/> Confirm Clear
                                </button>
                            </div>
                        </>
                    ) : isWipWarning ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-wip" onClick={() => setIsWipWarning(false)} className="w-full h-full flex items-center justify-center bg-white text-gray-600 hover:text-gray-900 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel">
                                    <X size={24}/>
                                </button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-wip" onClick={() => { setIsWipWarning(false); handlePanelSaveGlobal(); }} className="w-full h-full flex items-center justify-center bg-yellow-500 text-white text-xs font-bold hover:bg-yellow-600 transition-colors cursor-pointer rounded-none outline-none select-none">
                                    <Save size={18} className="mr-2"/> Proceed
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                {panel.mode === 'add' ? (
                                    <button key="btn-cancel" onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="w-full h-full flex items-center justify-center bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors border-r border-gray-200 cursor-pointer rounded-none outline-none select-none">
                                        Cancel
                                    </button>
                                ) : activeField ? (
                                    <button key="btn-discard" onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }} className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 border-r border-gray-200 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer rounded-none outline-none select-none">
                                        Discard
                                    </button>
                                ) : panel.mode === 'view' && !isBacklogPanel ? (
                                    <button key="btn-delete" onClick={() => setIsDeleting(true)} className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100 hover:text-red-600 hover:bg-red-50 transition-colors border-r border-gray-200 cursor-pointer rounded-none outline-none select-none" title={`Delete ${panel.type}`}>
                                        <Trash2 size={24}/>
                                    </button>
                                ) : (
                                    <div key="btn-empty-left" className="w-full h-full bg-gray-50 border-r border-gray-200"></div>
                                )}
                            </div>

                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                {panel.mode === 'add' ? (
                                    <button key="btn-add" onClick={handleAddClick} className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer rounded-none outline-none select-none">
                                        <Plus size={18} className="mr-2"/> Add
                                    </button>
                                ) : activeField ? (
                                    <button key="btn-save" onMouseDown={(e) => { e.preventDefault(); saveEdit(); }} className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer rounded-none outline-none select-none">
                                        <Save size={18} className="mr-2"/> Save
                                    </button>
                                ) : (
                                    <>
                                        {(panel.type === 'column' || panel.type === 'row') && hasItems && (
                                            <button 
                                                key="btn-clear" 
                                                onClick={() => setIsClearing(true)} 
                                                className="flex-1 h-full flex items-center justify-center bg-white text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 border-r border-gray-200 transition-colors cursor-pointer rounded-none outline-none select-none"
                                            >
                                                Clear Tasks
                                            </button>
                                        )}
                                        <button 
                                            key="btn-close"
                                            onMouseDown={() => { closeBtnMouseDown.current = true; }}
                                            onMouseLeave={() => { closeBtnMouseDown.current = false; }}
                                            onClick={() => { 
                                                if (closeBtnMouseDown.current) {
                                                    setPanel(prev => ({...prev, isOpen: false})); 
                                                }
                                                closeBtnMouseDown.current = false;
                                            }}
                                            className="flex-1 h-full flex items-center justify-center bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer rounded-none outline-none select-none"
                                        >
                                            Close Details
                                        </button>
                                    </>
                                )}
                            </div>
>>>>>>> f62be26 (update UI i funkcjonalnosci)
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default EditSidebar;