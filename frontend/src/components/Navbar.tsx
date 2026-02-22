"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Flame, Bell, Sparkles, Zap } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link href="/" className="nav-logo">
                    <Zap size={24} color="var(--accent-green)" />
                    CodeX
                </Link>
                <div className="nav-links">
                    <Link href="/problems" className={`nav-link ${pathname === '/problems' ? 'active' : ''}`}>Problems</Link>
                    <Link href="/contest" className={`nav-link ${pathname === '/contest' ? 'active' : ''}`}>Contest</Link>
                    <Link href="/discuss" className={`nav-link ${pathname === '/discuss' ? 'active' : ''}`}>Discuss</Link>
                </div>
            </div>

            <div className="nav-right">
                <div className="search-wrapper">
                    <Search className="search-icon" size={16} />
                    <input type="text" placeholder="Search problems, contests..." className="nav-search" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
                    <Flame size={18} /> <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>14</span>
                </div>

                <Bell size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />

                <button className="btn-premium">
                    <Sparkles size={16} />
                    Premium
                </button>

                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" className="avatar" />
            </div>
        </nav>
    );
}
