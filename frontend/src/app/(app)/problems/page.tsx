"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, AlertCircle, Clock, ChevronRight, Filter, Search, Flame, Wand2, X, Star, PlusCircle } from "lucide-react";

interface Problem {
    id: string;
    title: string;
    difficulty: string;
    acceptance: number;
    tags: string;
}

export default function ProblemsPage() {
    const router = useRouter();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTopic, setActiveTopic] = useState("All Topics");
    const [solvedIds, setSolvedIds] = useState<string[]>([]);
    const [starredIds, setStarredIds] = useState<string[]>([]);
    const [notedIds, setNotedIds] = useState<string[]>([]);
    const [notesMap, setNotesMap] = useState<Record<string, string>>({});
    const [activeNoteModal, setActiveNoteModal] = useState<{ id: string, title: string } | null>(null);
    const [currentNoteText, setCurrentNoteText] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("solvedProblems");
        if (stored) setSolvedIds(JSON.parse(stored));
        const storedStars = localStorage.getItem("starredProblems");
        if (storedStars) setStarredIds(JSON.parse(storedStars));
        const storedNotes = localStorage.getItem("notedProblems");
        if (storedNotes) setNotedIds(JSON.parse(storedNotes));
        const storedNotesMap = localStorage.getItem("problemNotesMap");
        if (storedNotesMap) setNotesMap(JSON.parse(storedNotesMap));
    }, []);

    const toggleStar = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newStars = starredIds.includes(id) ? starredIds.filter(x => x !== id) : [...starredIds, id];
        setStarredIds(newStars);
        localStorage.setItem("starredProblems", JSON.stringify(newStars));
    };

    const handleOpenNote = (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation();
        setActiveNoteModal({ id, title });
        setCurrentNoteText(notesMap[id] || "");
    };

    const handleSaveNote = () => {
        if (!activeNoteModal) return;
        const newMap = { ...notesMap };
        if (currentNoteText.trim()) {
            newMap[activeNoteModal.id] = currentNoteText;
        } else {
            delete newMap[activeNoteModal.id];
        }
        setNotesMap(newMap);
        localStorage.setItem("problemNotesMap", JSON.stringify(newMap));

        const newNotedIds = Object.keys(newMap);
        setNotedIds(newNotedIds);
        localStorage.setItem("notedProblems", JSON.stringify(newNotedIds));

        setActiveNoteModal(null);
    };

    useEffect(() => {
        fetch("http://localhost:5000/api/problems")
            .then(res => res.json())
            .then(data => {
                setProblems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load problems", err);
                setLoading(false);
            });
    }, []);



    // Placeholder data in case database is empty
    const displayProblems = problems.length > 0 ? problems : [
        { id: "1", title: "Two Sum", difficulty: "Easy", acceptance: 52.4, tags: "[\"Array\", \"Hash Table\"]", status: "solved" },
        { id: "2", title: "Add Two Numbers", difficulty: "Medium", acceptance: 41.2, tags: "[\"Linked List\", \"Math\"]", status: "attempted" },
        { id: "3", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", acceptance: 34.3, tags: "[\"String\", \"Sliding Window\"]", status: "unsolved" },
        { id: "4", title: "Median of Two Sorted Arrays", difficulty: "Hard", acceptance: 38.1, tags: "[\"Array\", \"Binary Search\"]", status: "unsolved" },
        { id: "5", title: "Longest Palindromic Substring", difficulty: "Medium", acceptance: 33.2, tags: "[\"String\", \"DP\"]", status: "unsolved" },
        { id: "6", title: "Regular Expression Matching", difficulty: "Hard", acceptance: 28.5, tags: "[\"String\", \"DP\"]", status: "unsolved" },
        { id: "7", title: "Container With Most Water", difficulty: "Medium", acceptance: 54.8, tags: "[\"Array\", \"Two Pointers\"]", status: "solved" },
        { id: "8", title: "Merge K Sorted Lists", difficulty: "Hard", acceptance: 51.1, tags: "[\"Linked List\", \"Divide and Conquer\", \"Heap\"]", status: "unsolved" },
        { id: "9", title: "Valid Parentheses", difficulty: "Easy", acceptance: 40.5, tags: "[\"String\", \"Stack\"]", status: "solved" },
        { id: "10", title: "Trapping Rain Water", difficulty: "Hard", acceptance: 60.1, tags: "[\"Array\", \"Two Pointers\", \"DP\", \"Stack\"]", status: "attempted" }
    ];

    const getStatusIcon = (problemId: string | number | undefined, staticStatus?: string) => {
        if (problemId && solvedIds.includes(problemId.toString())) {
            return <CheckCircle2 size={18} className="status-solved" style={{ color: "var(--accent-green)" }} />;
        }
        switch (staticStatus) {
            case "solved": return <CheckCircle2 size={18} className="status-solved" style={{ color: "var(--accent-green)" }} />;
            case "attempted": return <Clock size={18} className="status-attempted" style={{ color: "var(--accent-gold)" }} />;
            default: return <Circle size={18} className="status-icon" style={{ opacity: 0.3 }} />;
        }
    };

    const getDifficultyClass = (diff: string) => {
        if (!diff) return "";
        const d = diff.toLowerCase();
        if (d === "easy") return "text-green";
        if (d === "medium") return "text-gold";
        if (d === "hard") return "text-red";
        return "";
    };

    const getFilteredProblems = () => {
        let filtered = displayProblems;

        if (searchQuery.trim()) {
            filtered = filtered.filter((p: any) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (activeTopic !== "All Topics") {
            const t = activeTopic.toLowerCase();
            filtered = filtered.filter((p: any) => {
                const searchContext = ((p.title || "") + " " + (p.description || "")).toLowerCase();
                let parseSucces = false;
                try {
                    const tagsStr = typeof p.tags === 'string' ? p.tags : (p.tags ? JSON.stringify(p.tags) : "[]");
                    const tags: string[] = JSON.parse(tagsStr);
                    if (tags && tags.length > 0) {
                        parseSucces = true;
                        if (activeTopic === "Arrays & Hashing") return tags.includes("Array") || tags.includes("Hash Table");
                        if (activeTopic === "Trees") return tags.includes("Tree");
                        if (activeTopic === "Dynamic Programming") return tags.includes("DP") || tags.includes("Dynamic Programming");
                        return tags.includes(activeTopic);
                    }
                } catch {
                    // Ignore JSON parse errors and allow fallback search to run
                }

                if (!parseSucces) {
                    if (t === "arrays & hashing") return searchContext.includes("array") || searchContext.includes("hash");
                    if (t === "two pointers") return searchContext.includes("pointer");
                    if (t === "sliding window") return searchContext.includes("window");
                    if (t === "trees") return searchContext.includes("tree");
                    if (t === "dynamic programming") return searchContext.includes("dp") || searchContext.includes("dynamic");
                    return searchContext.includes(t);
                }
                return false;
            });
        }
        return filtered;
    };

    const filteredList = getFilteredProblems();

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Problem Set</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Solve challenges to increase your rank and master data structures.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="search-wrapper" style={{ width: 300 }}>
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="nav-search"
                            style={{ width: '100%' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 99, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <Filter size={16} /> Filters
                    </button>
                    <button className="btn-primary-action" style={{ padding: '0.5rem 1.5rem', margin: 0 }} onClick={() => {
                        const listToPickFrom = filteredList.length > 0 ? filteredList : displayProblems;
                        if (listToPickFrom.length > 0) {
                            const randomProblem = listToPickFrom[Math.floor(Math.random() * listToPickFrom.length)];
                            router.push(`/solve/${randomProblem.id}`);
                        }
                    }}>
                        Pick Random
                    </button>

                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {["All Topics", "Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Linked List", "Trees", "Tries", "Graph", "Dynamic Programming"].map(topic => (
                    <div
                        key={topic}
                        className={`topic-tag ${activeTopic === topic ? 'mode-active' : ''}`}
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                        onClick={() => setActiveTopic(topic)}
                    >
                        {topic}
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="problem-table">
                    <thead style={{ background: 'var(--bg-tertiary)' }}>
                        <tr>
                            <th style={{ width: '50px', textAlign: 'center' }}>Status</th>
                            <th style={{ width: '40%' }}>Title</th>
                            <th style={{ textAlign: 'center' }}>Note</th>
                            <th style={{ textAlign: 'center' }}>Revision</th>
                            <th>Difficulty</th>
                            <th>Acceptance</th>
                            <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.map((problem: any) => (
                            <tr key={problem.id} className="problem-row" onClick={() => router.push(`/solve/${problem.id}`)}>
                                <td style={{ textAlign: 'center' }}>
                                    {getStatusIcon(problem.id, problem.status)}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{problem.title}</div>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {(() => {
                                            if (!problem.tags) return null;
                                            try {
                                                const parsedTags = typeof problem.tags === 'string' ? JSON.parse(problem.tags) : problem.tags;
                                                if (Array.isArray(parsedTags)) {
                                                    return parsedTags.map((tag: string, idx: number) => (
                                                        <span key={idx} style={{ fontSize: '0.70rem', padding: '0.15rem 0.5rem', background: 'var(--bg-tertiary)', borderRadius: 12, color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{tag}</span>
                                                    ));
                                                }
                                            } catch (e) {
                                                // Handle comma separated strings if JSON parse fails
                                                return String(problem.tags).split(',').map((tag: string, idx: number) => (
                                                    <span key={idx} style={{ fontSize: '0.70rem', padding: '0.15rem 0.5rem', background: 'var(--bg-tertiary)', borderRadius: 12, color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{tag.trim()}</span>
                                                ));
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <PlusCircle
                                        size={18}
                                        color={notedIds.includes(problem.id) ? "#ff8c42" : "var(--text-muted)"}
                                        style={{ cursor: 'pointer', margin: '0 auto' }}
                                        onClick={(e) => handleOpenNote(e, problem.id, problem.title)}
                                    />
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <Star
                                        size={18}
                                        color={starredIds.includes(problem.id) ? "var(--accent-gold)" : "var(--text-muted)"}
                                        fill={starredIds.includes(problem.id) ? "var(--accent-gold)" : "transparent"}
                                        style={{ cursor: 'pointer', margin: '0 auto' }}
                                        onClick={(e) => toggleStar(e, problem.id)}
                                    />
                                </td>
                                <td className={getDifficultyClass(problem.difficulty)} style={{ fontWeight: 500 }}>
                                    {problem.difficulty ? problem.difficulty.toUpperCase() : "UNKNOWN"}
                                </td>
                                <td style={{ color: 'var(--text-secondary)' }}>
                                    {problem.acceptance}%
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                                    <ChevronRight color="var(--text-muted)" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}>1</button>
                <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', cursor: 'pointer' }}>2</button>
                <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}>3</button>
                <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>...</button>
                <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}>42</button>
            </div>

            {activeNoteModal && (
                <div className="modal-overlay" onClick={() => setActiveNoteModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Save Notes</h3>
                            <X size={20} style={{ cursor: 'pointer', color: '#888' }} onClick={() => setActiveNoteModal(null)} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Add quick notes for "{activeNoteModal.title}".
                        </p>
                        <textarea
                            value={currentNoteText}
                            onChange={(e) => setCurrentNoteText(e.target.value)}
                            placeholder="Write your thoughts, patterns, or reminders..."
                            className="note-textarea"
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setActiveNoteModal(null)}>Cancel</button>
                            <button className="btn-save" onClick={handleSaveNote}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: #121212;
                    border: 1px solid #2a2a2a;
                    border-radius: 12px;
                    width: 550px;
                    max-width: 90vw;
                    padding: 1.5rem 1.5rem 1.25rem 1.5rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .modal-header h3 {
                    color: #ff681c;
                    margin: 0;
                    font-size: 1.15rem;
                    font-weight: 600;
                }
                .note-textarea {
                    width: 100%;
                    height: 220px;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 1rem;
                    color: #eee;
                    font-family: 'Inter', sans-serif;
                    resize: none;
                    margin-bottom: 1.5rem;
                    font-size: 0.95rem;
                }
                .note-textarea:focus {
                    outline: none;
                    border-color: #555;
                }
                .modal-actions {
                    display: flex;
                    gap: 1rem;
                }
                .modal-actions button {
                    flex: 1;
                    padding: 0.70rem;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }
                .btn-cancel {
                    background: transparent;
                    color: #aaa;
                    border: 1px solid #333 !important;
                }
                .btn-cancel:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .btn-save {
                    background: #4a2c20;
                    color: #e8a07f;
                    border: 1px solid #4a2c20 !important;
                }
                .btn-save:hover {
                    background: #5a3627;
                    color: #ffb899;
                }
            `}</style>
        </div>
    );
}
