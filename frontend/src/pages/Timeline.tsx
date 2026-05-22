import React from 'react';

const Timeline = () => {
  return (
    <div className="flex h-full flex-col bg-[var(--bg-page)] p-8 overflow-y-auto relative transition-colors duration-300">
      <div className="rounded-2xl bg-[var(--bg-card)] shadow-sm border border-[var(--border-base)] overflow-hidden transition-colors duration-300 flex-1 flex flex-col">
        
        <div className="px-6 pt-6 flex flex-col lg:flex-row items-start lg:items-center border-b border-[var(--border-base)] pb-6" style={{ padding: '24px' }}>
            <div className="w-full" style={{ paddingLeft: '5px' }}>
                <h2 className="text-lg font-bold text-[var(--text-main)]">Tasks Timeline</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Track the history, status updates, and progress of all tasks across the board.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;