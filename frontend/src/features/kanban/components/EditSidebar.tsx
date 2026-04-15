import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, LayoutPanelLeft, AlertTriangle, PanelLeftClose, Check } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { useKanbanStore } from '../../../store/useKanbanStore';

export type PanelType = 'task' | 'column' | 'row';
export type PanelMode = 'view' | 'add'; 

export interface PanelState {
    isOpen: boolean; type: PanelType; mode: PanelMode; item: any; extra?: any;
}

export interface EditSidebarProps {
    panel: PanelState; setPanel: React.Dispatch<React.SetStateAction<PanelState>>;
    formData: any; setFormData: React.Dispatch<React.SetStateAction<any>>;
    activeField: string | null; editValue: any; setEditValue: React.Dispatch<React.SetStateAction<any>>;
    startEdit: (field: string, value: any) => void; cancelEdit: () => void; saveEdit: (forcedValue?: any) => Promise<void>;
    handleKeyDownTitle: (e: React.KeyboardEvent) => void; handleKeyDownDefault: (e: React.KeyboardEvent) => void;
    handlePanelSaveGlobal: () => Promise<void>; handleClearTasks: () => void;
    dispatchHover: (title: string | null, subtitle?: string) => void;
    onAssigneeDrop: (userId: number) => void; onRemoveAssignee: (userId: number) => void;
    isDeleting: boolean; setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    isClearing: boolean; setIsClearing: React.Dispatch<React.SetStateAction<boolean>>;
    pendingMove: any; setPendingMove: React.Dispatch<React.SetStateAction<any>>; handleConfirmMove: () => void;
    SIDEBAR_WIDTH: number; SIDEBAR_LEFT_PADDING: number; SIDEBAR_RIGHT_PADDING: number;
    DETAILS_FIELD_RADIUS: string; FOOTER_HEIGHT: number; FOOTER_LEFT_RATIO: number; FOOTER_RIGHT_RATIO: number;
}

const EditSidebar: React.FC<EditSidebarProps> = ({
    panel, setPanel, formData, setFormData, activeField, editValue, setEditValue, 
    startEdit, cancelEdit, saveEdit, handleKeyDownTitle, handleKeyDownDefault,
    handlePanelSaveGlobal, handleClearTasks, dispatchHover,
    onAssigneeDrop, onRemoveAssignee, isDeleting, setIsDeleting, isClearing, setIsClearing,
    pendingMove, setPendingMove, handleConfirmMove, SIDEBAR_WIDTH, SIDEBAR_LEFT_PADDING, SIDEBAR_RIGHT_PADDING, 
    DETAILS_FIELD_RADIUS, FOOTER_HEIGHT, FOOTER_LEFT_RATIO, FOOTER_RIGHT_RATIO
}) => {
    const { users = [] } = useUserStore();
    const { columns = [], rows = [], removeColumn, removeRow, removeItem, addSubtask, updateSubtask, removeSubtask } = useKanbanStore();
    
    const [targetMoveId, setTargetMoveId] = useState<number | 'unlabeled'>('unlabeled');
    const [deleteAction, setDeleteAction] = useState<'move' | 'delete'>('move');
    const [isWipWarning, setIsWipWarning] = useState(false);
    
    const [newSubtask, setNewSubtask] = useState('');

    const showWipWarning = isWipWarning || pendingMove !== null;
    const isBacklogPanel = panel.type === 'column' && panel.item?.title === 'Backlog';
    
    const isLockedPanel = (panel.type === 'column' && panel.item?.title === 'Backlog') || (panel.type === 'row' && panel.item?.id === 'unlabeled');
    
    const closeBtnMouseDown = React.useRef(false);
    const [isAssigneeDragOver, setIsAssigneeDragOver] = useState(false);

    useEffect(() => { if (!panel.isOpen) { setIsWipWarning(false); setNewSubtask(''); } }, [panel.isOpen]);

    useEffect(() => {
        if (isDeleting && panel.type === 'column' && panel.item) {
            const availableCols = columns.filter(c => c.id !== panel.item.id && c.title !== 'Backlog');
            setTargetMoveId(availableCols.length > 0 ? availableCols[0].id : 'unlabeled');
        } else if (isDeleting) setTargetMoveId('unlabeled');
    }, [isDeleting, panel.item, panel.type, columns]);

    const hasItems = panel.type === 'column' 
        ? (columns.find(c => c.id === panel.item?.id)?.items.length ?? 0) > 0
        : panel.type === 'row'
            ? panel.item?.id === 'unlabeled' ? columns.some(c => c.items.some(i => i.rowId === null)) : columns.some(c => c.items.some(i => i.rowId === panel.item?.id))
            : false;

    const handleAddClick = () => {
        if (panel.type === 'task' && panel.mode === 'add') {
            const targetCol = columns.find(c => c.id === panel.extra?.colId);
            if (targetCol && targetCol.limit > 0 && targetCol.items.length >= targetCol.limit && !showWipWarning) {
                setIsWipWarning(true); return;
            }
        }
        handlePanelSaveGlobal();
    };

    const confirmDelete = () => {
        if (!panel.item) return;
        if (panel.type === 'task') removeItem(panel.item.id);
        else if (panel.type === 'column') {
            if (hasItems && deleteAction === 'move') {
                if (targetMoveId === 'unlabeled') return alert("You must select another column to move the tasks to.");
                removeColumn(panel.item.id, 'move_tasks', targetMoveId as number);
            } else removeColumn(panel.item.id, hasItems ? 'delete_tasks' : undefined);
        } else if (panel.type === 'row') {
            if (hasItems && deleteAction === 'move') removeRow(panel.item.id, 'move_tasks', targetMoveId === 'unlabeled' ? null : targetMoveId);
            else removeRow(panel.item.id, hasItems ? 'delete_tasks' : undefined);
        }
        setPanel(prev => ({...prev, isOpen: false})); setIsDeleting(false);
    };

    const handleAddSubtask = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newSubtask.trim() !== '') {
            e.preventDefault();
            await addSubtask(panel.item.id, newSubtask.trim());
            setNewSubtask('');
        }
    };

    return (
        <aside 
            style={{ width: panel.isOpen ? `${SIDEBAR_WIDTH}px` : '0px' }}
            className={`flex flex-col bg-white border-gray-200 transition-all duration-300 ease-in-out z-40 overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.15)] flex-shrink-0 h-full ${panel.isOpen ? 'border-r' : ''}`}
        >
            <div style={{ width: `${SIDEBAR_WIDTH}px` }} className="flex flex-col h-full bg-gray-50/30">
                <div style={{ paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px`, height: 60, background: '#d9d9d9' }} className="flex font-black items-center justify-between py-6 border-b border-gray-100 flex-shrink-0">
                    <h3 className="text-lg text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        {isDeleting ? (<><Trash2 className="text-red-500" size={20}/> Delete {panel.type}</>) : isClearing ? (<><Trash2 className="text-red-500" size={20}/> Clear Tasks</>) : showWipWarning ? (<><AlertTriangle className="text-yellow-500" size={20}/> Limit Exceeded</>) : (<><LayoutPanelLeft className="text-purple-500" size={20}/> {panel.mode === 'add' ? 'Add' : 'Details'} {panel.type}</>)}
                    </h3>
                    <button onClick={() => { setPanel(prev => ({...prev, isOpen: false})); setIsDeleting(false); setIsClearing(false); setIsWipWarning(false); setPendingMove(null); }} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X size={25}/></button>
                </div>

                <div style={{ paddingTop: `20px`, paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px` }} className="flex-1 overflow-y-auto pb-6 flex flex-col gap-6">
                    {isDeleting ? (
                        <>
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 text-red-800 text-sm">
                                <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                                <div><span className="font-bold block mb-1">Danger Zone!</span>{panel.type === 'task' ? <span>Are you sure you want to permanently delete this task? This action is irreversible.</span> : hasItems ? <span>This {panel.type} contains tasks. What do you want to do with them before deleting?</span> : <span>Are you sure you want to permanently delete this {panel.type}? This action is irreversible.</span>}</div>
                            </div>
                            {panel.type !== 'task' && hasItems && (
                                <div className="flex flex-col gap-3 mt-2">
                                    <label className={`group relative flex items-center gap-3 border-2 shadow-sm cursor-pointer transition-colors ${deleteAction === 'move' ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white hover:border-purple-200'}`} style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px' }}>
                                        <input type="radio" checked={deleteAction === 'move'} onChange={() => setDeleteAction('move')} className="w-4 h-4 text-purple-600 focus:ring-purple-500" /><span className="text-sm font-bold text-gray-800">Move tasks to another {panel.type}</span>
                                    </label>
                                    {deleteAction === 'move' && (
                                        <div className="pl-8 mb-1">
                                            <select className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none focus:border-purple-400 shadow-sm cursor-pointer" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} value={targetMoveId} onChange={(e) => setTargetMoveId(e.target.value === 'unlabeled' ? 'unlabeled' : parseInt(e.target.value))}>
                                                {panel.type === 'column' ? columns.filter(c => c.id !== panel.item.id && c.title !== 'Backlog').map(c => <option key={c.id} value={c.id}>{c.title}</option>) : <> <option value="unlabeled">Unlabeled zone</option> {rows.filter(r => r.id !== panel.item.id).map(r => <option key={r.id} value={r.id}>{r.title}</option>)} </>}
                                            </select>
                                        </div>
                                    )}
                                    <label className={`group relative flex items-center gap-3 border-2 shadow-sm cursor-pointer transition-colors ${deleteAction === 'delete' ? 'border-red-400 bg-red-50' : 'border-gray-100 bg-white hover:border-red-200'}`} style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px' }}>
                                        <input type="radio" checked={deleteAction === 'delete'} onChange={() => setDeleteAction('delete')} className="w-4 h-4 text-red-600 focus:ring-red-500" /><span className="text-sm font-bold text-red-600">Delete all tasks permanently</span>
                                    </label>
                                </div>
                            )}
                        </>
                    ) : isClearing ? (
                        <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 flex gap-4 text-red-800 text-base mt-2">
                            <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                            <div><span className="font-black block mb-2 text-lg">Danger Zone!</span><span>Are you sure you want to permanently delete all tasks in this {panel.type}? This action is irreversible.</span></div>
                        </div>
                    ) : showWipWarning ? (
                        <div className="p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-100 flex gap-4 text-yellow-800 text-base mt-2">
                            <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                            <div><span className="font-black block mb-2 text-lg">WIP Limit Warning!</span><span>{pendingMove ? "Moving this task will exceed the column's Work-In-Progress limit. Are you sure you want to proceed?" : "Adding a new task will exceed the column's Work-In-Progress limit. Are you sure you want to proceed?"}</span></div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'title' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Title</label>
                                {isLockedPanel ? (
                                    <div className="text-sm font-bold text-gray-400 italic bg-gray-50 border border-gray-200 flex items-center select-none" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', height: '56px' }}>
                                        {panel.item?.title} (Locked)
                                    </div>
                                ) : panel.mode === 'add' ? (
                                    <input className="w-full text-base font-bold border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder={`Enter ${panel.type} title...`} autoFocus />
                                ) : activeField === 'title' ? (
                                    <div className="relative">
                                        <input autoFocus className="w-full text-base font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownTitle} />
                                        <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Enter</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                    </div>
                                ) : (
                                    <div className="group relative flex items-center border-2 border-transparent hover:border-purple-200 bg-transparent hover:bg-white transition-colors cursor-pointer" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} onDoubleClick={() => startEdit('title', panel.item.title)} onMouseEnter={() => dispatchHover('Task Title', 'Double click to edit title')} onMouseLeave={() => dispatchHover(null)} >
                                        <h2 className="text-base font-bold text-gray-900 leading-tight break-words">{panel.item?.title || `Untitled ${panel.type}`}</h2>
                                        <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"><span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span></div>
                                    </div>
                                )}
                            </div>

                            {panel.type === 'task' && (
                                <div className="flex flex-col gap-2">
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'assignedUsersIds' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Assignees</label>
                                    
                                    {panel.mode === 'add' ? (
                                        <div 
                                            className={`group relative bg-white border-2 border-gray-100 rounded-[10px] p-3 shadow-sm transition-colors hover:border-purple-200 ${isAssigneeDragOver ? 'ring-4 ring-blue-500 bg-blue-50 border-blue-500' : ''}`}
                                            onDragOver={(e) => { e.preventDefault(); }}
                                            onDragEnter={(e) => { e.preventDefault(); setIsAssigneeDragOver(true); }}
                                            onDragLeave={(e) => { e.preventDefault(); setIsAssigneeDragOver(false); }}
                                            onDrop={(e) => {
                                                e.preventDefault(); setIsAssigneeDragOver(false);
                                                const userIdStr = e.dataTransfer.getData('text/plain');
                                                if (!userIdStr) return;
                                                const userId = parseInt(userIdStr, 10);
                                                if (!isNaN(userId) && !formData.assignedUsersIds.includes(userId)) {
                                                    setFormData({...formData, assignedUsersIds: [...formData.assignedUsersIds, userId]});
                                                }
                                            }}
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                {formData.assignedUsersIds && formData.assignedUsersIds.length > 0 ? (
                                                    <div className="flex -space-x-1.5 pl-1">
                                                        {formData.assignedUsersIds.map((id: number, idx: number) => {
                                                            const u = users.find((user: any) => user.id === id);
                                                            if (!u) return null;
                                                            return (
                                                                <div key={u.id} className="relative group/avatar cursor-pointer" title={u.fullName}>
                                                                    <div className="w-7 h-7 rounded-full bg-indigo-500 border-[1.5px] border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm transition-transform group-hover/avatar:scale-110" style={{ zIndex: 100 - idx }}>
                                                                        {u.fullName.substring(0,2).toUpperCase()}
                                                                    </div>
                                                                    <div className="absolute inset-0 bg-red-500/90 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white z-[101]" onClick={() => setFormData({...formData, assignedUsersIds: formData.assignedUsersIds.filter((uid: number) => uid !== u.id)})} title={`Remove ${u.fullName}`}>
                                                                        <X size={12} strokeWidth={3} />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-gray-400 italic">Unassigned</span>
                                                )}
                                                
                                                <div className="relative ml-1">
                                                    <button className="w-7 h-7 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-colors shadow-sm cursor-pointer outline-none focus:outline-none">
                                                        <Plus size={14} strokeWidth={3}/>
                                                    </button>
                                                    <select
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        value="" title="Add assignee"
                                                        onChange={(e) => { 
                                                            const val = parseInt(e.target.value); 
                                                            if (!isNaN(val) && !formData.assignedUsersIds.includes(val)) {
                                                                setFormData({...formData, assignedUsersIds: [...formData.assignedUsersIds, val]});
                                                            }
                                                        }}
                                                    >
                                                        <option value="" disabled>Add user...</option>
                                                        {users.filter(u => !formData.assignedUsersIds.includes(u.id)).map(u => (
                                                            <option key={u.id} value={u.id}>{u.fullName}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ) : activeField === 'assignedUsersIds' ? (
                                        <div tabIndex={0} ref={el => el?.focus()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit(); }} onKeyDown={handleKeyDownDefault} className="outline-none">
                                            <div className="bg-purple-50 border-2 border-purple-400 p-3 shadow-sm mb-3 flex items-center gap-2" style={{ borderRadius: DETAILS_FIELD_RADIUS, minHeight: '56px', paddingLeft:"14px" }}>
                                                {editValue && editValue.length > 0 ? (
                                                    <div className="flex -space-x-1.5 pl-1">
                                                        {editValue.map((id: number, idx: number) => {
                                                            const u = users.find((user: any) => user.id === id);
                                                            if (!u) return null;
                                                            return (
                                                                <div key={u.id} className="w-7 h-7 rounded-full bg-indigo-500 border-[1.5px] border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm" style={{ zIndex: 100 - idx }} title={u.fullName}>
                                                                    {u.fullName.substring(0,2).toUpperCase()}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-purple-400 italic">Unassigned</span>
                                                )}
                                                <div className="relative ml-1">
                                                    <div className="w-7 h-7 rounded-full bg-white border-2 border-dashed border-purple-300 flex items-center justify-center text-purple-500 shadow-sm"><Plus size={14} strokeWidth={3}/></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                                                {users.map(u => {
                                                    const isSelected = editValue && editValue.includes(u.id);
                                                    return (
                                                        <div key={u.id} onClick={() => setEditValue((prev: number[]) => isSelected ? prev.filter(x => x !== u.id) : [...prev, u.id])} className="flex items-center gap-3 p-2 border-2 border-transparent bg-white hover:border-purple-200 cursor-pointer transition-colors" style={{ padding:10, borderRadius: DETAILS_FIELD_RADIUS }}>
                                                            <div className="w-8 h-8 rounded-full bg-indigo-500 border-[1.5px] border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm">{u.fullName.substring(0,2).toUpperCase()}</div>
                                                            <span className="text-xs font-bold text-gray-800">{u.fullName}</span>
                                                            {isSelected && <div className="ml-auto w-3 h-3 rounded-full bg-purple-500 mr-0 shadow-sm"></div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-[9px] text-purple-600 mt-2 font-bold">Select users and click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Save</kbd> or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div className="group relative flex items-center bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors p-3" style={{ borderRadius: DETAILS_FIELD_RADIUS, minHeight: '56px' }} onDoubleClick={() => startEdit('assignedUsersIds', panel.item?.assignedUsers?.map((u: any) => u.id) || [])} onMouseEnter={() => dispatchHover('Task Assignees', 'Double click to edit assignees')} onMouseLeave={() => dispatchHover(null)}>
                                            <div className="flex flex-wrap items-center gap-2" style={{ paddingLeft:15 }}>
                                                {panel.item?.assignedUsers && panel.item.assignedUsers.length > 0 ? (
                                                    <div className="flex -space-x-1.5 pl-1">
                                                        {panel.item.assignedUsers.map((u: any, idx: number) => (
                                                            <div key={u.id} className="w-7 h-7 rounded-full bg-indigo-500 border-[1.5px] border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm" style={{ zIndex: 100 - idx }} title={u.fullName}>{u.fullName.substring(0,2).toUpperCase()}</div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-gray-400 italic">Unassigned</span>
                                                )}
                                                <div className="relative ml-1">
                                                    <div className="w-7 h-7 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shadow-sm transition-colors group-hover:border-purple-400 group-hover:text-purple-500"><Plus size={14} strokeWidth={3}/></div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"><span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {panel.type === 'task' && (
                                <div className="flex-1 flex flex-col min-h-[120px]">
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'content' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Description</label>
                                    {panel.mode === 'add' ? (
                                        <textarea className="w-full flex-1 text-sm py-4 border-2 border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all resize-none shadow-sm" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '10px', paddingRight: '14px', paddingTop: '7px' }} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Add details, steps, notes..." />
                                    ) : activeField === 'content' ? (
                                        <div className="flex-1 flex flex-col">
                                            <textarea autoFocus className="w-full flex-1 text-sm py-4 border-2 border-purple-400 bg-purple-50 focus:outline-none transition-all resize-none shadow-sm" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '10px', paddingRight: '14px', paddingTop: '7px' }} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault} />
                                            <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Ctrl + Enter</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div className="group relative bg-white py-4 border-2 border-gray-100 hover:border-purple-200 flex-1 shadow-sm overflow-y-auto cursor-pointer transition-colors" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '10px', paddingRight: '14px', paddingTop: '7px' }} onDoubleClick={() => startEdit('content', panel.item.content === 'none' ? '' : panel.item.content)} onMouseEnter={() => dispatchHover('Task Description', 'Double click to edit details')} onMouseLeave={() => dispatchHover(null)} >
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed select-none">{panel.item?.content && panel.item.content !== 'none' ? panel.item.content : <span className="italic text-gray-400">No description provided.</span>}</p>
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"><span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {panel.type === 'task' && panel.mode === 'view' && (
                                <div className="flex flex-col gap-2 mt-2 border-t border-gray-200 pt-6">
                                    <label className="block font-bold uppercase tracking-wider mb-2 text-[10px] text-gray-400">Subtasks</label>
                                    <div className="flex flex-col gap-1.5">
                                        {panel.item?.subtasks?.map((subtask: any) => (
                                            <div key={subtask.id} className="group flex items-center gap-3 bg-white border border-gray-100 p-2 shadow-sm transition-colors hover:border-purple-200" style={{ borderRadius: DETAILS_FIELD_RADIUS }}>
                                                <button 
                                                    onClick={() => updateSubtask(subtask.id, { isDone: !subtask.isDone })}
                                                    className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border transition-colors ${subtask.isDone ? 'bg-purple-500 border-purple-500 text-white' : 'bg-gray-50 border-gray-300 text-transparent hover:border-purple-400'}`}
                                                >
                                                    <Check size={12} strokeWidth={3} />
                                                </button>
                                                <span className={`text-sm flex-1 break-words ${subtask.isDone ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                                                    {subtask.title}
                                                </span>
                                                <button 
                                                    onClick={() => removeSubtask(subtask.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all focus:outline-none p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-300 p-2 transition-colors focus-within:border-purple-400 focus-within:bg-white" style={{ borderRadius: DETAILS_FIELD_RADIUS }}>
                                            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-400">
                                                <Plus size={16} strokeWidth={2.5}/>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Add new subtask... (press Enter)"
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyDown={handleAddSubtask}
                                                className="flex-1 bg-transparent text-sm text-gray-700 outline-none font-medium placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {panel.type === 'column' && !isBacklogPanel && (
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'limit' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>WIP Limit</label>
                                    {panel.mode === 'add' ? (
                                        <select className="w-full text-sm font-bold border-2 border-gray-200 bg-white focus:outline-none shadow-sm cursor-pointer" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} value={formData.limit || 0} onChange={(e) => setFormData({...formData, limit: parseInt(e.target.value)})}>
                                            <option value={0}>None (No limit)</option> {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                        </select>
                                    ) : activeField === 'limit' ? (
                                        <div className="relative">
                                            <select ref={(el) => { if (el && !el.dataset.opened) { el.dataset.opened = 'true'; el.focus(); try { el.showPicker(); } catch (e) {} } }} className="w-full text-sm font-bold border-2 border-purple-400 bg-purple-50 focus:outline-none shadow-sm cursor-pointer" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '30px', height: '56px' }} value={editValue} onChange={(e) => setEditValue(parseInt(e.target.value))} onBlur={cancelEdit} onKeyDown={handleKeyDownDefault} >
                                                <option value={0}>None (No limit)</option> {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                            </select>
                                            <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Select and click <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Save</kbd> or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div className="group relative flex items-center bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} onDoubleClick={() => startEdit('limit', panel.item.limit)} onMouseEnter={() => dispatchHover('WIP Limit', 'Double click to edit maximum allowed tasks')} onMouseLeave={() => dispatchHover(null)} >
                                            <span className="text-sm font-bold text-gray-800 select-none">{panel.item.limit === 0 ? 'None (No limit)' : panel.item.limit}</span>
                                            <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"><span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isLockedPanel && (
                                <div>
                                    <label className={`block font-bold uppercase tracking-wider mb-2 ${panel.mode === 'add' || activeField === 'color' ? 'text-[10px] text-purple-600' : 'text-[10px] text-gray-400'}`}>Color</label>
                                    {panel.mode === 'add' ? (
                                        <div className="flex gap-3 flex-wrap items-center bg-white border-2 border-gray-200 shadow-sm" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}>
                                            {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(color => <button key={color} onClick={() => setFormData({...formData, color})} className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${formData.color === color ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: color }} /> )}
                                        </div>
                                    ) : activeField === 'color' ? (
                                        <div tabIndex={0} ref={el => el?.focus()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit(); }} onKeyDown={handleKeyDownDefault} className="outline-none">
                                            <div className="flex gap-3 flex-wrap items-center bg-purple-50 shadow-sm" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', minHeight: '56px', paddingTop: '6px', paddingBottom: '6px' }}>
                                                {['#ffffff', '#ffefd5', '#e0ffff', '#f0fff0', '#ffe4e1', '#e6e6fa'].map(c => <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => setEditValue(c)} onDoubleClick={(e) => { e.preventDefault(); setEditValue(c); setTimeout(() => saveEdit(c), 0); }} className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${editValue === c ? 'border-purple-500 ring-2 ring-purple-500/20 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} /> )}
                                            </div>
                                            <div className="text-[9px] text-purple-600 mt-1.5 font-bold">Click to preview, <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Double click</kbd> to save or <kbd className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">Esc</kbd> to discard</div>
                                        </div>
                                    ) : (
                                        <div className="group relative flex items-center gap-3 bg-white border-2 border-gray-100 hover:border-purple-200 shadow-sm cursor-pointer transition-colors" style={{ borderRadius: DETAILS_FIELD_RADIUS, paddingLeft: '14px', paddingRight: '14px', height: '56px' }} onDoubleClick={() => startEdit('color', panel.item.color)} onMouseEnter={() => dispatchHover('Label Color', 'Double click to change element color')} onMouseLeave={() => dispatchHover(null)} >
                                            <div className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner flex-shrink-0" style={{ backgroundColor: panel.item?.color || '#ffffff' }} />
                                            <span className="text-sm font-bold text-gray-800 select-none">Card Color</span>
                                            <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"><span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm select-none">Double click to edit</span></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {panel.mode === 'view' && panel.item?.createdAt && (
                                <div className="border-t border-gray-200 space-y-3" style={{ marginTop: 'auto', paddingTop: '20px', marginBottom: '10px' }}>
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 select-none"><span className="uppercase font-bold tracking-wider">Created</span><span className="font-semibold">{new Date(panel.item.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 select-none"><span className="uppercase font-bold tracking-wider">Last modified</span><span className="font-semibold">{new Date(panel.item.updatedAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div style={{ height: `${FOOTER_HEIGHT}px` }} className="flex border-t border-gray-200 bg-white flex-shrink-0">
                    {isLockedPanel ? (
                        <div style={{ width: `100%`, height: '100%', display: 'flex' }}>
                            {hasItems && (
                                <button onClick={() => setIsClearing(true)} className="flex-1 h-full flex items-center justify-center bg-white text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 border-r border-gray-200 transition-colors cursor-pointer rounded-none outline-none select-none">
                                    Clear Tasks
                                </button>
                            )}
                            <button onMouseDown={() => { closeBtnMouseDown.current = true; }} onMouseLeave={() => { closeBtnMouseDown.current = false; }} onClick={() => { if (closeBtnMouseDown.current) setPanel(prev => ({...prev, isOpen: false})); closeBtnMouseDown.current = false; }} className="flex-1 h-full flex items-center justify-center bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer rounded-none outline-none select-none" style={{ color:"white", backgroundColor:"#797979" }}>
                                <PanelLeftClose size={28}/>
                            </button>
                        </div>
                    ) : isDeleting ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-del" onClick={() => setIsDeleting(false)} className="w-full h-full flex items-center justify-center bg-white text-gray-600 hover:text-gray-900 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel"><X size={24}/></button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-del" onClick={confirmDelete} className="w-full h-full flex items-center justify-center bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer rounded-none outline-none select-none"><Trash2 size={18} className="mr-2"/> Confirm Delete</button>
                            </div>
                        </>
                    ) : isClearing ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-clear" onClick={() => setIsClearing(false)} className="w-full h-full flex items-center justify-center bg-white text-gray-600 hover:text-gray-900 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel"><X size={24}/></button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-clear" onClick={handleClearTasks} className="w-full h-full flex items-center justify-center bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer rounded-none outline-none select-none"><Trash2 size={18} className="mr-2"/> Confirm Clear</button>
                            </div>
                        </>
                    ) : showWipWarning ? (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                <button key="btn-cancel-wip" onClick={() => { setIsWipWarning(false); setPendingMove(null); }} className="w-full h-full flex items-center justify-center bg-white text-gray-600 hover:text-gray-900 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-none outline-none select-none" title="Cancel"><X size={24}/></button>
                            </div>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                <button key="btn-confirm-wip" onClick={() => { if (pendingMove) handleConfirmMove(); else { setIsWipWarning(false); handlePanelSaveGlobal(); } }} className="w-full h-full flex items-center justify-center bg-yellow-500 text-white text-xs font-bold hover:bg-yellow-600 transition-colors cursor-pointer rounded-none outline-none select-none"><Save size={18} className="mr-2"/> Proceed</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                                {panel.mode === 'add' ? (
                                    <button key="btn-cancel" onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="w-full h-full flex items-center justify-center bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors border-r border-gray-200 cursor-pointer rounded-none outline-none select-none">Cancel</button>
                                ) : activeField ? (
                                    <button key="btn-discard" onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }} className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 border-r border-gray-200 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer rounded-none outline-none select-none">Discard</button>
                                ) : (
                                    <button key="btn-delete" onClick={() => setIsDeleting(true)} className="w-full h-full flex items-center justify-center text-red-500 bg-red-50 hover:text-red-600 hover:bg-red-100 transition-colors border-r border-gray-200 cursor-pointer rounded-none outline-none select-none" title={`Delete ${panel.type}`}><Trash2 size={24}/></button>
                                )}
                            </div>

                            <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                                {panel.mode === 'add' ? (
                                    <button key="btn-add" onClick={handleAddClick} className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer rounded-none outline-none select-none"><Plus size={18} className="mr-2"/> Add</button>
                                ) : activeField ? (
                                    <button key="btn-save" onMouseDown={(e) => { e.preventDefault(); saveEdit(); }} className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer rounded-none outline-none select-none"><Save size={18} className="mr-2"/> Save</button>
                                ) : (
                                    <>
                                        {(panel.type === 'column' || panel.type === 'row') && hasItems && (
                                            <button key="btn-clear" onClick={() => setIsClearing(true)} className="flex-1 h-full flex items-center justify-center bg-white text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 border-r border-gray-200 transition-colors cursor-pointer rounded-none outline-none select-none">Clear Tasks</button>
                                        )}
                                        <button 
                                            key="btn-close" onMouseDown={() => { closeBtnMouseDown.current = true; }} onMouseLeave={() => { closeBtnMouseDown.current = false; }} onClick={() => { if (closeBtnMouseDown.current) setPanel(prev => ({...prev, isOpen: false})); closeBtnMouseDown.current = false; }} 
                                            className="flex-1 h-full flex items-center justify-center bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer rounded-none outline-none select-none" style={{ color:"white", backgroundColor:"#797979" }}
                                        >
                                            <PanelLeftClose size={28}/>
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