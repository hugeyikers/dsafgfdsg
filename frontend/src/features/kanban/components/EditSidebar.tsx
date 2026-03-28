import React, { useState } from 'react';
import { Plus, Trash2, X, Save, LayoutPanelLeft } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';

type PanelType = 'task' | 'column' | 'row';
type PanelMode = 'view' | 'add'; 

interface EditSidebarProps {
    panel: { isOpen: boolean, type: PanelType, mode: PanelMode, item: any, extra?: any };
    setPanel: React.Dispatch<React.SetStateAction<{ isOpen: boolean, type: PanelType, mode: PanelMode, item: any, extra?: any }>>;
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
    handlePanelDelete: () => void;
    handleClearBacklogTasks: () => void;
    dispatchHover: (title: string | null, subtitle?: string) => void;
    onAssigneeDrop: (userId: number) => void;
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
    handlePanelSaveGlobal, handlePanelDelete, handleClearBacklogTasks, dispatchHover,
    onAssigneeDrop,
    SIDEBAR_WIDTH, SIDEBAR_LEFT_PADDING, SIDEBAR_RIGHT_PADDING, DETAILS_FIELD_RADIUS,
    FOOTER_HEIGHT, FOOTER_LEFT_RATIO, FOOTER_RIGHT_RATIO
}) => {
    const { users = [] } = useUserStore();
    const isBacklogPanel = panel.type === 'column' && panel.item?.title === 'Backlog';
    const closeBtnMouseDown = React.useRef(false);

    // Stany do Drag & Drop avatara prosto na sidebar
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
    };

    return (
        <aside 
            style={{ width: panel.isOpen ? `${SIDEBAR_WIDTH}px` : '0px' }}
            className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40 overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.05)] ${!panel.isOpen ? 'border-r-0' : ''}`}
        >
            <div style={{ width: `${SIDEBAR_WIDTH}px` }} className="flex flex-col h-full bg-gray-50/30">
                <div 
                    style={{ paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px`, height: 60, background: '#d9d9d9' }}
                    className="flex font-black items-center justify-between py-6 border-b border-gray-100 flex-shrink-0"
                >
                    <h3 className="text-lg text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <LayoutPanelLeft className="text-purple-500" size={20}/>
                        {panel.mode === 'add' ? 'Add' : 'Details'} {panel.type}
                    </h3>
                    <button onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <X size={25}/>
                    </button>
                </div>

                <div 
                    style={{ paddingTop: `20px`, paddingLeft: `${SIDEBAR_LEFT_PADDING}px`, paddingRight: `${SIDEBAR_RIGHT_PADDING}px` }}
                    className="flex-1 overflow-y-auto pb-6 flex flex-col gap-6"
                >
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
                                    <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- ASSIGNEE (Umożliwiono tu upuszczanie avatara) --- */}
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
                                    onMouseEnter={() => dispatchHover('WIP Limit', 'Double click to edit maximum allowed tasks')}
                                    onMouseLeave={() => dispatchHover(null)}
                                >
                                    <span className="text-sm font-bold text-gray-800">{panel.item.limit === 0 ? 'None (No limit)' : panel.item.limit}</span>
                                    <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                        <span className="text-[10px] italic text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm">Double click to edit</span>
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

                {/* STOPKA Z UNIKALNYMI KLUCZAMI - FIX DLA BŁĘDU DISCARD/DELETE */}
                <div style={{ height: `${FOOTER_HEIGHT}px` }} className="flex border-t border-gray-200 bg-white flex-shrink-0">
                    
                    <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_LEFT_RATIO}px`, height: '100%' }}>
                        {panel.mode === 'add' ? (
                            <button key="btn-cancel" onClick={() => setPanel(prev => ({...prev, isOpen: false}))} className="w-full h-full flex items-center justify-center bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors border-r border-gray-200">
                                Cancel
                            </button>
                        ) : activeField ? (
                            <button key="btn-discard" onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }} className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 border-r border-gray-200 text-xs font-bold hover:bg-red-100 transition-colors">
                                Discard
                            </button>
                        ) : panel.mode === 'view' && !isBacklogPanel ? (
                            <button key="btn-delete" onClick={handlePanelDelete} className="w-full h-full flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors border-r border-gray-200" title={`Delete ${panel.type}`}>
                                <Trash2 size={24}/>
                            </button>
                        ) : isBacklogPanel ? (
                            <button key="btn-clear" onClick={handleClearBacklogTasks} className="w-full h-full flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold transition-colors border-r border-gray-200">
                                Clear Tasks
                            </button>
                        ) : (
                            <div key="btn-empty-left" className="w-full h-full bg-gray-50 border-r border-gray-200"></div>
                        )}
                    </div>

                    <div style={{ width: `${SIDEBAR_WIDTH * FOOTER_RIGHT_RATIO}px`, height: '100%', display: 'flex' }}>
                        {panel.mode === 'add' ? (
                            <button key="btn-add" onClick={handlePanelSaveGlobal} className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                                <Plus size={18} className="mr-2"/> Add
                            </button>
                        ) : activeField ? (
                            <button key="btn-save" onMouseDown={(e) => { e.preventDefault(); saveEdit(); }} className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                                <Save size={18} className="mr-2"/> Save
                            </button>
                        ) : (
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
                                className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
                            >
                                Close Details
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default EditSidebar;