import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, Save, LayoutPanelLeft, AlertTriangle, Pencil, PanelRightOpen, BrushCleaning, Check } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { useKanbanStore } from '../../../store/useKanbanStore';

export type PanelType = 'task' | 'column' | 'row';
export type PanelMode = 'view' | 'add'; 

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
    handleClearTasks: () => void;
    dispatchHover: (title: string | null, subtitle?: string) => void;
    onAssigneeDrop: (userId: number) => void;
    onRemoveAssignee: (userId: number) => void;
    isDeleting: boolean;
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    isClearing: boolean;
    setIsClearing: React.Dispatch<React.SetStateAction<boolean>>;
    pendingMove: any;
    setPendingMove: React.Dispatch<React.SetStateAction<any>>;
    handleConfirmMove: () => void;
    SIDEBAR_WIDTH: number;
    SIDEBAR_LEFT_PADDING: number;
    SIDEBAR_RIGHT_PADDING: number;
    DETAILS_FIELD_RADIUS: string;
    FOOTER_HEIGHT: number;
    FOOTER_LEFT_RATIO: number;
    FOOTER_RIGHT_RATIO: number;
}

const EditSidebar: React.FC<EditSidebarProps> = ({
    panel, setPanel, formData, setFormData, activeField, editValue, setEditValue, 
    startEdit, cancelEdit, saveEdit, handleKeyDownTitle, handleKeyDownDefault,
    handlePanelSaveGlobal, handleClearTasks, dispatchHover,
    onAssigneeDrop, onRemoveAssignee, isDeleting, setIsDeleting, isClearing, setIsClearing,
    pendingMove, setPendingMove, handleConfirmMove,
    SIDEBAR_WIDTH, SIDEBAR_LEFT_PADDING, SIDEBAR_RIGHT_PADDING, DETAILS_FIELD_RADIUS,
    FOOTER_HEIGHT, FOOTER_LEFT_RATIO, FOOTER_RIGHT_RATIO
}) => {
    const { users = [] } = useUserStore();
    const { columns = [], rows = [], removeColumn, removeRow, removeItem, addSubtask, updateSubtask, removeSubtask } = useKanbanStore();
    
    const [targetMoveId, setTargetMoveId] = useState<number | 'unlabeled'>('unlabeled');
    const [deleteAction, setDeleteAction] = useState<'move' | 'delete'>('move');
    const [isWipWarning, setIsWipWarning] = useState(false);
    
    const [isAddAssigneeActive, setIsAddAssigneeActive] = useState(false);
    
    const [isEditingSubtasks, setIsEditingSubtasks] = useState(false);
    const [localSubtasks, setLocalSubtasks] = useState<any[] | null>(null);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
    const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
    
    const subtasksContainerRef = useRef<HTMLDivElement>(null);

    const showWipWarning = isWipWarning || pendingMove !== null;
    
    const isBacklogPanel = panel.type === 'column' && panel.item?.title === 'Backlog';
    const isUnlabeledPanel = panel.type === 'row' && panel.item?.id === 'unlabeled';
    const isTitleLocked = isBacklogPanel || isUnlabeledPanel;
    
    const closeBtnMouseDown = useRef(false);

    const handleStartEdit = (field: string, value: any) => {
        if (isEditingSubtasks) {
            setIsEditingSubtasks(false);
            setLocalSubtasks(null);
            setNewSubtaskTitle('');
            setEditingSubtaskId(null);
        }
        if (isAddAssigneeActive) {
            setIsAddAssigneeActive(false);
        }
        startEdit(field, value);
    };

    const handleStartSubtasksEdit = () => {
        cancelEdit(); 
        if (isAddAssigneeActive) {
            setIsAddAssigneeActive(false);
        }
        setIsEditingSubtasks(true);
        setLocalSubtasks(JSON.parse(JSON.stringify(panel.item?.subtasks || [])));
    };

    useEffect(() => {
        if (!panel.isOpen) {
            setIsWipWarning(false);
            setNewSubtaskTitle('');
            setEditingSubtaskId(null);
            setEditingSubtaskTitle('');
            setIsAddAssigneeActive(false);
            setIsEditingSubtasks(false);
            setLocalSubtasks(null);
        }
    }, [panel.isOpen]);

    useEffect(() => {
        if (isEditingSubtasks && subtasksContainerRef.current) {
            if (!subtasksContainerRef.current.contains(document.activeElement)) {
                subtasksContainerRef.current.focus();
            }
        }
    }, [isEditingSubtasks]);

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
            if (targetCol && targetCol.limit > 0 && targetCol.items.length >= targetCol.limit && !showWipWarning) {
                setIsWipWarning(true);
                return;
            }
        }
        handlePanelSaveGlobal();
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim() || !panel.item) return;
        await addSubtask(panel.item.id, newSubtaskTitle.trim());
        setNewSubtaskTitle('');
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
            className={`flex flex-col bg-[var(--bg-card)] border-[var(--border-base)] transition-all duration-300 ease-in-out z-40 overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.15)] flex-shrink-0 h-full ${panel.isOpen ? 'border-r' : ''}`}
        >
            <div style={{ width: `${SIDEBAR_WIDTH}px` }} className="flex flex-col h-full bg-[var(--bg-card)]">
                <div 
                    style={{ paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px`, height: 60 }}
                    className="flex font-black items-center justify-between py-6 border-b border-[var(--border-base)] bg-[var(--bg-page)] flex-shrink-0 transition-colors"
                >
                    <h3 className="text-lg text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
                        {isDeleting ? (
                            <><Trash2 className="text-[var(--status-error)]" size={20}/> Delete {panel.type}</>
                        ) : isClearing ? (
                            <><Trash2 className="text-[var(--status-error)]" size={20}/> Clear Tasks</>
                        ) : showWipWarning ? (
                            <><AlertTriangle className="text-[var(--status-warning)]" size={20}/> Limit Exceeded</>
                        ) : (
                            <><LayoutPanelLeft className="text-[var(--accent-primary)]" size={20}/> {panel.mode === 'add' ? 'Add' : 'Details'} {panel.type}</>
                        )}
                    </h3>
                    <button 
                        onClick={() => {
                            setPanel(prev => ({...prev, isOpen: false}));
                            setIsDeleting(false);
                            setIsClearing(false);
                            setIsWipWarning(false);
                            setPendingMove(null);
                        }} 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-full transition-colors"
                    >
                        <X size={25}/>
                    </button>
                </div>

                <div 
                    style={{ paddingTop: `20px`, paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px` }}
                    className="flex-1 overflow-y-auto pb-6 flex flex-col gap-6"
                >
                    {isDeleting ? (
                        <>
                            <div className="p-4 justify-center bg-[var(--status-error)]/10 rounded-2xl border border-[var(--status-error)]/30 flex gap-3 text-[var(--status-error)] text-sm">
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
                                <div className="flex flex-col gap-3 mt-2">
                                    <label 
                                        className={`group relative flex items-center gap-3 border-2 shadow-sm cursor-pointer transition-colors ${deleteAction === 'move' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-light)]' : 'border-[var(--border-base)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)]'}`}
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px' }}
                                    >
                                        <input type="radio" checked={deleteAction === 'move'} onChange={() => setDeleteAction('move')} className="w-4 h-4 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]" />
                                        <span className="text-sm font-bold text-[var(--text-main)]">Move tasks to another {panel.type}</span>
                                    </label>
                                    
                                    {deleteAction === 'move' && (
                                        <div className="pl-8 mb-1">
                                            <select
                                                className="w-full text-sm font-bold border-2 border-[var(--border-base)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] shadow-sm cursor-pointer"
                                                style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }}
                                                value={targetMoveId}
                                                onChange={(e) => setTargetMoveId(e.target.value === 'unlabeled' ? 'unlabeled' : parseInt(e.target.value))}
                                            >
                                                {panel.type === 'column' 
                                                    ? columns.filter(c => c.id !== panel.item?.id).map(c => <option key={c.id} value={c.id} className="text-gray-800">{c.title}</option>) 
                                                    : <> <option value="unlabeled" className="text-gray-800">Unlabeled zone</option> {rows.filter(r => r.id !== panel.item?.id).map(r => <option key={r.id} value={r.id} className="text-gray-800">{r.title}</option>)} </>
                                                }
                                            </select>
                                        </div>
                                    )}

                                    <label 
                                        className={`group relative flex items-center gap-3 border-2 shadow-sm cursor-pointer transition-colors ${deleteAction === 'delete' ? 'border-[var(--status-error)] bg-[var(--status-error)]/10' : 'border-[var(--border-base)] bg-[var(--bg-card)] hover:border-[var(--status-error)]/50'}`}
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px' }}
                                    >
                                        <input type="radio" checked={deleteAction === 'delete'} onChange={() => setDeleteAction('delete')} className="w-4 h-4 text-[var(--status-error)] focus:ring-[var(--status-error)]" />
                                        <span className="text-sm font-bold text-[var(--status-error)]">Delete all tasks permanently</span>
                                    </label>
                                </div>
                            )}
                        </>
                    ) : isClearing ? (
                        <div 
                            style={{}}
                            className="p-6 items-center bg-[var(--status-error)]/10 rounded-2xl border-2 border-[var(--status-error)]/30 flex gap-4 text-[var(--status-error)] text-base mt-2">
                            <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                            <div>
                                <span className="font-black block mb-2 text-lg">Danger Zone!</span>
                                <span>Are you sure you want to permanently delete all tasks in this {isBacklogPanel ? 'Backlog' : isUnlabeledPanel ? 'Unlabeled row' : panel.type}? This action is irreversible.</span>
                            </div>
                        </div>
                    ) : showWipWarning ? (
                        <div className="p-6 bg-[var(--status-warning)]/10 rounded-2xl border-2 border-[var(--status-warning)]/30 flex gap-4 text-[var(--status-warning)] text-base mt-2">
                            <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                            <div>
                                <span className="font-black block mb-2 text-lg">WIP Limit Warning!</span>
                                <span>{pendingMove ? "Moving this task will exceed the column's Work-In-Progress limit. Are you sure you want to proceed?" : "Adding a new task will exceed the column's Work-In-Progress limit. Are you sure you want to proceed?"}</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'title' ? 'text-[10px] text-[var(--accent-primary)]' : 'text-[10px] text-[var(--text-muted)]'}`}>Title</label>
                                {panel.mode === 'add' ? (
                                    <textarea 
                                        rows={1}
                                        className="w-full block m-0 text-base font-bold leading-tight border-2 border-[var(--border-base)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] transition-all shadow-sm resize-none overflow-hidden"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '15px 14px', minHeight: '56px' }} 
                                        value={formData.title} 
                                        onChange={(e) => {
                                            setFormData({...formData, title: e.target.value});
                                            e.target.style.height = '56px';
                                            e.target.style.height = `${Math.max(56, e.target.scrollHeight)}px`;
                                        }}
                                        ref={(el) => {
                                            if (el) {
                                                el.style.height = '56px';
                                                el.style.height = `${Math.max(56, el.scrollHeight)}px`;
                                            }
                                        }}
                                        placeholder={`Enter ${panel.type} title...`} 
                                        autoFocus
                                    />
                                ) : isTitleLocked ? (
                                    <div 
                                        className="group relative border-2 border-transparent bg-[var(--bg-page)] transition-colors block m-0 flex items-center opacity-80"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '15px 14px', minHeight: '56px' }} 
                                    >
                                        <h2 className="text-base font-bold text-[var(--text-main)] leading-tight break-words m-0 p-0 block w-full">{panel.item?.title || `Untitled ${panel.type}`}</h2>
                                        <div className="absolute bottom-1 right-2 opacity-100 pointer-events-none z-10">
                                            <span className="text-[10px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/80 px-2 py-0.5 rounded-full shadow-sm border border-[var(--border-base)] select-none">Name locked</span>
                                        </div>
                                    </div>
                                ) : activeField === 'title' ? (
                                    <div className="relative">
                                        <textarea 
                                            autoFocus
                                            rows={1}
                                            className="w-full block m-0 text-base font-bold leading-tight border-2 border-[var(--accent-primary)] bg-[var(--accent-primary-light)] text-[var(--text-main)] focus:outline-none shadow-sm resize-none overflow-hidden"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '15px 14px', minHeight: '56px' }} 
                                            value={editValue} 
                                            onChange={(e) => {
                                                setEditValue(e.target.value);
                                                e.target.style.height = '56px';
                                                e.target.style.height = `${Math.max(56, e.target.scrollHeight)}px`;
                                            }}
                                            onFocus={(e) => {
                                                const val = e.target.value;
                                                e.target.value = '';
                                                e.target.value = val;
                                                e.target.style.height = '56px';
                                                e.target.style.height = `${Math.max(56, e.target.scrollHeight)}px`;
                                            }}
                                            ref={(el) => {
                                                if (el) {
                                                    el.style.height = '56px';
                                                    el.style.height = `${Math.max(56, el.scrollHeight)}px`;
                                                }
                                            }}
                                            onBlur={cancelEdit} 
                                            onKeyDown={handleKeyDownTitle}
                                        />
                                        <div className="text-[9px] text-[var(--accent-primary)] mt-1.5 font-bold">Click <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Enter</kbd> to save or <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative border-2 border-[var(--bg-card)] hover:border-[var(--accent-primary-light)] bg-[var(--bg-card)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer block m-0 flex items-center"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '15px 14px', minHeight: '56px' }} 
                                        onDoubleClick={() => handleStartEdit('title', panel.item?.title)}
                                        onMouseEnter={() => dispatchHover('Task Title', 'Double click to edit title')}
                                        onMouseLeave={() => dispatchHover(null)}
                                    >
                                        <h2 className="text-base font-bold text-[var(--text-main)] leading-tight break-words m-0 p-0 block w-full">{panel.item?.title || `Untitled ${panel.type}`}</h2>
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span 
                                            style={{
                                                padding: '3px 5px 3px 5px'
                                            }}
                                            className="text-[10px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/80 px-2 py-0.5 rounded-full shadow-sm border border-[var(--border-base)] backdrop-blur-sm select-none">Double click to edit</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {panel.type === 'task' && (
                                <div className="flex flex-col gap-2">
                                    {(() => {
                                        const isAdd = panel.mode === 'add';
                                        const isActive = (isAdd && isAddAssigneeActive) || (!isAdd && activeField === 'assignedUsersIds');
                                        const displayIds = isAdd ? (formData.assignedUsersIds || []) : (panel.item?.assignedUsers?.map((u: any) => u.id) || []);
                                        const currentIds = isAdd ? (formData.assignedUsersIds || []) : (editValue || []);

                                        const toggleUser = (userId: number) => {
                                            if (isAdd) {
                                                const newIds = currentIds.includes(userId) ? currentIds.filter((id: number) => id !== userId) : [...currentIds, userId];
                                                setFormData({ ...formData, assignedUsersIds: newIds });
                                            } else {
                                                setEditValue((prev: number[]) => prev.includes(userId) ? prev.filter((x: number) => x !== userId) : [...prev, userId]);
                                            }
                                        };

                                        const handleClose = () => {
                                            if (isAdd) setIsAddAssigneeActive(false);
                                            else cancelEdit();
                                        };

                                        return (
                                            <>
                                                <label className={`block font-bold uppercase tracking-wider mb-2 ${isActive ? 'text-[10px] text-[var(--accent-primary)]' : 'text-[10px] text-[var(--text-muted)]'}`}>Assignees</label>
                                                {isActive ? (
                                                    <div tabIndex={0} ref={el => el?.focus()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) handleClose(); }} onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); else if (e.key === 'Enter' && isAdd) setIsAddAssigneeActive(false); else if (!isAdd) handleKeyDownDefault(e); }} className="outline-none">
                                                        <div className="bg-[var(--accent-primary-light)] border-2 border-[var(--accent-primary)] p-3 shadow-sm mb-3 flex items-center gap-2" style={{ borderRadius: DETAILS_FIELD_RADIUS, minHeight: '56px', paddingLeft:"14px" }}>
                                                            {currentIds && currentIds.length > 0 ? (
                                                                <div className="flex -space-x-1.5 pl-1">
                                                                    {currentIds.map((id: number, idx: number) => {
                                                                        const u = users.find((user: any) => user.id === id);
                                                                        if (!u) return null;
                                                                        return (
                                                                            <div key={u.id} className="w-7 h-7 rounded-full bg-[var(--accent-primary)] border-[1.5px] border-[var(--bg-card)] flex items-center justify-center text-white text-[9px] font-bold shadow-sm" style={{ zIndex: 100 - idx }} title={u.fullName}>
                                                                                {u.fullName.substring(0,2).toUpperCase()}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs font-medium text-[var(--accent-primary)] italic opacity-70">Unassigned</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                                                            {users.map(u => {
                                                                const isSelected = currentIds && currentIds.includes(u.id);
                                                                return (
                                                                    <div key={u.id} onClick={() => toggleUser(u.id)} className="flex items-center gap-3 p-2 border-2 border-transparent bg-[var(--bg-page)] hover:border-[var(--accent-primary-light)] cursor-pointer transition-colors" style={{ padding:10, borderRadius: DETAILS_FIELD_RADIUS }}>
                                                                        <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] border-[1.5px] border-[var(--bg-card)] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">{u.fullName.substring(0,2).toUpperCase()}</div>
                                                                        <span className="text-xs font-bold text-[var(--text-main)]">{u.fullName}</span>
                                                                        {isSelected && <div className="ml-auto w-3 h-3 rounded-full bg-[var(--accent-primary)] mr-0 shadow-sm"></div>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="text-[9px] text-[var(--accent-primary)] mt-2 font-bold">Select users and click <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">{isAdd ? 'Enter' : 'Save'}</kbd> or <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Esc</kbd> to {isAdd ? 'close' : 'discard'}</div>
                                                    </div>
                                                ) : (
                                                    <div className="group relative flex items-center bg-[var(--bg-card)] border-2 border-[var(--border-base)] hover:border-[var(--accent-primary-light)] shadow-sm cursor-pointer transition-colors p-3" style={{ borderRadius: DETAILS_FIELD_RADIUS, minHeight: '56px' }} onDoubleClick={() => { 
                                                        if (isAdd) {
                                                            if (isEditingSubtasks) {
                                                                setIsEditingSubtasks(false);
                                                                setLocalSubtasks(null);
                                                                setNewSubtaskTitle('');
                                                                setEditingSubtaskId(null);
                                                            }
                                                            cancelEdit();
                                                            setIsAddAssigneeActive(true); 
                                                        } else {
                                                            handleStartEdit('assignedUsersIds', displayIds);
                                                        }
                                                    }} onMouseEnter={() => dispatchHover('Task Assignees', 'Double click to edit assignees')} onMouseLeave={() => dispatchHover(null)}>
                                                        <div className="flex flex-wrap items-center gap-2" style={{ paddingLeft:15 }}>
                                                            {displayIds && displayIds.length > 0 ? (
                                                                <div className="flex -space-x-1.5 pl-1">
                                                                    {displayIds.map((id: number, idx: number) => {
                                                                        const u = users.find((user: any) => user.id === id);
                                                                        if (!u) return null;
                                                                        return (
                                                                            <div key={u.id} className="w-7 h-7 rounded-full bg-[var(--accent-primary)] border-[1.5px] border-[var(--bg-card)] flex items-center justify-center text-white text-[9px] font-bold shadow-sm" style={{ zIndex: 100 - idx }} title={u.fullName}>
                                                                                {u.fullName.substring(0,2).toUpperCase()}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs font-medium text-[var(--text-muted)] italic">Unassigned</span>
                                                            )}
                                                        </div>
                                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                            <span 
                                                            style={{
                                                                padding: '3px 5px 3px 5px'
                                                            }}
                                                            className="text-[10px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/80 px-2 py-0.5 rounded-full shadow-sm border border-[var(--border-base)] backdrop-blur-sm select-none">
                                                                Double click to edit
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            {panel.type === 'task' && (
                                <div className="flex flex-col">
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'content' ? 'text-[10px] text-[var(--accent-primary)]' : 'text-[10px] text-[var(--text-muted)]'}`}>Description</label>
                                    {panel.mode === 'add' ? (
                                        <textarea 
                                            className="w-full flex-1 text-sm border-2 border-[var(--border-base)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none shadow-sm min-h-[120px]"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '12px 14px' }}
                                            value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Add details, steps, notes..."
                                        />
                                    ) : activeField === 'content' ? (
                                        <div className="flex flex-col">
                                            <textarea 
                                                autoFocus
                                                className="w-full flex-1 text-sm border-2 border-[var(--accent-primary)] bg-[var(--accent-primary-light)] text-[var(--text-main)] focus:outline-none transition-all resize-none shadow-sm min-h-[120px]"
                                                style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '12px 14px' }}
                                                value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                            />
                                            <div className="text-[9px] text-[var(--accent-primary)] mt-1.5 font-bold">Click <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Ctrl + Enter</kbd> to save or <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="group relative bg-[var(--bg-card)] border-2 border-[var(--border-base)] hover:border-[var(--accent-primary-light)] shadow-sm cursor-pointer transition-colors min-h-[120px]"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '12px 14px' }}
                                            onDoubleClick={() => handleStartEdit('content', panel.item?.content === 'none' ? '' : panel.item?.content)}
                                            onMouseEnter={() => dispatchHover('Task Description', 'Double click to edit details')}
                                            onMouseLeave={() => dispatchHover(null)}
                                        >
                                            <p className="text-sm text-[var(--text-main)] whitespace-pre-wrap leading-relaxed select-none m-0">
                                                {panel.item?.content && panel.item?.content !== 'none' ? panel.item?.content : <span className="italic text-[var(--text-muted)]">No description provided.</span>}
                                            </p>
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                <span 
                                                style={{
                                                padding: '3px 5px 3px 5px'
                                            }}
                                            className="text-[10px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/80 px-2 py-0.5 rounded-full shadow-sm border border-[var(--border-base)] backdrop-blur-sm select-none">Double click to edit</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- SEKCJA SUBTASKÓW Z LOKALNYM STANEM --- */}
                            {panel.type === 'task' && panel.mode === 'view' && (
                                <div className="flex flex-col mt-2">
                                    <label className={`block font-bold uppercase tracking-wider mb-2 text-[10px] ${isEditingSubtasks ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
                                        Subtasks
                                    </label>
                                    
                                    {isEditingSubtasks ? (
                                        <div 
                                            ref={subtasksContainerRef}
                                            tabIndex={-1}
                                            className="flex flex-col gap-2 border-2 border-[var(--accent-primary)] bg-[var(--accent-primary-light)] shadow-sm transition-colors relative outline-none"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '12px 14px', minHeight: '120px' }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Escape') {
                                                    setNewSubtaskTitle('');
                                                    setEditingSubtaskId(null);
                                                    setIsEditingSubtasks(false);
                                                    setLocalSubtasks(null);
                                                }
                                            }}
                                        >
                                            <div className="flex flex-col gap-2">
                                                {localSubtasks?.map((subtask: any) => (
                                                    <div key={subtask.id} className="flex items-center justify-between gap-3 bg-[var(--bg-card)] border-2 border-[var(--border-base)] hover:border-[var(--accent-primary-light)] transition-colors shadow-sm group" style={{ borderRadius: DETAILS_FIELD_RADIUS, minHeight: '48px' }}>
                                                        {editingSubtaskId === subtask.id ? (
                                                            <div className="relative w-full flex-1 flex flex-col pt-1 pb-1">
                                                                <textarea
                                                                    autoFocus
                                                                    rows={1}
                                                                    className="w-full block m-0 text-sm font-bold leading-tight border-2 border-[var(--accent-primary)] bg-[var(--accent-primary-light)] text-[var(--text-main)] focus:outline-none shadow-sm resize-none overflow-hidden"
                                                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, minHeight: '48px', padding: '12px 14px' }}
                                                                    value={editingSubtaskTitle}
                                                                    onChange={(e) => {
                                                                        setEditingSubtaskTitle(e.target.value);
                                                                        e.target.style.height = '48px';
                                                                        e.target.style.height = `${Math.max(48, e.target.scrollHeight)}px`;
                                                                    }}
                                                                    onBlur={() => {
                                                                        if (editingSubtaskTitle.trim() !== '' && editingSubtaskTitle !== subtask.title) {
                                                                            setLocalSubtasks(prev => prev?.map(s => s.id === subtask.id ? { ...s, title: editingSubtaskTitle.trim() } : s) || []);
                                                                        }
                                                                        setEditingSubtaskId(null);
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                                            e.preventDefault();
                                                                            if (editingSubtaskTitle.trim() !== '' && editingSubtaskTitle !== subtask.title) {
                                                                                setLocalSubtasks(prev => prev?.map(s => s.id === subtask.id ? { ...s, title: editingSubtaskTitle.trim() } : s) || []);
                                                                            }
                                                                            setEditingSubtaskId(null);
                                                                        } else if (e.key === 'Escape') {
                                                                            e.stopPropagation(); 
                                                                            setEditingSubtaskId(null);
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="flex justify-end mt-2" style={{ paddingRight: '2px' }}>
                                                                    <button 
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            if (editingSubtaskTitle.trim() !== '' && editingSubtaskTitle !== subtask.title) {
                                                                                setLocalSubtasks(prev => prev?.map(s => s.id === subtask.id ? { ...s, title: editingSubtaskTitle.trim() } : s) || []);
                                                                            }
                                                                            setEditingSubtaskId(null);
                                                                        }}
                                                                        disabled={editingSubtaskTitle.trim() === subtask.title || editingSubtaskTitle.trim() === ''}
                                                                        className="bg-[var(--accent-primary)] text-white text-[10px] font-bold py-1.5 px-5 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        style={{ 
                                                                            margin:10,
                                                                            padding:10,
                                                                            borderRadius: DETAILS_FIELD_RADIUS }}
                                                                    >
                                                                        <Check></Check>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <label 
                                                                className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1 m-0"
                                                                style={{ padding: '12px 14px', minHeight: '48px' }}
                                                            >
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={subtask.isDone} 
                                                                    onChange={(e) => {
                                                                        setLocalSubtasks(prev => prev?.map(s => s.id === subtask.id ? { ...s, isDone: e.target.checked } : s) || []);
                                                                    }}
                                                                    className="w-4 h-4 text-[var(--accent-primary)] border-gray-300 rounded focus:ring-[var(--accent-primary)] cursor-pointer flex-shrink-0 m-0"
                                                                />
                                                                <span className={`text-sm font-semibold break-words whitespace-pre-wrap select-none m-0 block leading-tight ${subtask.isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                                                                    {subtask.title}
                                                                </span>
                                                            </label>
                                                        )}
                                                        
                                                        {editingSubtaskId !== subtask.id && (
                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ paddingRight: '14px' }}>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setEditingSubtaskId(subtask.id);
                                                                        setEditingSubtaskTitle(subtask.title);
                                                                    }}
                                                                    className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                                                                    title="Edit subtask"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        setLocalSubtasks(prev => prev?.filter(s => s.id !== subtask.id) || []);
                                                                    }}
                                                                    className="text-[var(--text-muted)] hover:text-[var(--status-error)] transition-colors"
                                                                    title="Delete subtask"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-start gap-2" style={{ marginTop: '16px' }}>
                                                <textarea 
                                                    rows={1}
                                                    value={newSubtaskTitle}
                                                    onChange={(e) => {
                                                        setNewSubtaskTitle(e.target.value);
                                                        e.target.style.height = '48px';
                                                        e.target.style.height = `${Math.max(48, e.target.scrollHeight)}px`;
                                                    }}
                                                    onKeyDown={(e) => { 
                                                        if (e.key === 'Enter' && !e.shiftKey) { 
                                                            e.preventDefault(); 
                                                            if (!newSubtaskTitle.trim()) return;
                                                            setLocalSubtasks(prev => [...(prev || []), { id: -Date.now(), itemId: panel.item.id, title: newSubtaskTitle.trim(), isDone: false, content: 'none' }]);
                                                            setNewSubtaskTitle('');
                                                        } 
                                                    }}
                                                    placeholder="Add a new subtask..."
                                                    className="flex-1 block m-0 text-sm font-bold border-2 border-[var(--border-base)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] shadow-sm transition-colors resize-none overflow-hidden leading-tight"
                                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, minHeight: '48px', padding: '12px 14px' }}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        if (!newSubtaskTitle.trim()) return;
                                                        setLocalSubtasks(prev => [...(prev || []), { id: -Date.now(), itemId: panel.item.id, title: newSubtaskTitle.trim(), isDone: false, content: 'none' }]);
                                                        setNewSubtaskTitle('');
                                                    }}
                                                    disabled={!newSubtaskTitle.trim()}
                                                    className="flex items-center justify-center bg-[var(--bg-card)] text-[var(--accent-primary)] border-2 border-transparent hover:border-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                                    style={{ borderRadius: DETAILS_FIELD_RADIUS, width: '48px', height: '48px' }}
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                            <div className="text-[9px] text-[var(--accent-primary)] mt-1.5 font-bold">
                                                Click <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Save</kbd> or <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Esc</kbd> to discard
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="group relative bg-[var(--bg-card)] border-2 border-[var(--border-base)] hover:border-[var(--accent-primary-light)] shadow-sm cursor-pointer transition-colors"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, padding: '12px 14px', minHeight: '120px' }}
                                            onDoubleClick={handleStartSubtasksEdit}
                                            onMouseEnter={() => dispatchHover('Subtasks', 'Double click to edit or add subtasks')}
                                            onMouseLeave={() => dispatchHover(null)}
                                        >
                                            <div className="flex flex-col gap-2">
                                                {panel.item?.subtasks?.length > 0 ? (
                                                    panel.item.subtasks.map((subtask: any) => (
                                                        <div key={subtask.id} className="flex items-center gap-3 bg-[var(--bg-card)] border-2 border-[var(--border-base)] transition-colors shadow-sm" style={{ borderRadius: DETAILS_FIELD_RADIUS, minHeight: '48px', padding: '0 14px' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={subtask.isDone} 
                                                                readOnly
                                                                className="w-4 h-4 text-[var(--accent-primary)] border-gray-300 rounded pointer-events-none flex-shrink-0 m-0"
                                                            />
                                                            <span className={`text-sm font-semibold break-words whitespace-pre-wrap select-none m-0 block leading-tight ${subtask.isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                                                                {subtask.title}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-[var(--text-muted)] italic m-0 select-none">No subtasks added yet.</p>
                                                )}
                                            </div>
                                            
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                <span 
                                                style={{
                                                padding: '3px 5px 3px 5px'
                                            }}
                                            className="text-[10px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/80 px-2 py-0.5 rounded-full shadow-sm border border-[var(--border-base)] backdrop-blur-sm select-none">Double click to add / edit</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* --- KONIEC SEKCJI SUBTASKÓW --- */}

                            {panel.type === 'column' && !isBacklogPanel && (
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'limit' ? 'text-[10px] text-[var(--accent-primary)]' : 'text-[10px] text-[var(--text-muted)]'}`}>WIP Limit</label>
                                    {panel.mode === 'add' ? (
                                        <select
                                            className="w-full text-sm font-bold border-2 border-[var(--border-base)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none shadow-sm cursor-pointer"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} 
                                            value={formData.limit || 0} onChange={(e) => setFormData({...formData, limit: parseInt(e.target.value)})}
                                        >
                                            <option value={0} className="text-gray-800">None (No limit)</option>
                                            {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1} className="text-gray-800">{i + 1}</option>)}
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
                                                className="w-full text-sm font-bold border-2 border-[var(--accent-primary)] bg-[var(--accent-primary-light)] text-[var(--text-main)] focus:outline-none shadow-sm cursor-pointer"
                                                style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} 
                                                value={editValue} onChange={(e) => setEditValue(parseInt(e.target.value))} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault}
                                            >
                                                <option value={0} className="text-gray-800">None (No limit)</option>
                                                {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1} className="text-gray-800">{i + 1}</option>)}
                                            </select>
                                            <div className="text-[9px] text-[var(--accent-primary)] mt-1.5 font-bold">Select and click <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Save</kbd> or <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="group relative flex items-center bg-[var(--bg-card)] border-2 border-[var(--border-base)] hover:border-[var(--accent-primary-light)] shadow-sm cursor-pointer transition-colors"
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                            onDoubleClick={() => handleStartEdit('limit', panel.item?.limit)}
                                            onMouseEnter={() => dispatchHover('WIP Limit', 'Double click to edit maximum allowed tasks')}
                                            onMouseLeave={() => dispatchHover(null)}
                                        >
                                            <span className="text-sm font-bold text-[var(--text-main)] select-none">{panel.item?.limit === 0 ? 'None (No limit)' : panel.item?.limit}</span>
                                            <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                <span 
                                                style={{
                                                    padding: '3px 5px 3px 5px'
                                                }}
                                                className="text-[10px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/80 px-2 py-0.5 rounded-full shadow-sm border border-[var(--border-base)] backdrop-blur-sm select-none">Double click to edit</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'color' ? 'text-[10px] text-[var(--accent-primary)]' : 'text-[10px] text-[var(--text-muted)]'}`}>Color</label>
                                {(isBacklogPanel || isUnlabeledPanel) ? (
                                    <div 
                                        className="text-xs font-medium text-[var(--text-muted)] italic bg-[var(--bg-page)] border border-[var(--border-base)] flex items-center" 
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', height: '56px' }}
                                    >
                                        {isBacklogPanel ? 'Backlog' : 'Unlabeled'} color is locked.
                                    </div>
                                ) : panel.mode === 'add' ? (
                                    <div 
                                        className="flex gap-3 flex-wrap items-center bg-[var(--bg-card)] border-2 border-[var(--border-base)] shadow-sm" 
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}
                                    >
                                        {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => (
                                            <button 
                                                key={color} onClick={() => setFormData({...formData, color})}
                                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${formData.color === color ? 'border-purple-500 ring-2 ring-[var(--accent-primary)]/40 scale-110' : 'border-gray-300'}`} style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                ) : activeField === 'color' ? (
                                    <div tabIndex={0} ref={el => el?.focus()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit(); }} onKeyDown={handleKeyDownDefault} className="outline-none">
                                        <div 
                                            className="flex gap-3 flex-wrap items-center bg-[var(--accent-primary-light)] border-2 border-[var(--accent-primary)] shadow-sm" 
                                            style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}
                                        >
                                            {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(c => (
                                                <button 
                                                    key={c} 
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => setEditValue(c)} 
                                                    onDoubleClick={(e) => { e.preventDefault(); setEditValue(c); setTimeout(() => saveEdit(c), 0); }} 
                                                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${editValue === c ? 'border-purple-500 ring-2 ring-[var(--accent-primary)]/40 scale-110' : 'border-gray-300'}`} 
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-[9px] text-[var(--accent-primary)] mt-1.5 font-bold">Click to preview, <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Double click</kbd> to save or <kbd className="bg-[var(--accent-primary-light)] px-1 py-0.5 rounded border border-[var(--accent-primary)]">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group relative flex items-center gap-3 bg-[var(--bg-card)] border-2 border-[var(--border-base)] hover:border-[var(--accent-primary-light)] shadow-sm cursor-pointer transition-colors"
                                        style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} 
                                        onDoubleClick={() => handleStartEdit('color', panel.item?.color)}
                                        onMouseEnter={() => dispatchHover('Label Color', 'Double click to change element color')}
                                        onMouseLeave={() => dispatchHover(null)}
                                    >
                                        <div className="w-8 h-8 rounded-full border border-gray-300 shadow-inner flex-shrink-0" style={{ backgroundColor: panel.item?.color || '#ffffff' }} />
                                        <span className="text-sm font-bold text-[var(--text-main)] select-none">Card Color</span>
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            <span 
                                            style={{
                                                padding: '3px 5px 3px 5px'
                                            }}
                                            className="text-[10px] italic text-[var(--text-muted)] bg-[var(--bg-card)]/80 px-2 py-0.5 rounded-full shadow-sm border border-[var(--border-base)] backdrop-blur-sm select-none">Double click to edit</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {panel.mode === 'view' && panel.item?.createdAt && (
                                <div className="border-t border-[var(--border-base)] space-y-3" style={{ marginTop: 'auto', paddingTop: '20px', marginBottom: '10px' }}>
                                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] select-none">
                                        <span className="uppercase font-bold tracking-wider">Created</span>
                                        <span className="font-semibold">{new Date(panel.item?.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] select-none">
                                        <span className="uppercase font-bold tracking-wider">Last modified</span>
                                        <span className="font-semibold">{new Date(panel.item?.updatedAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div style={{ height: `${FOOTER_HEIGHT}px` }} className="flex border-t border-[var(--border-base)] bg-[var(--bg-card)] flex-shrink-0">
                    {isDeleting ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-del" onClick={() => setIsDeleting(false)} className="w-full h-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-r border-[var(--border-base)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel">
                                    <X size={24}/>
                                </button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-del" onClick={confirmDelete} className="w-full h-full flex items-center justify-center bg-[var(--status-error)] text-white text-xs font-bold hover:opacity-90 transition-colors cursor-pointer rounded-none outline-none select-none">
                                    <Trash2 size={18} className="mr-2"/> Confirm Delete
                                </button>
                            </div>
                        </>
                    ) : isClearing ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-clear" onClick={() => setIsClearing(false)} className="w-full h-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-r border-[var(--border-base)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel">
                                    <X size={24}/>
                                </button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-clear" onClick={handleClearTasks} className="w-full h-full flex items-center justify-center bg-[var(--status-error)] text-white text-xs font-bold hover:opacity-90 transition-colors cursor-pointer rounded-none outline-none select-none">
                                    <Trash2 size={18} className="mr-2"/> Confirm Clear
                                </button>
                            </div>
                        </>
                    ) : showWipWarning ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-wip" onClick={() => { setIsWipWarning(false); setPendingMove(null); }} className="w-full h-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-r border-[var(--border-base)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel">
                                    <X size={24}/>
                                </button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-wip" onClick={() => { 
                                    if (pendingMove) {
                                        handleConfirmMove();
                                    } else {
                                        setIsWipWarning(false); 
                                        handlePanelSaveGlobal(); 
                                    }
                                }} className="w-full h-full flex items-center justify-center bg-[var(--status-warning)] text-white text-xs font-bold hover:opacity-90 transition-colors cursor-pointer rounded-none outline-none select-none">
                                    <Save size={18} className="mr-2"/> Proceed
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                {panel.mode === 'add' ? (
                                    <button key="btn-cancel" onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="w-full h-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-bold hover:bg-[var(--bg-page)] transition-colors border-r border-[var(--border-base)] cursor-pointer rounded-none outline-none select-none">
                                        Cancel
                                    </button>
                                ) : activeField || isEditingSubtasks ? (
                                    <button key="btn-discard" onMouseDown={(e) => { 
                                        e.preventDefault(); 
                                        if (isEditingSubtasks) {
                                            setNewSubtaskTitle('');
                                            setEditingSubtaskId(null);
                                            setIsEditingSubtasks(false);
                                            setLocalSubtasks(null);
                                        } else cancelEdit(); 
                                    }} className="w-full h-full flex items-center justify-center bg-[var(--status-error)]/10 text-[var(--status-error)] border-r border-[var(--border-base)] text-xs font-bold hover:bg-[var(--status-error)]/20 transition-colors cursor-pointer rounded-none outline-none select-none">
                                        <X></X>
                                    </button>
                                ) : panel.mode === 'view' && !(isBacklogPanel || isUnlabeledPanel) ? (
                                    <button key="btn-delete" onClick={() => setIsDeleting(true)} className="w-full h-full flex items-center justify-center text-[var(--status-error)] bg-[var(--status-error)]/10 hover:opacity-80 transition-colors border-r border-[var(--border-base)] cursor-pointer rounded-none outline-none select-none" title={`Delete ${panel.type}`}>
                                        <Trash2 size={24}/>
                                    </button>
                                ) : (
                                    <div key="btn-empty-left" className="w-full h-full bg-[var(--bg-page)] border-r border-[var(--border-base)]"></div>
                                )}
                            </div>

                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                {panel.mode === 'add' ? (
                                    <button key="btn-add" onClick={handleAddClick} className="w-full h-full flex items-center justify-center bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 transition-colors cursor-pointer rounded-none outline-none select-none">
                                        <Plus size={18} className="mr-2"/> Add
                                    </button>
                                ) : activeField || isEditingSubtasks ? (
                                    <button key="btn-save" onMouseDown={(e) => { 
                                        e.preventDefault(); 
                                        if (isEditingSubtasks) {
                                            const processCommits = async () => {
                                                const original = panel.item?.subtasks || [];
                                                const currentLocal = localSubtasks || [];
                                                
                                                const toAdd = currentLocal.filter(s => s.id < 0);
                                                const localIds = currentLocal.map(s => s.id);
                                                const toDelete = original.filter((s: any) => !localIds.includes(s.id));
                                                const toUpdate = currentLocal.filter(s => s.id > 0);
                                                
                                                for (const s of toAdd) await addSubtask(panel.item.id, s.title);
                                                for (const s of toDelete) await removeSubtask(s.id);
                                                for (const s of toUpdate) {
                                                    const orig = original.find((o: any) => o.id === s.id);
                                                    if (orig && (orig.title !== s.title || orig.isDone !== s.isDone)) {
                                                        await updateSubtask(s.id, { title: s.title, isDone: s.isDone });
                                                    }
                                                }
                                            };
                                            processCommits();
                                            
                                            setNewSubtaskTitle('');
                                            setEditingSubtaskId(null);
                                            setIsEditingSubtasks(false);
                                            setLocalSubtasks(null);
                                        } else saveEdit(); 
                                    }} className="w-full h-full flex items-center justify-center bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90 transition-colors cursor-pointer rounded-none outline-none select-none">
                                        <Save size={18} className="mr-2"/> Save
                                    </button>
                                ) : (
                                    <>
                                        {(panel.type === 'column' || panel.type === 'row') && hasItems && (
                                            <button 
                                                key="btn-clear" 
                                                onClick={() => setIsClearing(true)} 
                                                className="flex-1 h-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--status-error)] text-xs font-black uppercase tracking-widest hover:bg-[var(--status-error)]/10 border-r border-[var(--border-base)] transition-colors cursor-pointer rounded-none outline-none select-none"
                                            >
                                                <BrushCleaning></BrushCleaning>
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
                                            <PanelRightOpen></PanelRightOpen>
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default EditSidebar;