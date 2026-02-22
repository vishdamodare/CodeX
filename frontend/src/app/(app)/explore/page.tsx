"use client";

import { useState, useEffect } from "react";
import { ArrowRight, BrainCircuit, Zap, Dices, ChevronRight, Swords, TrendingUp, Sparkles, X, Activity, Target, Timer, Trophy } from "lucide-react";

type ModalType = 'resume' | 'dp' | 'speed' | 'surprise' | 'path' | 'duel' | 'social' | null;

export default function MinimalExplore() {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [spinResult, setSpinResult] = useState<string | null>(null);

    const socialHighlights = [
        { title: "Maximum Subarray", stat: "Most Failed Today", color: "var(--accent-red)", bg: "rgba(239, 68, 68, 0.15)", detail: "68% failed edge cases / 42% TLE" },
        { title: "Two Sum", stat: "Fastest Solved (0.2s)", color: "var(--accent-blue)", bg: "rgba(14, 165, 233, 0.15)", detail: "Optimal approach: O(n) Hash Map" },
        { title: "Regular Expression", stat: "Trending Hot", color: "var(--accent-gold)", bg: "rgba(251, 191, 36, 0.15)", detail: "Requested by FAANG recruiters lately" },
    ];

    const [highlightIndex, setHighlightIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setHighlightIndex((prev) => (prev + 1) % socialHighlights.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [socialHighlights.length]);

    const activeSocial = socialHighlights[highlightIndex];

    const openModal = (type: ModalType) => {
        setActiveModal(type);
        if (type === 'surprise') {
            setSpinResult(null);
            setTimeout(() => {
                setSpinResult("Graph - Medium");
            }, 1000);
        }
    };

    return (
        <div className="minimal-workspace">
            {/* Ultra Minimal Header Box */}
            <div className="workspace-header">
                <h1 className="greeting-title">Good Evening, Vish.</h1>
                <p className="greeting-subtitle">What do you want to improve today?</p>
            </div>

            {/* Top: 1 Recommended Action */}
            <div className="primary-action-card" onClick={() => openModal('resume')}>
                <div>
                    <Sparkles size={32} color="var(--accent-green)" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Continue Your Journey</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                        You're 2 days away from cracking the Binary Search master template.
                    </p>
                </div>
                <button className="btn-primary-action" onClick={(e) => { e.stopPropagation(); openModal('resume'); }}>
                    Resume Mission <ArrowRight size={18} />
                </button>
            </div>

            {/* 3 Small Alternative Core Paths */}
            <div className="minimal-grid-3">
                <div className="minimal-action-btn" onClick={() => openModal('dp')}>
                    <BrainCircuit className="minimal-action-icon" style={{ color: "var(--accent-purple)" }} />
                    <span className="minimal-action-title">Strengthen DP</span>
                </div>
                <div className="minimal-action-btn" onClick={() => openModal('speed')}>
                    <Zap className="minimal-action-icon" style={{ color: "var(--accent-gold)" }} />
                    <span className="minimal-action-title">15-Min Speed Run</span>
                </div>
                <div className="minimal-action-btn" onClick={() => openModal('surprise')}>
                    <Dices className="minimal-action-icon" style={{ color: "var(--accent-blue)" }} />
                    <span className="minimal-action-title">Surprise Me</span>
                </div>
            </div>

            {/* Learning Paths Clean List */}
            <div>
                <div className="section-label">Learning Paths</div>

                <div className="path-card-minimal" onClick={() => openModal('path')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }}></div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>Binary Search</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Progress: 2/7</div>
                        </div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Continue <ChevronRight size={16} />
                    </div>
                </div>

                <div className="path-card-minimal" onClick={() => openModal('path')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-color)' }}></div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>Graph Expert</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>0/4</div>
                        </div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Start <ChevronRight size={16} />
                    </div>
                </div>
            </div>

            {/* Duel Workspace & Rotating Social View */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="duel-minimal-card" onClick={() => openModal('duel')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Swords size={20} color="var(--accent-gold)" />
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Live Duel Available</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating 1840 • 15 min</div>
                        </div>
                    </div>
                    <button style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); openModal('duel'); }}>
                        Accept
                    </button>
                </div>

                <div className="social-highlight-card" onClick={() => openModal('social')} style={{ borderColor: activeSocial.color, background: `linear-gradient(90deg, ${activeSocial.bg} 0%, transparent 100%)` }}>
                    <TrendingUp size={20} color={activeSocial.color} style={{ flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: activeSocial.color }}>{activeSocial.stat}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{activeSocial.title}</div>
                    </div>
                </div>
            </div>

            {/* DYNAMIC MODAL RENDER LOGIC */}
            {activeModal && (
                <div className="smart-modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="smart-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setActiveModal(null)}><X size={24} /></button>

                        {activeModal === 'resume' && (
                            <>
                                <div className="modal-title"><Target color="var(--accent-green)" /> Mission Overview</div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Current Level: Binary Search Trees</p>
                                <div className="stats-grid-mini">
                                    <div className="stats-box-mini">
                                        <div className="stats-box-val text-green">2/7</div>
                                        <div className="stats-box-lbl">Progress</div>
                                    </div>
                                    <div className="stats-box-mini">
                                        <div className="stats-box-val">15m</div>
                                        <div className="stats-box-lbl">Est. Time</div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px dashed rgba(34,197,94,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--accent-green)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Mini Mission Goal:</strong>
                                    Focus on upper-bound binary search pattern. Don't use standard bounds.
                                </div>
                                <button className="btn-primary-action" style={{ width: '100%', justifyContent: 'center' }}>Launch Challenge</button>
                            </>
                        )}

                        {activeModal === 'dp' && (
                            <>
                                <div className="modal-title"><Activity color="var(--accent-purple)" /> Your DP Stats</div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Diagnostic Weakness Repair</p>
                                <div className="stats-grid-mini">
                                    <div className="stats-box-mini">
                                        <div className="stats-box-val text-purple">54%</div>
                                        <div className="stats-box-lbl">Accuracy</div>
                                    </div>
                                    <div className="stats-box-mini">
                                        <div className="stats-box-val text-red">High</div>
                                        <div className="stats-box-lbl">TLE Frequency</div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '1rem', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                    <strong className="text-red">Common Mistake:</strong> Base case handling.
                                </div>
                                <button className="btn-primary-action" style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-purple)' }}>Start 20-Min Training</button>
                            </>
                        )}

                        {activeModal === 'speed' && (
                            <>
                                <div className="modal-title" style={{ justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem' }}><Zap color="var(--accent-gold)" /> Speed Mode</div>
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>1 Easy + 1 Medium • 15 Minute Target</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>3</div>
                                    <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>2</div>
                                    <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-gold)', textShadow: '0 0 20px rgba(251,191,36,0.4)' }}>1</div>
                                </div>
                                <button className="btn-primary-action" style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-gold)', color: 'black' }}>Begin Countdown</button>
                            </>
                        )}

                        {activeModal === 'surprise' && (
                            <>
                                <div className="modal-title"><Dices color="var(--accent-blue)" /> Controlled Exploration</div>
                                <p style={{ color: 'var(--text-secondary)' }}>AI weighted selection taking place...</p>

                                {!spinResult ? (
                                    <div className="spin-roulette">Spinning...</div>
                                ) : (
                                    <div className="spin-roulette" style={{ animation: 'none', color: 'var(--accent-green)' }}>{spinResult}</div>
                                )}

                                <button className="btn-primary-action" disabled={!spinResult} style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-blue)', color: 'white', opacity: spinResult ? 1 : 0.5 }}>Start Challenge</button>
                            </>
                        )}

                        {activeModal === 'path' && (
                            <>
                                <div className="modal-title"><BrainCircuit color="var(--text-primary)" /> Path Overview</div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Structured Milestone Journey</p>
                                <div className="stats-grid-mini" style={{ gridTemplateColumns: '1fr' }}>
                                    <div className="stats-box-mini" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Trees Intro</span> <span className="text-green">Done</span>
                                    </div>
                                    <div className="stats-box-mini" style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--accent-blue)', background: 'rgba(14,165,233,0.05)' }}>
                                        <span className="text-blue font-bold">DFS / Backtracking</span> <span className="text-blue">Current</span>
                                    </div>
                                    <div className="stats-box-mini" style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}>
                                        <span>Graph Dijkstra</span> <span>Locked</span>
                                    </div>
                                </div>
                                <button className="btn-primary-action" style={{ width: '100%', justifyContent: 'center', background: 'transparent', border: '1px solid white', color: 'white' }}>Switch to Guided Mode</button>
                            </>
                        )}

                        {activeModal === 'duel' && (
                            <>
                                <div className="modal-title" style={{ justifyContent: 'center' }}><Swords color="var(--accent-red)" /> Matching...</div>
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>Pinging users within Rating ±100</p>

                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)', marginBottom: '0.5rem' }} />
                                        <div style={{ fontWeight: 600 }}>You</div>
                                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>1840</div>
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-muted)' }}>VS</div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '2rem' }}>?</div>
                                        <div style={{ fontWeight: 600 }}>Searching</div>
                                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>...</div>
                                    </div>
                                </div>
                                <button className="btn-primary-action" style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-red)', color: 'white' }}>Cancel Search</button>
                            </>
                        )}

                        {activeModal === 'social' && (
                            <>
                                <div className="modal-title"><TrendingUp color={activeSocial.color} /> {activeSocial.stat}</div>
                                <p style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>{activeSocial.title}</p>

                                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Community Insight</strong>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.5 }}>
                                        {activeSocial.detail}
                                    </div>
                                </div>
                                <button className="btn-primary-action" style={{ width: '100%', justifyContent: 'center' }}>Explore Problem</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
