import Link from "next/link";
import { User, Trophy, BarChart2, Code2, Zap } from "lucide-react";

export default function MarketingNavbar() {
    return (
        <nav className="marketing-navbar">
            <div className="nav-left">
                <Link href="/" className="nav-logo" style={{ color: "var(--text-primary)" }}>
                    <Zap size={24} color="var(--accent-green)" />
                    CodeX
                </Link>
            </div>

            <div className="nav-right" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link href="/problems" className="nav-link" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <Code2 size={16} /> Problems
                </Link>
                <Link href="/contest" className="nav-link" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <Trophy size={16} /> Contests
                </Link>
                <Link href="/leaderboard" className="nav-link" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <BarChart2 size={16} /> Leaderboard
                </Link>
                <Link href="/profile" className="nav-link" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <User size={16} /> Profile
                </Link>
            </div>
        </nav>
    );
}
