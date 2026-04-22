import React from 'react';

const FAQ = () => {
    const faqs = [
        { 
            q: "How can I assign a user to a task?", 
            a: "You have two options. The first is classic assignment through task details (double click). The second is convenient Drag & Drop – grab a user icon from the bar at the top of the screen and drop it directly onto the card of the selected task." 
        },
        { 
            q: "What is a WIP Limit?", 
            a: "WIP (Work In Progress) Limit defines the maximum allowed number of tasks in a given column. When you exceed this value, the system will signal a bottleneck with a red column border." 
        },
        { 
            q: "Where can I find Dark Mode / Colorblind Mode settings?", 
            a: "All accessibility and theme settings can be found at the very bottom of the left navigation sidebar." 
        },
        { 
            q: "Does deleting a row also delete the tasks in it?", 
            a: "It's up to you! The system will intelligently ask whether you want to permanently delete all tasks, or temporarily move them to another row or the 'Unlabeled zone'." 
        }
    ];

    return (
        <div className="w-full h-full overflow-y-auto scrollbar-hide">
            <div className="min-h-full flex items-center justify-center py-8 px-4 md:px-8 pb-32">
                <div 
                    className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-base)] transition-colors duration-300 w-full max-w-3xl"
                    style={{ padding: '48px' }}
                >
                    <h1 className="text-4xl font-black text-[var(--accent-primary)] mb-10">Frequently Asked Questions</h1>
                    
                    <div className="space-y-8">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-[var(--border-base)] pb-8 last:border-0 last:pb-0">
                                <h3 className="text-xl font-bold text-[var(--text-main)] mb-3">{faq.q}</h3>
                                <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;