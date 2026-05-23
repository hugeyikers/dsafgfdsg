import React, { useMemo, useState, useEffect } from 'react';
import { useKanbanStore } from '../store/useKanbanStore';

const formatLifespan = (totalDays: number) => {
    if (totalDays <= 0) return '0h';
    const days = Math.floor(totalDays);
    const hours = Math.round((totalDays - days) * 24);
    
    if (days === 0 && hours === 0) return '< 1h';
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days}d`;
    if (hours === 24) return `${days + 1}d`;
    return `${days}d ${hours}h`;
};

const Timeline = () => {
    const { columns = [], history = [], fetchBoard, fetchHistory } = useKanbanStore();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchBoard();
        fetchHistory();
    }, [fetchBoard, fetchHistory]);

    const allProcessedItems = useMemo(() => {
        const sourceData = history && history.length > 0 ? history : columns.flatMap(c => c.items);
        
        return sourceData
            .filter((item: any) => item.createdAt || item.changedAt)
            .map((item: any) => {
                const created = new Date(item.createdAt || item.changedAt);
                const updated = item.updatedAt ? new Date(item.updatedAt) : (item.completedAt ? new Date(item.completedAt) : new Date());
                
                const lifespanDays = item.lifespan !== undefined 
                    ? item.lifespan 
                    : Math.max(0, (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                
                return {
                    id: item.id,
                    title: item.title || item.taskTitle || 'Untitled Task',
                    dateObj: updated,
                    dateStr: updated.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    lifespan: lifespanDays
                };
            })
            .sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [columns, history]);

    useEffect(() => {
        if (allProcessedItems.length > 0 && !startDate && !endDate) {
            setStartDate(allProcessedItems[0].dateObj.toISOString().split('T')[0]);
            setEndDate(allProcessedItems[allProcessedItems.length - 1].dateObj.toISOString().split('T')[0]);
        }
    }, [allProcessedItems, startDate, endDate]);

    const chartData = useMemo(() => {
        let filtered = [...allProcessedItems];

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(d => d.dateObj >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(d => d.dateObj <= end);
        }

        const k = 3; 
        return filtered.map((item, index) => {
            const start = Math.max(0, index - k + 1);
            const subset = filtered.slice(start, index + 1);
            const sum = subset.reduce((acc, curr) => acc + curr.lifespan, 0);
            const movingAverage = sum / subset.length;
            
            return {
                ...item,
                movingAverage
            };
        });
    }, [allProcessedItems, startDate, endDate]);

    const scale = useMemo(() => {
        if (chartData.length === 0) return { maxLifespan: 1/24 };
        const actualMax = Math.max(...chartData.map(d => Math.max(d.lifespan, d.movingAverage)));
        const maxLifespan = Math.max(actualMax * 1.1, 1/24);
        return {
            maxLifespan
        };
    }, [chartData]);

    const isFilterActive = useMemo(() => {
        if (allProcessedItems.length === 0) return false;
        const defaultStart = allProcessedItems[0].dateObj.toISOString().split('T')[0];
        const defaultEnd = allProcessedItems[allProcessedItems.length - 1].dateObj.toISOString().split('T')[0];
        return startDate !== defaultStart || endDate !== defaultEnd;
    }, [allProcessedItems, startDate, endDate]);

    const handleResetFilter = () => {
        if (allProcessedItems.length > 0) {
            setStartDate(allProcessedItems[0].dateObj.toISOString().split('T')[0]);
            setEndDate(allProcessedItems[allProcessedItems.length - 1].dateObj.toISOString().split('T')[0]);
        }
    };

    const paddingX = 160; 
    const paddingTop = 70;
    const paddingBottom = 70;
    const width = 1100;
    const height = 550;

    const points = useMemo(() => {
        if (chartData.length === 0) return [];
        
        const chartWidth = width - paddingX * 2;
        const chartHeight = height - paddingTop - paddingBottom;
        
        return chartData.map((d, i) => {
            const x = paddingX + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2);
            const y = height - paddingBottom - (d.lifespan / scale.maxLifespan) * chartHeight;
            const maY = height - paddingBottom - (d.movingAverage / scale.maxLifespan) * chartHeight;
            
            return { ...d, x, y, maY };
        });
    }, [chartData, scale]);

    const maPathD = useMemo(() => {
        if (points.length < 2) return '';
        return points.reduce((path, p, i) => {
            return i === 0 ? `M ${p.x} ${p.maY}` : `${path} L ${p.x} ${p.maY}`;
        }, '');
    }, [points]);

    return (
        <div className="w-full h-full overflow-y-auto bg-[var(--bg-page)] scrollbar-hide flex justify-center py-16 px-6">
            <div 
                className="w-full max-w-6xl bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-sm m-auto flex flex-col"
                style={{ padding: '64px' }}
            >
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="text-3xl font-light tracking-wide text-[var(--text-main)] font-medium">
                        Timeline
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-2">
                        Evolution of task lifespans over completion dates compared with a moving average trend.
                    </p>
                </div>

                {chartData.length === 0 ? (
                    <div className="flex-1 min-h-[400px] flex items-center justify-center border-2 border-dashed border-[var(--border-base)] rounded-2xl flex-col gap-4">
                        <p className="text-sm text-[var(--text-muted)] italic">No tasks available to calculate timeline metrics in the selected range.</p>
                        {isFilterActive && (
                            <button 
                                onClick={handleResetFilter}
                                className="text-xs font-bold text-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] px-4 py-2 rounded-xl border border-transparent transition-colors"
                            >
                                Reset Date Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col w-full">
                        <div className="w-full overflow-x-auto scrollbar-hide pt-24 pb-4 px-10 -mt-16 -ml-10" style={{ width: 'calc(100% + 80px)' }}>
                            <svg 
                                viewBox={`0 0 ${width} ${height}`} 
                                className="w-full h-auto min-w-[900px] overflow-visible"
                            >
                                <g opacity="0.25">
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                        const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
                                        return (
                                            <line 
                                                key={i} 
                                                x1={paddingX} 
                                                y1={y} 
                                                x2={width - paddingX} 
                                                y2={y} 
                                                stroke="var(--text-main)" 
                                                strokeWidth="1" 
                                            />
                                        );
                                    })}
                                </g>

                                <g>
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                        const val = (1 - ratio) * scale.maxLifespan;
                                        return (
                                            <text 
                                                key={i} 
                                                x={paddingX - 15} 
                                                y={paddingTop + ratio * (height - paddingTop - paddingBottom) + 4} 
                                                textAnchor="end" 
                                                className="text-[11px] font-bold fill-[var(--text-muted)]"
                                            >
                                                {formatLifespan(val)}
                                            </text>
                                        );
                                    })}
                                    {/* Naprawiona pozycja napisu Lifespan */}
                                    <text 
                                        x={paddingX - 45} 
                                        y={paddingTop - 15} 
                                        className="text-[10px] font-black uppercase tracking-wider fill-[var(--text-muted)]"
                                    >
                                        Lifespan
                                    </text>
                                </g>

                                <g>
                                    {points.map((p, i) => {
                                        const showLabel = points.length <= 6 || i === 0 || i === points.length - 1 || (points.length > 6 && i === Math.floor(points.length / 2));
                                        if (!showLabel) return null;
                                        return (
                                            <text 
                                                key={i} 
                                                x={p.x} 
                                                y={height - paddingBottom + 25} 
                                                textAnchor="middle" 
                                                className="text-[10px] font-bold fill-[var(--text-muted)]"
                                            >
                                                {p.dateStr}
                                            </text>
                                        );
                                    })}
                                </g>

                                {maPathD && (
                                    <path 
                                        d={maPathD} 
                                        fill="none" 
                                        stroke="var(--text-main)" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        strokeDasharray="6 6"
                                        className="opacity-70"
                                    />
                                )}

                                <g>
                                    {points.map((p, i) => (
                                        <g key={i} className="group/node">
                                            <line 
                                                x1={p.x} 
                                                y1={height - paddingBottom} 
                                                x2={p.x} 
                                                y2={p.y} 
                                                stroke="var(--accent-primary)" 
                                                strokeWidth="2" 
                                                opacity="0.2"
                                            />
                                            {/* Powiększone kropki: r=7, hover:r=9 */}
                                            <circle 
                                                cx={p.x} 
                                                cy={p.y} 
                                                r="7" 
                                                className="fill-[var(--accent-primary)] stroke-[var(--bg-card)] stroke-[4px] cursor-pointer transition-all group-hover/node:r-9 group-hover/node:stroke-0"
                                            />
                                            
                                            <foreignObject 
                                                x={p.x - 140} 
                                                y={p.y - 160} 
                                                width="280" 
                                                height="150" 
                                                className="opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none z-50 overflow-visible"
                                            >
                                                <div className="w-full h-full flex flex-col items-center justify-end pb-3">
                                                    <div 
                                                        className="bg-gray-900/90 text-white text-[12px] rounded-xl shadow-lg text-center backdrop-blur-sm border border-white/10 w-max max-w-[260px]"
                                                        style={{ padding: '16px 20px' }}
                                                    >
                                                        <p className="font-bold whitespace-normal break-words leading-snug m-0">{p.title}</p>
                                                        <p className="opacity-80 mt-2 m-0 whitespace-nowrap">Lifespan: {formatLifespan(p.lifespan)}</p>
                                                    </div>
                                                </div>
                                            </foreignObject>
                                        </g>
                                    ))}
                                </g>
                            </svg>
                        </div>

                        <div className="mt-4 border-t border-[var(--border-base)] pt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 ml-1">From</label>
                                    <input 
                                        type="date" 
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border-2 border-[var(--border-base)] bg-[var(--bg-card)] text-[var(--text-main)] font-bold text-sm outline-none focus:border-[var(--accent-primary)] shadow-sm cursor-pointer transition-colors"
                                        style={{ borderRadius: '10px', padding: '10px 14px', height: '48px' }}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 ml-1">To</label>
                                    <input 
                                        type="date" 
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border-2 border-[var(--border-base)] bg-[var(--bg-card)] text-[var(--text-main)] font-bold text-sm outline-none focus:border-[var(--accent-primary)] shadow-sm cursor-pointer transition-colors"
                                        style={{ borderRadius: '10px', padding: '10px 14px', height: '48px' }}
                                    />
                                </div>
                                {isFilterActive && (
                                    <button 
                                        onClick={handleResetFilter}
                                        className="text-xs font-bold text-[var(--status-error)] hover:bg-[var(--status-error)]/10 px-4 h-[48px] rounded-xl border border-transparent hover:border-[var(--status-error)]/30 transition-colors self-end"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-8 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-[var(--accent-primary)] block"></span>
                                    <span className="text-xs font-semibold text-[var(--text-main)]">Task Lifespan</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-6 border-b-2 border-dashed border-[var(--text-main)] block opacity-70"></span>
                                    <span className="text-xs font-semibold text-[var(--text-main)]">Moving Average Trend</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timeline;