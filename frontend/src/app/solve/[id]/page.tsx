"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play, Send, Settings, Sparkles, BookOpen, Code2, CheckCircle2, FlaskConical, LayoutTemplate, MessageSquare, ListTodo, FileCode2, Maximize2, TerminalSquare, Clock, Wand2, X, Database, Copy, Link2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// Mock problem type since our current backend Problem model strings tags
interface ProblemData {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    tags: string; // JSON array string
    acceptance: number;
}

const LANGUAGES = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" }
];

const DEFAULT_CODE: Record<string, string> = {
    javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
    python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
    java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
    cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
};

export default function SolvePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [problem, setProblem] = useState<ProblemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState("java");
    const [code, setCode] = useState(DEFAULT_CODE["java"]);
    const [activeTab, setActiveTab] = useState("description");
    const [activeCase, setActiveCase] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [runResults, setRunResults] = useState<any>(null);
    const [activeBottomTab, setActiveBottomTab] = useState("testcase");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStats, setSubmitStats] = useState<any>(null);
    const [editorialText, setEditorialText] = useState("");
    const [postedSolutions, setPostedSolutions] = useState<any[]>([]);
    const [pastSubmissions, setPastSubmissions] = useState<any[]>([]);

    const fetchSubmissions = () => {
        if (!id) return;
        fetch(`http://localhost:5001/api/submissions/${id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPastSubmissions(data);
            })
            .catch(err => console.error("Failed to load past submissions", err));
    };

    useEffect(() => {
        // Hydrate default code when language changes
        setCode(DEFAULT_CODE[language]);
    }, [language]);

    useEffect(() => {
        if (!id) return;

        const loadFallback = () => {
            setProblem({
                id: id,
                title: id === "1" ? "Two Sum" : "Example Problem",
                difficulty: "Easy",
                acceptance: 52.4,
                tags: '["Array", "Hash Table"]',
                description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.`
            });
            setLoading(false);
        };

        fetch(`http://localhost:5001/api/problems/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error || !data.title) {
                    console.log("No problem strictly found, using mock fallback.");
                    loadFallback();
                } else {
                    setProblem(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to load problem natively, falling back to mock", err);
                loadFallback();
            });

        // Load passed submissions on mount
        fetchSubmissions();
    }, [id]);

    const handleRun = async () => {
        if (!code.trim()) return;
        setIsRunning(true);
        setActiveBottomTab("result");
        setRunResults({ status: "running" });

        try {
            const res = await fetch("http://localhost:5001/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language,
                    code,
                    testcases: [
                        { nums: [2, 7, 11, 15], target: 9 },
                        { nums: [3, 2, 4], target: 6 },
                        { nums: [3, 3], target: 6 }
                    ]
                })
            });
            const data = await res.json();
            setRunResults(data);
        } catch (err) {
            setRunResults({ success: false, error: "Execution service unavailable" });
        } finally {
            setIsRunning(false);
        }
    };



    const handleSubmit = async () => {
        if (!code.trim()) return;
        setIsSubmitting(true);
        setRunResults({ status: "running" });

        try {
            const res = await fetch("http://localhost:5001/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language,
                    code,
                    problemId: id,
                    isSubmit: true,
                    testcases: [
                        { nums: [2, 7, 11, 15], target: 9 },
                        { nums: [3, 2, 4], target: 6 },
                        { nums: [3, 3], target: 6 }
                    ]
                })
            });
            const data = await res.json();

            if (data.success) {
                setSubmitStats({
                    success: true,
                    runtime: "0",
                    runtimeBeats: "100.00",
                    memory: "43.85",
                    memoryBeats: "80.76",
                    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
                    language,
                    code,
                    testcasesPassed: 133,
                    totalTestcases: 133
                });
                setActiveTab("accepted");

                try {
                    const stored = localStorage.getItem("solvedProblems");
                    let solvedArr = stored ? JSON.parse(stored) : [];
                    if (id && !solvedArr.includes(id)) {
                        solvedArr.push(id);
                        localStorage.setItem("solvedProblems", JSON.stringify(solvedArr));
                    }
                } catch (e) { }

                // Refresh submissions explicitly after submitting
                fetchSubmissions();
            } else {
                setRunResults(data);
                setActiveBottomTab("result");
            }
        } catch (err) {
            setRunResults({ success: false, error: "Execution service unavailable" });
            setActiveBottomTab("result");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--accent-green)' }}>Initializing Workspace...</div>;
    }

    const tags = (() => {
        try {
            return JSON.parse(problem?.tags || "[]");
        } catch {
            return [];
        }
    })();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflow: 'hidden' }}>

            {/* DEDICATED IDE NAVBAR */}
            <nav style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => router.push('/')}>
                        <Code2 size={24} color="var(--accent-green)" />
                        CodeX
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => router.push('/problems')}>
                        <ChevronLeft size={16} /> Problem List <ChevronRight size={16} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(34,197,94,0.2)', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: '0.2s', opacity: isRunning ? 0.5 : 1 }} onClick={handleRun} disabled={isRunning}>
                        <Play size={16} fill="currentColor" /> {isRunning ? "Running..." : "Run"}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-green)', color: '#000', border: 'none', padding: '0.4rem 1.25rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: '0.2s', opacity: isSubmitting ? 0.5 : 1 }} onClick={handleSubmit} disabled={isSubmitting}>
                        <Send size={16} /> {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>
                    <Settings size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                    <button className="btn-premium" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', marginLeft: '0.5rem' }}>
                        Premium
                    </button>
                </div>
            </nav>

            {/* SPLIT PANE WORKSPACE */}
            <div style={{ flex: 1, height: 'calc(100vh - 60px)', padding: '0.5rem' }}>
                <PanelGroup direction="horizontal">

                    {/* LEFT PANEL: DESCRIPTION */}
                    <Panel defaultSize={45} minSize={30}>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', height: '100%', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {/* Panel Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', overflowX: 'auto' }}>
                                <div className={`ide-tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>
                                    <FileCode2 size={16} className={activeTab === 'description' ? "text-green" : ""} /> Description
                                </div>
                                {submitStats && (
                                    <div className={`ide-tab ${activeTab === 'accepted' ? 'active' : ''}`} style={{ color: activeTab === 'accepted' ? 'var(--accent-green)' : 'var(--text-muted)' }} onClick={() => setActiveTab('accepted')}>
                                        <CheckCircle2 size={16} /> Accepted
                                        <div style={{ marginLeft: '0.4rem', padding: '0.1rem', display: 'flex', alignItems: 'center' }} onClick={(e) => { e.stopPropagation(); setSubmitStats(null); if (activeTab === 'accepted') setActiveTab('description'); }}>
                                            <X size={14} style={{ opacity: 0.7 }} />
                                        </div>
                                    </div>
                                )}
                                <div className={`ide-tab ${activeTab === 'editorial' ? 'active' : ''}`} onClick={() => setActiveTab('editorial')}>
                                    <BookOpen size={16} /> Editorial
                                </div>
                                <div className={`ide-tab ${activeTab === 'solutions' ? 'active' : ''}`} onClick={() => setActiveTab('solutions')}>
                                    <FlaskConical size={16} /> Solutions
                                </div>
                                <div className={`ide-tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
                                    <Clock size={16} /> Submissions
                                </div>
                                <div style={{ flex: 1 }} />
                            </div>

                            {/* Panel Content (Scrollable) */}
                            <div style={{ padding: '2rem 1.5rem', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
                                {activeTab === 'description' && (
                                    <>
                                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', minHeight: '34px' }}>
                                            {problem ? `${problem.id}. ${problem.title}` : <div style={{ height: '34px', width: '250px', background: 'var(--bg-tertiary)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />}
                                        </h1>

                                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                            {problem ? (
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem', background: problem.difficulty === 'Easy' ? 'rgba(34,197,94,0.1)' : problem.difficulty === 'Medium' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', color: problem.difficulty === 'Easy' ? 'var(--accent-green)' : problem.difficulty === 'Medium' ? 'var(--accent-gold)' : 'var(--accent-red)', borderRadius: '99px' }}>
                                                    {problem.difficulty}
                                                </span>
                                            ) : (
                                                <div style={{ height: '24px', width: '60px', background: 'var(--bg-tertiary)', borderRadius: '99px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                            )}

                                            {(() => {
                                                if (!problem || !problem.tags) return null;
                                                try {
                                                    const parsedTags = typeof problem.tags === 'string' ? JSON.parse(problem.tags) : problem.tags;
                                                    if (Array.isArray(parsedTags)) {
                                                        return parsedTags.map((tag: string, idx: number) => (
                                                            <span key={idx} className="ide-badge">{tag}</span>
                                                        ));
                                                    }
                                                } catch (e) {
                                                    return String(problem.tags).split(',').map((tag: string, idx: number) => (
                                                        <span key={idx} className="ide-badge">{tag.trim()}</span>
                                                    ));
                                                }
                                                return null;
                                            })()}
                                        </div>

                                        {problem ? (
                                            <div className="problem-description" style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.95rem' }} dangerouslySetInnerHTML={{ __html: problem.description }} />
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ height: '16px', background: 'var(--bg-tertiary)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', width: '100%' }} />
                                                <div style={{ height: '16px', background: 'var(--bg-tertiary)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', width: '100%' }} />
                                                <div style={{ height: '16px', background: 'var(--bg-tertiary)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', width: '80%' }} />
                                                <div style={{ height: '16px', background: 'var(--bg-tertiary)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', width: '90%', marginTop: '1rem' }} />
                                                <div style={{ height: '16px', background: 'var(--bg-tertiary)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', width: '60%' }} />
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'accepted' && submitStats && (
                                    <div style={{ color: 'var(--text-primary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setActiveTab('submissions')}>
                                                <ChevronLeft size={16} /> All Submissions
                                            </div>
                                            <Link2 size={16} style={{ cursor: 'pointer' }} />
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)', margin: 0 }}>Accepted</h2>
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{submitStats.testcasesPassed} / {submitStats.totalTestcases} testcases passed</span>
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(45deg, #ff007a, #7a00ff)', display: 'inline-block' }}></div>
                                                    <span style={{ fontWeight: 600, color: '#fff' }}>Vish Damodare</span> submitted at {submitStats.date}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => setActiveTab('editorial')} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                                    <BookOpen size={14} /> Editorial
                                                </button>
                                                <button onClick={() => setActiveTab('solutions')} style={{ background: 'var(--accent-green)', border: 'none', color: '#000', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                                    <FileCode2 size={14} /> Solution
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14} /> Runtime</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{submitStats.runtime} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>ms</span></span>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
                                                        Beats <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{submitStats.runtimeBeats}%</span> 🌿
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7a00ff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                                    <Sparkles size={14} /> Analyze Complexity
                                                </div>
                                            </div>

                                            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={14} /> Memory</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{submitStats.memory} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>MB</span></span>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
                                                        Beats <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{submitStats.memoryBeats}%</span> 🌿
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '2rem', position: 'relative', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', position: 'absolute', left: 0, bottom: '2rem', transform: 'translateY(50%)' }}>0%</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', position: 'absolute', left: 0, bottom: '50%', transform: 'translateY(50%)' }}>50%</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', position: 'absolute', left: 0, top: 0, transform: 'translateY(-50%)' }}>100%</div>

                                            <div style={{ borderBottom: '1px dotted rgba(255,255,255,0.1)', position: 'absolute', left: 35, right: 0, bottom: '50%' }} />
                                            <div style={{ borderBottom: '1px dotted rgba(255,255,255,0.1)', position: 'absolute', left: 35, right: 0, top: 0 }} />

                                            <div style={{ display: 'flex', width: '100%', marginLeft: '40px', alignItems: 'flex-end', height: '100%', gap: '1rem' }}>
                                                <div style={{ width: 40, height: '90%', background: '#0a84ff', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                                    <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(45deg, #ff007a, #7a00ff)', border: '2px solid #0a84ff' }}></div>
                                                </div>
                                                <div style={{ width: 40, height: '5%', background: '#0a84ff', borderRadius: '4px 4px 0 0', position: 'relative' }}><span style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>1ms</span></div>
                                                <div style={{ width: 40, height: '6%', background: '#0a84ff', borderRadius: '4px 4px 0 0', position: 'relative' }}><span style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>2ms</span></div>
                                                <div style={{ width: 40, height: '5%', background: '#0a84ff', borderRadius: '4px 4px 0 0', position: 'relative' }}><span style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>3ms</span></div>
                                                <div style={{ width: 40, height: '4%', background: '#0a84ff', borderRadius: '4px 4px 0 0', position: 'relative' }}><span style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>4ms</span></div>
                                            </div>
                                        </div>

                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', gap: '0.75rem' }}>
                                            Code <span style={{ color: 'var(--text-muted)' }}>|</span> <span style={{ color: 'var(--text-primary)' }}>{LANGUAGES.find(l => l.id === submitStats.language)?.name || "Language"}</span>
                                        </div>
                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                                <div style={{ color: 'var(--text-secondary)' }}><Code2 size={14} /></div>
                                                <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                                    <Copy size={14} style={{ cursor: 'pointer' }} />
                                                    <Maximize2 size={14} style={{ cursor: 'pointer' }} />
                                                </div>
                                            </div>
                                            <div style={{ padding: '1rem', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5, background: '#1e1e1e' }}>
                                                {submitStats.code}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'editorial' && (
                                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Share Your Approach</h2>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Write an editorial explaining your solution, time complexity, and submit your code to the community.</p>

                                        <textarea
                                            value={editorialText}
                                            onChange={(e) => setEditorialText(e.target.value)}
                                            placeholder="Explain your approach here... (e.g., We can use a hash map to tore indices...)"
                                            style={{
                                                width: '100%',
                                                minHeight: '200px',
                                                background: 'rgba(0,0,0,0.2)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                padding: '1rem',
                                                color: 'var(--text-primary)',
                                                fontFamily: 'inherit',
                                                fontSize: '0.95rem',
                                                resize: 'vertical',
                                                marginBottom: '1.5rem',
                                                outline: 'none',
                                                lineHeight: 1.6
                                            }}
                                        />

                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Attached Code</div>
                                            <div style={{ padding: '1rem', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: '200px', overflowY: 'auto' }}>
                                                {code}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => {
                                                    if (!editorialText.trim()) return;
                                                    setPostedSolutions(prev => [{
                                                        author: "Vish Damodare",
                                                        date: "Just now",
                                                        text: editorialText,
                                                        code: code,
                                                        language: LANGUAGES.find(l => l.id === language)?.name || language
                                                    }, ...prev]);
                                                    setEditorialText("");
                                                    setActiveTab('solutions');
                                                }}
                                                style={{ background: 'var(--accent-green)', color: '#000', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s' }}>
                                                <Send size={16} /> Post to Solutions
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'solutions' && (
                                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Community Solutions</h2>
                                            <button onClick={() => setActiveTab('editorial')} style={{ background: 'transparent', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                                + New Post
                                            </button>
                                        </div>

                                        {postedSolutions.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                                                <MessageSquare size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                                <p>No solutions posted yet.<br />Be the first to share your approach!</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                {postedSolutions.map((sol, idx) => (
                                                    <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                                                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(45deg, #ff007a, #7a00ff)' }}></div>
                                                                <div>
                                                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{sol.author}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sol.date}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ padding: '0.2rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '99px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                                {sol.language}
                                                            </div>
                                                        </div>
                                                        <div style={{ padding: '1.5rem' }}>
                                                            <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                                                {sol.text}
                                                            </div>
                                                            <div style={{ background: '#1e1e1e', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Code</div>
                                                                <div style={{ padding: '1rem', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', overflowX: 'auto', maxHeight: '300px' }}>
                                                                    {sol.code}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'submissions' && (
                                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Your Submissions</h2>
                                        {pastSubmissions.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                                                <Clock size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                                <p>No past submissions found for this problem.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {pastSubmissions.map((sub, idx) => (
                                                    <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', padding: '1rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <span style={{ fontWeight: 600, color: sub.status === 'Accepted' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                                    {sub.status}
                                                                </span>
                                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                                    {new Date(sub.createdAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                                {sub.language}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                            <span>Runtime: <span style={{ color: 'var(--text-primary)' }}>{sub.runtime ? `${sub.runtime}ms` : 'N/A'}</span></span>
                                                            <span>Memory: <span style={{ color: 'var(--text-primary)' }}>{sub.memory ? `${sub.memory}MB` : 'N/A'}</span></span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Panel>

                    {/* RESIZER */}
                    <PanelResizeHandle style={{ width: '8px', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ height: '24px', width: '4px', background: 'var(--border-color)', borderRadius: '2px' }}></div>
                    </PanelResizeHandle>

                    {/* RIGHT PANEL: CODE & TESTCASES */}
                    <Panel defaultSize={55} minSize={30}>
                        <PanelGroup direction="vertical">
                            {/* EDITOR PANE */}
                            <Panel defaultSize={70} minSize={30}>
                                <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', height: '100%', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                                <Code2 size={16} /> CODE
                                            </div>
                                            <select
                                                style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                            >
                                                {LANGUAGES.map(lang => (
                                                    <option key={lang.id} value={lang.id} style={{ background: 'var(--bg-primary)' }}>{lang.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                            <Settings size={14} style={{ cursor: 'pointer' }} />
                                            <Maximize2 size={14} style={{ cursor: 'pointer' }} />
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                                        <Editor
                                            height="100%"
                                            theme="vs-dark"
                                            language={language}
                                            value={code}
                                            onChange={(val) => setCode(val || "")}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                padding: { top: 16 },
                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                scrollBeyondLastLine: false,
                                                lineNumbersMinChars: 3,
                                                smoothScrolling: true,
                                                cursorBlinking: 'smooth',
                                                cursorSmoothCaretAnimation: 'on',
                                                formatOnPaste: true,
                                            }}
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <PanelResizeHandle style={{ height: '8px', cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '24px', height: '4px', background: 'var(--border-color)', borderRadius: '2px' }}></div>
                            </PanelResizeHandle>

                            {/* TESTCASE PANE */}
                            <Panel defaultSize={30} minSize={10}>
                                <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', height: '100%', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', padding: '0.5rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: activeBottomTab === 'testcase' ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: activeBottomTab === 'testcase' ? '2px solid var(--accent-green)' : '2px solid transparent', cursor: 'pointer' }} onClick={() => setActiveBottomTab('testcase')}>
                                                <CheckCircle2 size={16} /> Testcase
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: activeBottomTab === 'result' ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: activeBottomTab === 'result' ? '2px solid var(--accent-green)' : '2px solid transparent', cursor: 'pointer' }} onClick={() => setActiveBottomTab('result')}>
                                                <TerminalSquare size={16} /> Test Result
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
                                        {activeBottomTab === 'testcase' && (
                                            <>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                    {[0, 1, 2].map((i) => (
                                                        <button key={i} className={`testcase-tab ${activeCase === i ? 'active' : ''}`} onClick={() => setActiveCase(i)}>
                                                            Case {i + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>nums =</div>
                                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                                            {activeCase === 0 ? "[2, 7, 11, 15]" : activeCase === 1 ? "[3, 2, 4]" : "[3, 3]"}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>target =</div>
                                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                                            {activeCase === 0 ? "9" : activeCase === 1 ? "6" : "6"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {activeBottomTab === 'result' && (
                                            <div>
                                                {runResults?.status === "running" && <div style={{ color: 'var(--accent-gold)' }}>Executing code...</div>}
                                                {!runResults && <div style={{ color: 'var(--text-muted)' }}>You must run your code first.</div>}
                                                {runResults?.success === false && (
                                                    <div style={{ color: 'var(--accent-red)' }}>
                                                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Runtime Error / Compilation Error</h3>
                                                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                            {runResults.error}
                                                        </div>
                                                    </div>
                                                )}
                                                {runResults?.success === true && (
                                                    <div>
                                                        <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} /> Accepted</h3>
                                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                            {runResults.results?.map((res: any, i: number) => (
                                                                <button key={i} className={`testcase-tab ${activeCase === i ? 'active' : ''}`} onClick={() => setActiveCase(i)}>
                                                                    Case {i + 1} {res.passed ? "✔" : "✘"}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {runResults.results && runResults.results[activeCase] && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                                <div>
                                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Output</div>
                                                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                                                        {JSON.stringify(runResults.results[activeCase].output)}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Expected</div>
                                                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                                                        {activeCase === 0 ? "[0, 1]" : activeCase === 1 ? "[1, 2]" : "[0, 1]"}
                                                                    </div>
                                                                </div>
                                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Runtime: {runResults.results[activeCase]?.runtimeMs?.toFixed(2) || "N/A"} ms</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Panel>

                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </div>
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
}
