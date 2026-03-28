import React from 'react';
import { X, Info } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { useKanbanStore } from '../../../store/useKanbanStore';

interface TeamSidebarProps {
    showUsersBar: boolean;
    setShowUsersBar: (show: boolean) => void;
    filteredUserIds: number[];
    setFilteredUserIds: React.Dispatch<React.SetStateAction<number[]>>;
    hoverInfo: { title: string, subtitle: string } | null;
    setHoverInfo: React.Dispatch<React.SetStateAction<{ title: string, subtitle: string } | null>>;
    USERS_SIDEBAR_WIDTH: number;
}

const TeamSidebar: React.FC<TeamSidebarProps> = ({ 
    showUsersBar, setShowUsersBar, filteredUserIds, setFilteredUserIds, hoverInfo, setHoverInfo, USERS_SIDEBAR_WIDTH 
}) => {
    const { users, maxTasksPerUser } = useUserStore();
    const { columns } = useKanbanStore();

    return (
        <>
            {/* --- ZAKŁADKA DO WYSUWANIA SIDEBARA --- */}
            <button
                onClick={() => setShowUsersBar(!showUsersBar)}
                style={{ right: showUsersBar ? `${USERS_SIDEBAR_WIDTH}px` : '0px' }}
                className="absolute top-0 z-[100] flex items-center justify-center w-10 h-10 transition-all duration-300 ease-in-out bg-white text-gray-500 hover:text-blue-600 hover:bg-blue-50 shadow-sm outline-none rounded-l-xl border-y-2 border-l-2 border-r-0 border-gray-200"
                title="Toggle Team Panel"
            >
                <div className={`transition-transform duration-300 ${showUsersBar ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="15" y1="3" x2="15" y2="21"></line>
                        <polyline points="10 15 7 12 10 9"></polyline>
                    </svg>
                </div>
            </button>

            {/* --- PRAWY SIDEBAR USERÓW --- */}
            <aside 
                style={{ 
                    width: showUsersBar ? `${USERS_SIDEBAR_WIDTH}px` : '0px',
                    minWidth: showUsersBar ? `${USERS_SIDEBAR_WIDTH}px` : '0px',
                    opacity: showUsersBar ? 1 : 0
                }}
                className={`flex-shrink-0 flex flex-col bg-white transition-all duration-300 ease-in-out z-40 overflow-visible ${showUsersBar ? 'border-l-2 border-gray-200 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]' : ''}`}
            >
                <div style={{ width: `${USERS_SIDEBAR_WIDTH}px` }} className="flex flex-col h-full bg-gray-50/30 overflow-hidden">
                    <div style={{paddingTop: 15}} className="flex-1 overflow-y-auto pt-6 pb-4 flex flex-col items-center gap-5">
                        {users.map(u => {
                            const taskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === u.id).length;
                            const isOverLimit = taskCount >= maxTasksPerUser;
                            const isFiltered = filteredUserIds.includes(u.id);
                            const isAnyFilterActive = filteredUserIds.length > 0;
                            const isDimmed = isAnyFilterActive && !isFiltered;

                            return (
                                <div
                                    key={u.id}
                                    draggable={false} 
                                    onClick={() => setFilteredUserIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                    onDoubleClick={(e) => { e.stopPropagation(); setFilteredUserIds([u.id]); }}
                                    onMouseEnter={() => setHoverInfo({ title: u.fullName, subtitle: `${u.email} • ${taskCount}/${maxTasksPerUser} tasks assigned` })}
                                    onMouseLeave={() => setHoverInfo(null)}
                                    className={`group relative flex flex-col items-center gap-1 transition-all select-none cursor-pointer ${isDimmed ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
                                >
                                    <div 
                                        draggable={!isOverLimit}
                                        onDragStart={(e) => { 
                                            e.stopPropagation(); 
                                            e.dataTransfer.setData('text/plain', u.id.toString()); 
                                            e.dataTransfer.effectAllowed = 'copy'; 
                                            setHoverInfo(null);
                                        }}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-sm border-2 ${!isOverLimit ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'} ${isFiltered ? 'bg-blue-100 text-blue-700 border-blue-500 ring-4 ring-blue-500/20' : isOverLimit ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:-translate-y-1 hover:shadow-md transition-all'}`}
                                    >
                                        {u.fullName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className={`text-[10px] font-black ${isOverLimit ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {taskCount}/{maxTasksPerUser}
                                    </span>
                                </div>
                            );
                        })}
                        {users.length === 0 && <span className="text-[10px] text-gray-400 italic">No users</span>}
                        {filteredUserIds.length > 0 && (
                            <button 
                                onClick={() => setFilteredUserIds([])} 
                                onMouseEnter={() => setHoverInfo({ title: 'Clear Filters', subtitle: 'Show tasks from all users' })}
                                onMouseLeave={() => setHoverInfo(null)}
                                className="flex items-center justify-center mt-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default TeamSidebar;