import React from 'react';
import { Code2 } from 'lucide-react';

export default function PseudocodeVisualizer({ algorithmTitle, lines = [], hue = 0 }: { algorithmTitle: string, lines?: string[], hue?: number }) {
    if (!lines || lines.length === 0) {
        lines = [
            "Initialize scanning pointers",
            "Evaluate operational memory matrix",
            "Return mapped logic block"
        ];
    }

    return (
        <div style={{
            width: '100%',
            background: '#0d0d0d',
            border: '1px solid #333',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            filter: `hue-rotate(${hue}deg) saturate(1.3)`,
            transition: 'filter 0.5s ease-out',
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.2rem 1.5rem',
                background: '#141414',
                borderBottom: '1px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem'
            }}>
                <Code2 size={24} color="#ff007a" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#ff007a', letterSpacing: '0.5px' }}>
                    PSEUDOCODE: {algorithmTitle.toUpperCase()}
                </h3>
            </div>

            {/* Code Lines */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {lines.map((line, idx) => {
                    const isIndent = line.startsWith('     ');
                    const isControl = line.includes('IF ') || line.includes('ELSE') || line.includes('WHILE ') || line.includes('FOR ');
                    const finalLine = line.replace(/^\s+/, '');

                    return (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            paddingLeft: isIndent ? '2.5rem' : '0'
                        }}>
                            <span style={{
                                color: '#555',
                                fontSize: '0.8rem',
                                minWidth: '24px',
                                textAlign: 'right',
                                fontFamily: 'monospace',
                                fontWeight: 700
                            }}>
                                {idx + 1}
                            </span>
                            <div style={{
                                background: isIndent ? 'rgba(0, 210, 255, 0.05)' : (isControl ? 'rgba(255, 180, 0, 0.05)' : 'rgba(255, 0, 122, 0.05)'),
                                border: `1px solid ${isIndent ? 'rgba(0, 210, 255, 0.2)' : (isControl ? 'rgba(255, 180, 0, 0.2)' : 'rgba(255, 0, 122, 0.2)')}`,
                                borderRadius: '8px',
                                padding: '0.8rem 1.2rem',
                                color: isIndent ? '#00d2ff' : (isControl ? '#ffb400' : '#ff007a'),
                                fontFamily: 'monospace',
                                fontSize: '0.95rem',
                                flex: 1,
                                boxShadow: `0 0 15px ${isIndent ? 'rgba(0, 210, 255, 0.1)' : (isControl ? 'rgba(255, 180, 0, 0.1)' : 'rgba(255, 0, 122, 0.1)')}`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Subtle scanline effect on blocks */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'linear-gradient(rgba(255,255,255,0.02) 50%, transparent 50%)',
                                    backgroundSize: '100% 4px',
                                    pointerEvents: 'none'
                                }}></div>
                                <span style={{ position: 'relative', zIndex: 1 }}>{finalLine}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
