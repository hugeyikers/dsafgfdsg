import React from 'react';

const About = () => {
    const team = [
        { name: 'Jakub Klimas', role: 'Documentation' },
        { name: 'Piotr Ostaszewski', role: 'Frontend' },
        { name: 'Jakub Malinowski', role: 'Backend' },
        { name: 'Adrian Skamarski', role: 'Frontend' },
        { name: 'Radosław Matusiak', role: 'Graphic design / Backend' }
    ];

    return (
        <div className="w-full h-full overflow-y-auto bg-[var(--bg-page)] scrollbar-hide flex items-center justify-center p-6">
            <div 
                className="w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-sm m-auto"
                style={{ padding: '64px' }}
            >
                <div>
                    <section>
                        <h1 className="text-3xl font-light tracking-wide text-[var(--text-main)] font-medium" style={{ marginBottom: '40px' }}>
                            About
                        </h1>
                        <div className="space-y-8">
                            <p className="text-lg text-[var(--text-muted)] font-light leading-relaxed">
                                The advanced Kanban board project was developed in 2026 as part of the <span className="text-[var(--text-main)] font-medium">"Team Project"</span> course at the <span className="text-[var(--text-main)] font-medium">University of Warmia and Masury in Olsztyn</span>.
                            </p>
                            <p className="text-lg text-[var(--text-muted)] font-light leading-relaxed">
                                The application was created in collaboration with <span className="text-[var(--text-main)] font-medium">Billennium</span>, serving as a practical solution supporting agile task management, with a focus on interactivity and modern accessibility standards.
                            </p>
                        </div>
                    </section>

                    <section style={{ marginTop: '90px' }}>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-base)] pb-4 mb-8">
                            Project Team
                        </h2>
                        <ul className="space-y-6">
                            {team.map((member, i) => (
                                <li key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline group">
                                    <span className="text-lg font-medium text-[var(--text-main)]">
                                        {member.name}
                                    </span>
                                    <span className="text-sm text-[var(--text-muted)] tracking-wider uppercase mt-1 sm:mt-0 font-medium">
                                        {member.role}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default About;