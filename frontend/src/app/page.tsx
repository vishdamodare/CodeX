import Link from "next/link";
import { ArrowRight, Trophy, Zap, Users, Target, Code2, BarChart2 } from "lucide-react";
import MarketingNavbar from "@/components/MarketingNavbar";
import TypewriterText from "@/components/TypewriterText";

export default function LandingPage() {
    return (
        <div style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="marketing-page">
                <MarketingNavbar />

                <main className="hero-section">
                    <div className="hero-pill">
                        <Zap size={14} /> v2.0 &ndash; Real-Time Contests Now Live
                    </div>

                    <h1 className="hero-title" style={{ fontSize: '7rem', marginBottom: '1rem', marginTop: '1rem' }}>
                        CodeX
                    </h1>

                    <h2 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '3rem', letterSpacing: '0.05em' }}>
                        <TypewriterText text="Build By Coder , For Coder" />
                    </h2>

                    <p className="hero-subtitle">
                        The competitive programming arena built for speed. Practice problems, join live contests, and climb the global rankings.
                    </p>

                    <div className="hero-buttons">
                        <Link href="/problems" className="btn-lg btn-green">
                            Start Solving <ArrowRight size={18} />
                        </Link>
                        <Link href="/contest" className="btn-lg btn-outline">
                            <Trophy size={18} /> View Contests
                        </Link>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <Users size={24} className="stat-icon" />
                            <div className="stat-number">50K+</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-item">
                            <Target size={24} className="stat-icon" />
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Problems</div>
                        </div>
                        <div className="stat-item">
                            <Trophy size={24} className="stat-icon" />
                            <div className="stat-number">Weekly</div>
                            <div className="stat-label">Contests</div>
                        </div>
                    </div>
                </main>
            </div>

            <section className="bottom-section">
                <div className="feature-cards">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Code2 size={24} />
                        </div>
                        <h3 className="feature-title">500+ Problems</h3>
                        <p className="feature-desc">Curated challenges across all difficulty levels and topics.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Trophy size={24} />
                        </div>
                        <h3 className="feature-title">Live Contests</h3>
                        <p className="feature-desc">Compete in real-time with developers worldwide.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <BarChart2 size={24} />
                        </div>
                        <h3 className="feature-title">Real-Time Rankings</h3>
                        <p className="feature-desc">Watch the leaderboard update as submissions flow in.</p>
                    </div>
                </div>

                <div className="ready-section">
                    <h2 className="ready-title">Ready to compete?</h2>
                    <p className="ready-subtitle">Join thousands of developers sharpening their skills daily.</p>
                    <Link href="/problems" className="btn-lg btn-green" style={{ display: 'inline-flex', marginTop: '1rem' }}>
                        Enter the Arena <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
