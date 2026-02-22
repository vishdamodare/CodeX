"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Zap, Clock, Bell, Clapperboard, Box } from "lucide-react";

export default function ContestPage() {
    const router = useRouter();
    const [hoveredWeekly, setHoveredWeekly] = useState(false);
    const [hoveredBiweekly, setHoveredBiweekly] = useState(false);
    const [notifiedWeekly, setNotifiedWeekly] = useState(false);
    const [notifiedBiweekly, setNotifiedBiweekly] = useState(false);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0d0d0d',
            backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '4rem 2rem',
            fontFamily: "'Inter', sans-serif"
        }}>
            <style>{`
                @keyframes floatCube {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulseInnerGlow {
                    0% { opacity: 0.6; filter: drop-shadow(0 0 40px var(--neon-color)); transform: scale(1); }
                    100% { opacity: 1; filter: drop-shadow(0 0 80px var(--neon-color)) drop-shadow(0 0 30px var(--neon-color)); transform: scale(1.05); }
                }
            `}</style>

            {/* HERO SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{
                    marginBottom: '1rem',
                    color: '#00ff66',
                    filter: 'drop-shadow(0 0 20px rgba(0, 255, 102, 0.5))'
                }}>
                    <Trophy size={64} strokeWidth={1.5} />
                </div>

                <h1 style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                    <span style={{ color: '#00ff66', textShadow: '0 0 30px rgba(0, 255, 102, 0.3)' }}>CodeX</span> Contest
                </h1>

                <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                    Compete weekly. Climb the ranks. Prove your code. 🚀
                </p>

                {/* STATS BAR */}
                <div style={{
                    display: 'flex',
                    background: '#141414',
                    border: '1px solid #222',
                    borderRadius: '16px',
                    padding: '1rem 3rem',
                    gap: '4rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Zap size={24} color="#00ff66" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600, letterSpacing: '0.05em' }}>ACTIVE CODERS</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>12.4K</span>
                        </div>
                    </div>

                    <div style={{ width: '1px', background: '#333' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Trophy size={24} color="#00e5ff" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600, letterSpacing: '0.05em' }}>CONTESTS HELD</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>490</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTEST CARDS GRID */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '960px',
                marginBottom: '4rem'
            }}>

                {/* GREEN CARD: WEEKLY CONTEST */}
                <div
                    onClick={() => router.push('/contest/run')}
                    onMouseEnter={() => setHoveredWeekly(true)}
                    onMouseLeave={() => setHoveredWeekly(false)}
                    style={{
                        background: '#151515',
                        border: hoveredWeekly ? '1px solid rgba(0, 255, 102, 0.4)' : '1px solid #222',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        cursor: 'pointer',
                        transform: hoveredWeekly ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: hoveredWeekly ? '0 20px 50px rgba(0, 255, 102, 0.15)' : 'none',
                        // @ts-ignore
                        '--neon-color': '#00ff66'
                    }}
                >
                    <div style={{
                        height: '240px',
                        background: hoveredWeekly
                            ? 'radial-gradient(circle at center, rgba(0, 255, 102, 0.25) 0%, #151515 80%)'
                            : 'radial-gradient(circle at center, rgba(0, 255, 102, 0.05) 0%, #151515 60%)',
                        borderBottom: '1px solid #222',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.5s ease'
                    }}>
                        {/* Status Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid #333',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '99px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#e0e0e0'
                        }}>
                            <Clock size={14} color="#00ff66" /> 09:01:43
                        </div>

                        {/* Animated Cube Layer */}
                        <div style={{
                            position: 'relative',
                            width: '160px', height: '160px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: hoveredWeekly ? 'floatCube 3s ease-in-out infinite' : 'none',
                            transition: 'all 0.5s ease'
                        }}>
                            {/* Outline State -> Fades out on hover */}
                            <Box
                                size={120}
                                color="#00ff66"
                                strokeWidth={1}
                                style={{
                                    position: 'absolute',
                                    opacity: hoveredWeekly ? 0 : 0.8,
                                    transition: 'opacity 0.3s ease',
                                    filter: 'drop-shadow(0 0 10px rgba(0,255,102,0.4))'
                                }}
                            />

                            {/* Glass Render State -> Fades in on hover */}
                            <Box
                                size={140}
                                color="#00ff66"
                                fill="rgba(0, 255, 102, 0.3)"
                                strokeWidth={1.5}
                                style={{
                                    position: 'absolute',
                                    opacity: hoveredWeekly ? 1 : 0,
                                    transition: 'opacity 0.5s ease',
                                    animation: hoveredWeekly ? 'pulseInnerGlow 2s ease-in-out infinite alternate' : 'none'
                                }}
                            />

                            {/* Center bright core light rendering */}
                            <div style={{
                                position: 'absolute',
                                width: '40px', height: '40px',
                                background: '#00ff66',
                                borderRadius: '50%',
                                filter: 'blur(30px)',
                                opacity: hoveredWeekly ? 0.8 : 0,
                                transition: 'opacity 0.5s ease'
                            }} />
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#111'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>Weekly Contest 490</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#888', fontSize: '0.85rem' }}>
                                <Clock size={14} /> Sun, Feb 22, 08:00 GMT+05:30
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setNotifiedWeekly(!notifiedWeekly);
                            }}
                            style={{
                                background: notifiedWeekly ? 'rgba(0, 255, 102, 0.1)' : '#1a1a1a',
                                border: notifiedWeekly ? '1px solid #00ff66' : '1px solid #333',
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: notifiedWeekly ? '#00ff66' : hoveredWeekly ? '#00ff66' : '#888',
                                boxShadow: notifiedWeekly ? '0 0 15px rgba(0,255,102,0.3)' : hoveredWeekly ? '0 0 15px rgba(0,255,102,0.2)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}>
                            <Bell size={18} fill={notifiedWeekly ? '#00ff66' : 'none'} />
                        </button>
                    </div>
                </div>

                {/* CYAN CARD: BIWEEKLY CONTEST */}
                <div
                    onMouseEnter={() => setHoveredBiweekly(true)}
                    onMouseLeave={() => setHoveredBiweekly(false)}
                    style={{
                        background: '#151515',
                        border: hoveredBiweekly ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid #222',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        cursor: 'pointer',
                        transform: hoveredBiweekly ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: hoveredBiweekly ? '0 20px 50px rgba(0, 229, 255, 0.15)' : 'none',
                        // @ts-ignore
                        '--neon-color': '#00e5ff'
                    }}
                >
                    <div style={{
                        height: '240px',
                        background: hoveredBiweekly
                            ? 'radial-gradient(circle at center, rgba(0, 229, 255, 0.25) 0%, #151515 80%)'
                            : 'radial-gradient(circle at center, rgba(0, 229, 255, 0.05) 0%, #151515 60%)',
                        borderBottom: '1px solid #222',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.5s ease'
                    }}>
                        {/* Status Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid #333',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '99px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#e0e0e0'
                        }}>
                            <Clock size={14} color="#00e5ff" /> 6d 21:01:43
                        </div>

                        {/* Animated Cube Layer */}
                        <div style={{
                            position: 'relative',
                            width: '160px', height: '160px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: hoveredBiweekly ? 'floatCube 3s ease-in-out infinite' : 'none',
                            transition: 'all 0.5s ease'
                        }}>
                            {/* Outline State -> Fades out on hover */}
                            <Box
                                size={120}
                                color="#00e5ff"
                                strokeWidth={1}
                                style={{
                                    position: 'absolute',
                                    opacity: hoveredBiweekly ? 0 : 0.8,
                                    transition: 'opacity 0.3s ease',
                                    filter: 'drop-shadow(0 0 10px rgba(0,229,255,0.4))'
                                }}
                            />

                            {/* Glass Render State -> Fades in on hover */}
                            <Box
                                size={140}
                                color="#00e5ff"
                                fill="rgba(0, 229, 255, 0.3)"
                                strokeWidth={1.5}
                                style={{
                                    position: 'absolute',
                                    opacity: hoveredBiweekly ? 1 : 0,
                                    transition: 'opacity 0.5s ease',
                                    animation: hoveredBiweekly ? 'pulseInnerGlow 2s ease-in-out infinite alternate' : 'none'
                                }}
                            />

                            {/* Center bright core light rendering */}
                            <div style={{
                                position: 'absolute',
                                width: '40px', height: '40px',
                                background: '#00e5ff',
                                borderRadius: '50%',
                                filter: 'blur(30px)',
                                opacity: hoveredBiweekly ? 0.8 : 0,
                                transition: 'opacity 0.5s ease'
                            }} />
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#111'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>Biweekly Contest 177</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#888', fontSize: '0.85rem' }}>
                                <Clock size={14} /> Sat, Feb 28, 20:00 GMT+05:30
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setNotifiedBiweekly(!notifiedBiweekly);
                            }}
                            style={{
                                background: notifiedBiweekly ? 'rgba(0, 229, 255, 0.1)' : '#1a1a1a',
                                border: notifiedBiweekly ? '1px solid #00e5ff' : '1px solid #333',
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: notifiedBiweekly ? '#00e5ff' : hoveredBiweekly ? '#00e5ff' : '#888',
                                boxShadow: notifiedBiweekly ? '0 0 15px rgba(0,229,255,0.3)' : hoveredBiweekly ? '0 0 15px rgba(0,229,255,0.2)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}>
                            <Bell size={18} fill={notifiedBiweekly ? '#00e5ff' : 'none'} />
                        </button>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#666',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
            }} className="hover:text-white">
                <Clapperboard size={16} /> Sponsor a Contest
            </div>

        </div>
    );
}
