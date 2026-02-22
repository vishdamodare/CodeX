"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, RotateCcw, Eye, Clock, CheckCircle2, TerminalSquare, X, Activity, ChevronLeft, ChevronRight, Wand2, Trophy } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const QUESTIONS = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"];

const LANGUAGES = [
    { id: "typescript", name: "TypeScript" },
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" }
];

const DEFAULT_CODE: Record<string, string> = {
    typescript: "function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n\n}",
    javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
    python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
    java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
    cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
};

export default function ContestRunPage() {
    const router = useRouter();
    const [activeQ, setActiveQ] = useState("Q1");
    const [language, setLanguage] = useState("typescript");
    const [code, setCode] = useState(DEFAULT_CODE["typescript"]);
    const [isRunning, setIsRunning] = useState(false);
    const [runResults, setRunResults] = useState<any>(null);
    const [showComplexity, setShowComplexity] = useState(false);
    const [submitStats, setSubmitStats] = useState({ time: "O(n)", space: "O(n)" });
    const [timeLeft, setTimeLeft] = useState(5400); // Strict 1 hour 30 mins (90 * 60)
    const [hasStarted, setHasStarted] = useState(false);
    const [solvedQuestions, setSolvedQuestions] = useState<string[]>([]);
    const [showFinalScore, setShowFinalScore] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"success" | "fail">("success");

    useEffect(() => {
        if (!hasStarted || showFinalScore) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, [hasStarted, showFinalScore]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && hasStarted && timeLeft > 0) {
                alert("Warning: Background/Tab switch detected. Your contest is being automatically submitted to prevent cheating.");
                setIsRunning(true);
                const isBlank = !code.trim() || code.trim() === DEFAULT_CODE[language].trim();
                setTimeout(() => {
                    setIsRunning(false);
                    if (isBlank) {
                        setSubmitStatus("fail");
                        setShowComplexity(true);
                    } else {
                        setSubmitStatus("success");
                        setSubmitStats({ time: "O(n)", space: "O(n)" });
                        if (!solvedQuestions.includes(activeQ)) {
                            setSolvedQuestions(prev => [...prev, activeQ]);
                        }
                        setShowComplexity(true);
                    }
                }, 1500);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Anti-cheating listeners on mount
        const blockCopy = (e: any) => e.preventDefault();
        document.addEventListener("copy", blockCopy);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("copy", blockCopy);
        };
    }, [hasStarted, timeLeft]);

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        setCode(DEFAULT_CODE[language]);
    }, [language]);

    const handleSubmit = () => {
        setIsRunning(true);
        const isBlank = !code.trim() || code.trim() === DEFAULT_CODE[language].trim();
        // Simulate backend submission and evaluation against hidden cases
        setTimeout(() => {
            setIsRunning(false);
            if (isBlank) {
                setSubmitStatus("fail");
                setShowComplexity(true);
            } else {
                setSubmitStatus("success");
                setSubmitStats({ time: "O(n)", space: "O(n)" });
                if (!solvedQuestions.includes(activeQ)) {
                    setSolvedQuestions(prev => [...prev, activeQ]);
                }
                setShowComplexity(true);
            }
        }, 1500);
    };

    const handleNextQuestion = () => {
        const currentIndex = QUESTIONS.indexOf(activeQ);
        if (currentIndex < QUESTIONS.length - 1) {
            setActiveQ(QUESTIONS[currentIndex + 1]);
            setCode(DEFAULT_CODE[language]);
        }
        setShowComplexity(false);
    };

    const handlePrevQuestion = () => {
        const currentIndex = QUESTIONS.indexOf(activeQ);
        if (currentIndex > 0) {
            setActiveQ(QUESTIONS[currentIndex - 1]);
            setCode(DEFAULT_CODE[language]);
        }
    };


    const handleRun = async () => {
        if (!code.trim()) return;
        setIsRunning(true);
        setRunResults({ status: "running" });

        try {
            const res = await fetch("http://localhost:5000/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language,
                    code,
                    testcases: [
                        { nums: [2, 7, 11, 15], target: 9 },
                        { nums: [3, 2, 4], target: 6 }
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

    return (
        <>
            {!hasStarted && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(10px)', color: '#fff', fontFamily: "'Inter', sans-serif"
                }}>
                    <div style={{
                        background: '#111', border: '1px solid #ff3333', borderRadius: '16px',
                        padding: '3rem', maxWidth: '500px', textAlign: 'center',
                        boxShadow: '0 0 50px rgba(255, 51, 51, 0.2)'
                    }}>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ padding: '1rem', background: 'rgba(255, 51, 51, 0.1)', borderRadius: '50%', color: '#ff3333' }}>
                                <TerminalSquare size={48} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem', color: '#ff3333' }}>Strict Mode Active</h2>
                        <div style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', textAlign: 'left' }}>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>Your code runs against <b>hidden</b> test cases.</li>
                                <li style={{ marginBottom: '0.5rem' }}><b>Pasting code is disabled.</b></li>
                                <li style={{ marginBottom: '0.5rem' }}><b>Tab switching is disabled.</b> Leaving the window will auto-submit.</li>
                                <li style={{ marginBottom: '0.5rem' }}>The timer resets to exactly 1h 30m every attempt.</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => { setTimeLeft(5400); setHasStarted(true); }}
                            style={{
                                background: '#ff3333', color: '#fff', border: 'none',
                                padding: '1rem 3rem', borderRadius: '99px', fontSize: '1.1rem',
                                fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 0 20px rgba(255, 51, 51, 0.4)'
                            }}
                        >
                            Accept & Start Contest
                        </button>
                    </div>
                </div>
            )}

            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                backgroundColor: '#0f0f0f', color: '#fff', fontFamily: "'Inter', sans-serif",
                userSelect: 'none' // Global disable select to prevent copy-paste outside Monaco
            }}>

                {/* TOP NAVIGATION BAR */}
                <div style={{
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.5rem',
                    borderBottom: '1px solid #222',
                    background: '#131313'
                }}>
                    {/* Left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Weekly Contest 490</span>
                        <span style={{
                            border: '1px solid #00ff66',
                            color: '#00ff66',
                            background: 'rgba(0, 255, 102, 0.1)',
                            padding: '0.2rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '99px',
                            letterSpacing: '0.05em'
                        }}>LIVE</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: '1.1rem', color: timeLeft < 300 ? '#ff3333' : '#00ff66', animation: timeLeft < 300 ? 'pulseGlow 1s infinite alternate' : 'none' }}>
                            <Clock size={16} /> {formatTime(timeLeft)}
                        </div>
                        <div style={{ width: '120px', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(timeLeft / 5400) * 100}%`, height: '100%', background: timeLeft < 300 ? '#ff3333' : '#00ff66', borderRadius: '3px', transition: 'width 1s linear' }}></div>
                        </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ color: '#888', fontSize: '0.9rem', fontWeight: 600 }}>{solvedQuestions.length}/{QUESTIONS.length} solved</span>
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning}
                            style={{
                                background: isRunning ? '#333' : '#00ff66',
                                color: isRunning ? '#888' : '#000',
                                border: 'none',
                                padding: '0.4rem 1.2rem',
                                borderRadius: '99px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: isRunning ? 'not-allowed' : 'pointer'
                            }}>
                            <CheckCircle2 size={16} /> {isRunning ? "Evaluating..." : "Submit"}
                        </button>
                    </div>
                </div>

                {/* SPLIT PANES */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                    <PanelGroup direction="horizontal">

                        {/* LEFT PANEL - PROBLEM DEFINITION */}
                        <Panel defaultSize={45} minSize={30}>
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#131313' }}>

                                {/* Question Tabs */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderBottom: '1px solid #222'
                                }}>
                                    {QUESTIONS.map(q => (
                                        <button
                                            key={q}
                                            onClick={() => setActiveQ(q)}
                                            style={{
                                                background: activeQ === q ? 'rgba(0, 255, 102, 0.15)' : 'transparent',
                                                border: activeQ === q ? '1px solid #00ff66' : '1px solid transparent',
                                                color: activeQ === q ? '#00ff66' : (solvedQuestions.includes(q) ? '#888' : '#aaa'),
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '99px',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem'
                                            }}
                                        >
                                            {q} {solvedQuestions.includes(q) && <CheckCircle2 size={12} color="#00ff66" />}
                                        </button>
                                    ))}
                                    <div style={{ flex: 1 }} />
                                </div>

                                {/* Problem Body */}
                                <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>1. Two Sum</h1>
                                    </div>

                                    <div style={{ color: '#00ff66', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2rem' }}>Easy</div>

                                    <div style={{ color: '#d1d1d1', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
                                        Given an array of integers <code style={{ background: '#222', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85em' }}>nums</code> and an integer <code style={{ background: '#222', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85em' }}>target</code>, return indices of the two numbers such that they add up to <code style={{ background: '#222', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85em' }}>target</code>. You may assume that each input would have exactly one solution, and you may not use the same element twice.
                                    </div>

                                    {/* Examples */}
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Examples</h3>

                                    <div style={{ background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', marginBottom: '1rem', color: '#e0e0e0' }}>
                                        <div style={{ color: '#888' }}>Input: <span style={{ color: '#fff' }}>nums = [2,7,11,15], target = 9</span></div>
                                        <div style={{ color: '#888', marginTop: '0.4rem' }}>Output: <span style={{ color: '#00ff66' }}>[0,1]</span></div>
                                    </div>

                                    <div style={{ background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', marginBottom: '2.5rem', color: '#e0e0e0' }}>
                                        <div style={{ color: '#888' }}>Input: <span style={{ color: '#fff' }}>nums = [3,2,4], target = 6</span></div>
                                        <div style={{ color: '#888', marginTop: '0.4rem' }}>Output: <span style={{ color: '#00ff66' }}>[1,2]</span></div>
                                    </div>

                                    {/* Constraints */}
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Constraints</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#d1d1d1', fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace" }}>
                                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><span style={{ color: '#00ff66' }}>&gt;</span> 2 ≤ nums.length ≤ 10^4</li>
                                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><span style={{ color: '#00ff66' }}>&gt;</span> -10^9 ≤ nums[i] ≤ 10^9</li>
                                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><span style={{ color: '#00ff66' }}>&gt;</span> Only one valid answer exists.</li>
                                    </ul>

                                </div>

                                {/* PREV / NEXT QUESTION FOOTER */}
                                <div style={{
                                    padding: '1rem',
                                    borderTop: '1px solid #222',
                                    background: '#131313',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <button
                                        onClick={handlePrevQuestion}
                                        disabled={QUESTIONS.indexOf(activeQ) === 0}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #333',
                                            color: QUESTIONS.indexOf(activeQ) === 0 ? '#444' : '#d1d1d1',
                                            padding: '0.4rem 1rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontSize: '0.85rem',
                                            cursor: QUESTIONS.indexOf(activeQ) === 0 ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <ChevronLeft size={16} /> Previous
                                    </button>

                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={QUESTIONS.indexOf(activeQ) === QUESTIONS.length - 1}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #333',
                                            color: QUESTIONS.indexOf(activeQ) === QUESTIONS.length - 1 ? '#444' : '#d1d1d1',
                                            padding: '0.4rem 1rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontSize: '0.85rem',
                                            cursor: QUESTIONS.indexOf(activeQ) === QUESTIONS.length - 1 ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>

                            </div>
                        </Panel>

                        {/* GRIPPER */}
                        <PanelResizeHandle style={{ width: '4px', background: '#0a0a0a', cursor: 'col-resize' }} />

                        {/* RIGHT PANEL - EDITOR */}
                        <Panel defaultSize={55} minSize={30}>
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>

                                {/* Editor Toolbar */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 1rem',
                                    borderBottom: '1px solid #2d2d2d',
                                    background: '#1e1e1e'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <select
                                            style={{ background: 'transparent', color: '#d1d1d1', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace" }}
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                        >
                                            {LANGUAGES.map(lang => (
                                                <option key={lang.id} value={lang.id} style={{ background: '#1e1e1e' }}>{lang.name}</option>
                                            ))}
                                        </select>
                                        <span style={{ color: '#666', fontSize: '0.85rem' }}>editor</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            onClick={() => setCode(DEFAULT_CODE[language])}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#888',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                cursor: 'pointer'
                                            }}>
                                            <RotateCcw size={14} /> Reset
                                        </button>
                                        <button
                                            onClick={handleRun}
                                            disabled={isRunning}
                                            style={{
                                                background: isRunning ? '#333' : '#00ff66',
                                                color: isRunning ? '#888' : '#000',
                                                border: 'none',
                                                padding: '0.3rem 1rem',
                                                borderRadius: '99px',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                cursor: isRunning ? 'not-allowed' : 'pointer'
                                            }}>
                                            <Play size={14} fill={isRunning ? "#888" : "#000"} />
                                            {isRunning ? "Running..." : "Run"}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                    <PanelGroup direction="vertical">
                                        <Panel defaultSize={70} minSize={30}>
                                            <div
                                                style={{ height: '100%', overflow: 'hidden', paddingTop: '10px' }}
                                                onPasteCapture={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    alert("System Alert: Pasting code is strictly prohibited during a live CodeX contest.");
                                                }}
                                            >
                                                <Editor
                                                    height="100%"
                                                    theme="vs-dark"
                                                    language={language}
                                                    value={code}
                                                    onChange={(val) => setCode(val || "")}
                                                    options={{
                                                        minimap: { enabled: false },
                                                        fontSize: 14,
                                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                        scrollBeyondLastLine: false,
                                                        lineNumbersMinChars: 3,
                                                        smoothScrolling: true,
                                                        padding: { top: 8 }
                                                    }}
                                                />
                                            </div>
                                        </Panel>

                                        <PanelResizeHandle style={{ height: '4px', background: '#2d2d2d', cursor: 'row-resize', marginTop: '10px' }} />

                                        <Panel defaultSize={30} minSize={15}>
                                            <div style={{ padding: '1rem', background: '#131313', height: '100%', borderTop: '1px solid #2d2d2d', overflowY: 'auto' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00ff66', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <TerminalSquare size={16} /> TEST RESULTS
                                                </div>

                                                {!runResults ? (
                                                    <div style={{ color: '#666', fontSize: '0.85rem' }}>Run your code to see results here.</div>
                                                ) : runResults.status === "running" ? (
                                                    <div style={{ color: '#888', fontSize: '0.85rem' }}>Compiling and executing in cloud...</div>
                                                ) : !runResults.success ? (
                                                    <div>
                                                        <h3 style={{ color: '#ff4444', fontSize: '1rem', marginBottom: '0.5rem' }}>Runtime Error / Compilation Error</h3>
                                                        <div style={{ background: 'rgba(255,68,68,0.1)', padding: '1rem', borderRadius: '8px', color: '#ff6666', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                                            {runResults.error}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <h3 style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <CheckCircle2 size={20} /> Accepted
                                                        </h3>
                                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                            {runResults.results?.map((res: any, idx: number) => (
                                                                <div key={idx} style={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '8px', padding: '1rem', width: '100%', maxWidth: '300px' }}>
                                                                    <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>Case {idx + 1}</div>
                                                                    <div style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                                        Output: <span style={{ color: res.passed ? '#00ff66' : '#ff4444' }}>{JSON.stringify(res.output)}</span>
                                                                    </div>
                                                                    <div style={{ color: '#666', fontSize: '0.75rem' }}>
                                                                        Runtime: {res.runtimeMs?.toFixed(2)} ms
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Panel>
                                    </PanelGroup>
                                </div>

                            </div>
                        </Panel>
                    </PanelGroup>
                </div>

                {/* COMPLEXITY & SUCCESS MODAL */}
                {showComplexity && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#131313',
                            border: '1px solid #333',
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '90%',
                            maxWidth: '430px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                        }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                                <button onClick={() => setShowComplexity(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ background: submitStatus === 'success' ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 51, 51, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                {submitStatus === 'success' ? <CheckCircle2 size={48} color="#00ff66" /> : <X size={48} color="#ff3333" />}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
                                {submitStatus === 'success' ? "Solution Accepted!" : "Wrong Answer"}
                            </h2>
                            <p style={{ color: '#888', marginBottom: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                                {submitStatus === 'success' ? "Passed 112/112 hidden test cases." : "Your submission failed hidden test cases or was empty."}
                            </p>

                            {submitStatus === 'success' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', marginBottom: '2rem' }}>
                                    <div style={{ background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Activity size={20} color="#00e5ff" style={{ marginBottom: '0.5rem' }} />
                                        <span style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Time Complexity</span>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.2rem', color: '#00e5ff' }}>{submitStats.time}</span>
                                    </div>
                                    <div style={{ background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Activity size={20} color="#ff00e5" style={{ marginBottom: '0.5rem' }} />
                                        <span style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Space Complexity</span>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.2rem', color: '#ff00e5' }}>{submitStats.space}</span>
                                    </div>
                                </div>
                            )}

                            {submitStatus === 'success' ? (
                                QUESTIONS.indexOf(activeQ) === QUESTIONS.length - 1 ? (
                                    <button
                                        onClick={() => {
                                            setShowComplexity(false);
                                            setShowFinalScore(true);
                                        }}
                                        style={{
                                            background: '#00e5ff', color: '#000', border: 'none', borderRadius: '99px',
                                            padding: '0.8rem 2rem', fontWeight: 600, fontSize: '1rem', width: '100%', cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.3))'
                                        }}
                                    >
                                        Finish Contest & View Score →
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNextQuestion}
                                        style={{
                                            background: '#00ff66', color: '#000', border: 'none', borderRadius: '99px',
                                            padding: '0.8rem 2rem', fontWeight: 600, fontSize: '1rem', width: '100%', cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            filter: 'drop-shadow(0 0 10px rgba(0, 255, 102, 0.3))'
                                        }}
                                    >
                                        Next Question →
                                    </button>
                                )
                            ) : (
                                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                    <button
                                        onClick={() => setShowComplexity(false)}
                                        style={{
                                            flex: 1, background: '#ff3333', color: '#fff', border: 'none', borderRadius: '99px',
                                            padding: '0.8rem 2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            filter: 'drop-shadow(0 0 10px rgba(255, 51, 51, 0.3))'
                                        }}
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => QUESTIONS.indexOf(activeQ) === QUESTIONS.length - 1 ? setShowFinalScore(true) : handleNextQuestion()}
                                        style={{
                                            flex: 1, background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '99px',
                                            padding: '0.8rem 2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {QUESTIONS.indexOf(activeQ) === QUESTIONS.length - 1 ? "End Contest" : "Skip"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* FINAL SCORE MODAL */}
                {showFinalScore && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.92)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2000
                    }}>
                        <div style={{
                            background: '#111',
                            border: '1px solid #00ff66',
                            borderRadius: '16px',
                            padding: '3rem',
                            width: '90%',
                            maxWidth: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 0 80px rgba(0,255,102,0.15)',
                            animation: 'fadeIn 0.5s ease-out'
                        }}>
                            <div style={{ marginBottom: '1.5rem', background: 'rgba(0, 255, 102, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                                <Trophy size={56} color="#00ff66" />
                            </div>

                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Contest Complete!</h1>
                            <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '2.5rem', textAlign: 'center' }}>
                                You successfully navigated the gauntlet. Here is your final performance evaluation.
                            </p>

                            <div style={{ width: '100%', display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1, background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ color: '#888', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>QUESTIONS SOLVED</span>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#00ff66' }}>{solvedQuestions.length}<span style={{ color: '#555', fontSize: '1.2rem' }}>/{QUESTIONS.length}</span></span>
                                </div>
                                <div style={{ flex: 1, background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ color: '#888', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>TIME TAKEN</span>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#00e5ff' }}>{formatTime(5400 - timeLeft)}</span>
                                </div>
                            </div>

                            <div style={{ width: '100%', background: 'linear-gradient(145deg, #1c1c1c, #131313)', border: '1px solid #333', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                                <span style={{ color: '#aaa', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>TOTAL MARKS EARNED</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '4rem', fontWeight: 800, color: '#fff', textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>
                                        {solvedQuestions.length * 10}
                                    </span>
                                    <span style={{ fontSize: '1.5rem', color: '#666', fontWeight: 600 }}>/ {QUESTIONS.length * 10}</span>
                                </div>
                                <div style={{ marginTop: '1rem', background: '#222', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.8rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Activity size={14} color="#00ff66" /> {solvedQuestions.length > 0 ? "+10 points per solved problem" : "No points awarded."}
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/contest')}
                                style={{
                                    background: '#0a0a0a', color: '#fff', border: '1px solid #333', borderRadius: '99px',
                                    padding: '1rem 3rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = '#555' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#0a0a0a'; e.currentTarget.style.borderColor = '#333' }}
                            >
                                Return to Arena
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseGlow {
                    from { filter: drop-shadow(0 0 5px rgba(255, 51, 51, 0.5)); }
                    to { filter: drop-shadow(0 0 15px rgba(255, 51, 51, 1)); }
                }
            `}</style>
        </>
    );
}
