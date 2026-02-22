import React from 'react';

export default function NeonFlowchart({ algorithmTitle, hue = 0 }: { algorithmTitle: string, hue?: number }) {
    // Generate some dynamic text variations based on the title length or content
    const isSearch = algorithmTitle.toLowerCase().includes('search') || algorithmTitle.toLowerCase().includes('pointer');
    const isGraph = algorithmTitle.toLowerCase().includes('graph') || algorithmTitle.toLowerCase().includes('tree');

    return (
        <div style={{
            width: '100%',
            background: '#131313',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            padding: '2rem 1rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            filter: `hue-rotate(${hue}deg) saturate(1.2)`,
            transition: 'filter 0.5s ease-out'
        }}>

            {/* Grid background for cyberpunk feel */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                opacity: 0.3,
                zIndex: 0
            }}></div>

            {/* FLowchart Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', zIndex: 1, width: '100%' }}>

                {/* 1. Start Node */}
                <div style={{
                    padding: '0.8rem 2rem',
                    background: 'rgba(0, 255, 122, 0.1)',
                    border: '1px solid #00ff7a',
                    borderRadius: '8px',
                    color: '#00ff7a',
                    fontWeight: 600,
                    boxShadow: '0 0 15px rgba(0, 255, 122, 0.2)',
                    fontSize: '0.9rem',
                    letterSpacing: '1px'
                }}>
                    INITIALIZE: {isGraph ? "Data Nodes" : "Data Structures"}
                </div>

                {/* Arrow down */}
                <div style={{ height: '30px', width: '2px', background: 'linear-gradient(to bottom, #00ff7a, #00d2ff)' }}></div>

                {/* 2. Process Node */}
                <div style={{
                    padding: '0.8rem 2rem',
                    background: 'rgba(0, 210, 255, 0.1)',
                    border: '1px solid #00d2ff',
                    borderRadius: '4px',
                    color: '#00d2ff',
                    fontSize: '0.85rem'
                }}>
                    {isSearch ? "Iterate and evaluate logic mapping" : "Traverse and map memory footprint"}
                </div>

                {/* Arrow down */}
                <div style={{ height: '30px', width: '2px', background: 'linear-gradient(to bottom, #00d2ff, #ff007a)' }}></div>

                {/* 3. Decision Diamond (CSS diamond shape via rotation) */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
                    <div style={{
                        width: '120px', height: '120px',
                        background: 'rgba(255, 0, 122, 0.05)',
                        border: '1px solid #ff007a',
                        transform: 'rotate(45deg)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        boxShadow: '0 0 20px rgba(255, 0, 122, 0.2)'
                    }}>
                        <div style={{
                            transform: 'rotate(-45deg)',
                            color: '#ff007a',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            lineHeight: 1.2
                        }}>
                            TARGET<br />ACHIEVED?
                        </div>
                    </div>
                </div>

                {/* Branches Container */}
                <div style={{ display: 'flex', width: '100%', maxWidth: '400px', justifyContent: 'space-between', marginTop: '-60px' }}>

                    {/* Left path (FALSE) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                        {/* Horizontal out from diamond left vertex */}
                        <div style={{ display: 'flex', width: '100%', gap: 0 }}>
                            <div style={{ width: '50%', height: '2px' }}></div>
                            <div style={{ width: '50%', height: '2px', background: '#ff007a' }}></div>
                        </div>
                        <div style={{ width: '2px', height: '40px', background: '#ff007a', alignSelf: 'center' }}></div>

                        <div style={{
                            padding: '0.5rem 1rem',
                            background: '#1a1a1a',
                            border: '1px dashed #666',
                            borderRadius: '4px',
                            color: '#888',
                            fontSize: '0.75rem',
                            alignSelf: 'center',
                            textAlign: 'center'
                        }}>
                            NO: Cache state &amp;<br />Continue loop
                        </div>

                        {/* Artificial loopback arrow upward */}
                        <div style={{ display: 'flex', width: '100%', position: 'relative', height: 0 }}>
                            <div style={{ position: 'absolute', top: 0, left: '50%', width: '150px', height: '140px', borderLeft: '1px dashed #555', borderTop: '1px dashed #555', borderTopLeftRadius: '8px', zIndex: 0, transform: 'translateY(-180px) translateX(-50%)' }}></div>
                            <div style={{ position: 'absolute', top: '-183px', left: 'calc(50% + 145px)', width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid #555' }}></div>
                        </div>
                    </div>

                    {/* Right path (TRUE) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                        <div style={{ display: 'flex', width: '100%', gap: 0 }}>
                            <div style={{ width: '50%', height: '2px', background: 'linear-gradient(to right, #ff007a, #00ff7a)' }}></div>
                            <div style={{ width: '50%', height: '2px' }}></div>
                        </div>
                        <div style={{ width: '2px', height: '40px', background: '#00ff7a', alignSelf: 'center' }}></div>

                        <div style={{
                            padding: '0.6rem 1.5rem',
                            background: 'rgba(0, 255, 122, 0.1)',
                            border: '1px solid #00ff7a',
                            borderRadius: '20px',
                            color: '#00ff7a',
                            fontSize: '0.85rem',
                            alignSelf: 'center',
                            fontWeight: 700,
                            boxShadow: '0 0 15px rgba(0, 255, 122, 0.4)'
                        }}>
                            YES: Return optimal result
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
