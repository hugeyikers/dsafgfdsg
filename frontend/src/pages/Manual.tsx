import React from 'react';
import { Download } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import userGuidePdf from '../../../docs/User Guide.pdf';

const Manual = () => {
    const { isDarkMode } = useThemeStore();

    return (
        <div className="w-full h-full overflow-y-auto bg-[var(--bg-page)] scrollbar-hide flex items-center justify-center p-6">
            <div 
                className="w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-sm m-auto flex flex-col"
                style={{ padding: '40px', minHeight: '85vh' }}
            >
                <div className="flex items-baseline justify-between" style={{ marginBottom: '40px' }}>
                    <h1 className="text-3xl font-light tracking-wide text-[var(--text-main)] font-medium">
                        User Guide
                    </h1>
                    <a 
                        href={userGuidePdf} 
                        download="User Guide.pdf"
                        className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                        title="Download PDF"
                    >
                        <Download size={22} />
                    </a>
                </div>

                <div 
                    className="flex-1 rounded-2xl border border-[var(--border-base)] relative transition-all duration-500 flex flex-col overflow-hidden"
                    style={{ 
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        padding: '24px'
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <span className="text-[var(--text-muted)] font-bold animate-pulse text-sm">Loading document...</span>
                    </div>

                    <iframe 
                        src={`${userGuidePdf}#toolbar=0&navpanes=0&view=FitH`} 
                        className="w-full flex-1 border-none relative z-10 transition-all duration-500 block"
                        style={{ 
                            backgroundColor: 'transparent',
                            colorScheme: isDarkMode ? 'dark' : 'light',
                            filter: isDarkMode 
                                ? 'invert(0.92) hue-rotate(180deg) brightness(1.05) contrast(0.95)' 
                                : 'none'
                        }}
                        title="User Guide PDF"
                    />
                </div>
            </div>
        </div>
    );
};

export default Manual;