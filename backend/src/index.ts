import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import Redis from 'ioredis';
import axios from 'axios';
import { executeCode } from './codeRunner';
console.log("INDEX TS IS RUNNING !!!");

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    retryStrategy: () => null // Disable retry for local dev if missing
});
redis.on('error', () => { /* Suppress error if redis not running locally */ });


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cors());


app.get('/api/problems', async (req: Request, res: Response) => {
    try {
        const data = await prisma.problem.findMany();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch problems from database" });
    }
});

// Basic health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'CodeArena Backend is running' });
});

// API Routes handling the Problem dataset logic (moved from frontend API)
app.get('/api/problems/:id', async (req: Request, res: Response) => {
    try {
        const data = await prisma.problem.findUnique({
            where: { id: String(req.params.id) }
        });

        if (!data) return res.status(404).json({ error: "Problem not found" });
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch problem" });
    }
});

app.post('/api/run', async (req: Request, res: Response) => {
    try {
        const { language, code, testcases, problemId, isSubmit } = req.body;
        // Run code securely
        const responseData = await executeCode(language, code, testcases);

        // Save submission automatically to the database when submitting!
        if (isSubmit && problemId) {
            try {
                const status = responseData.success ? "Accepted" : "Wrong Answer";
                let defaultUser = await prisma.user.findFirst();
                
                // Fallback: Create a mock user if database is empty 
                if (!defaultUser) {
                    defaultUser = await prisma.user.create({
                        data: { username: "demo_user", email: "demo@codex.ai", password: "123" }
                    });
                }

                // Verify the problem exists in DB before saving
                const problemExists = await prisma.problem.findUnique({ where: { id: problemId } });
                if (problemExists) {
                    await prisma.submission.create({
                        data: {
                            code,
                            language,
                            status,
                            userId: defaultUser.id,
                            problemId,
                            runtime: (responseData as any).runtimeMs || null,
                            memory: 43.85 // Mock memory utilization
                        }
                    });
                }
            } catch (saveError) {
                console.error("Failed to save submission to database:", saveError);
            }
        }

        res.status(200).json(responseData);
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message || 'Execution failed' });
    }
});

// GET user submissions for a specific problem
app.get('/api/submissions/:problemId', async (req: Request, res: Response) => {
    try {
        const defaultUser = await prisma.user.findFirst();
        if (!defaultUser) return res.json([]);

        const submissions = await prisma.submission.findMany({
            where: {
                problemId: String(req.params.problemId),
                userId: defaultUser.id
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.json(submissions);
    } catch (error) {
        console.error("Failed to load submissions:", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
});

// app.post('/api/problems', async (req: Request, res: Response) => {
//     try {
//         const { title, description, difficulty, tags, acceptance } = req.body;
//         const problem = await prisma.problem.create({
//             data: {
//                 title,
//                 description,
//                 difficulty,
//                 tags: JSON.stringify(tags || []),
//                 acceptance: acceptance || 0
//             }
//         });
//         res.status(201).json(problem);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to create new problem" });
//     }
// });

// ----------------------------------------------------
// INTELLIGENCE ENGINES: EXPLORE LOGIC
// ----------------------------------------------------

// 1. GET /api/user/active-mission (Resume Mission)
app.get('/api/user/active-mission', async (req: Request, res: Response) => {
    // Mock user for MVP, normally from JWT session
    try {
        const defaultUser = await prisma.user.findFirst();
        if (!defaultUser) return res.status(404).json({ error: "No user found" });

        // Fetch real user mission data
        const activeMission = await prisma.userMission.findFirst({
            where: { userId: defaultUser.id, completed: false },
            include: { mission: true },
            orderBy: { id: 'desc' }
        });

        if (!activeMission) {
            return res.json({ status: "success", data: null, intelligence: "suggest_new_mission" });
        }

        const responseData = {
            mission_id: activeMission.missionId,
            title: activeMission.mission.title,
            current_level: activeMission.current_level,
            total_levels: activeMission.mission.total_levels,
            last_problem_status: "FAILED", // MVP mock
            accuracy: activeMission.accuracy,
            recent_activity_days_ago: 1 // MVP mock
        };

        // Decision logic evaluation
        let intelligenceAction = "continue_sequence";
        if (responseData.last_problem_status === "FAILED") {
            intelligenceAction = "show_easier_bridge";
        } else if (responseData.accuracy < 60) {
            intelligenceAction = "guided_mode_offered";
        } else if (responseData.recent_activity_days_ago > 3) {
            intelligenceAction = "recap_problem_suggested";
        }

        res.json({
            status: "success",
            data: responseData,
            intelligence: intelligenceAction
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch active mission" });
    }
});

// 2. GET /api/user/topic-stats (Strengthen DP Weakness Engine)
app.get('/api/user/topic-stats', async (req: Request, res: Response) => {
    try {
        const topic = req.query.topic as string || "dp";
        const defaultUser = await prisma.user.findFirst();

        let stats = null;
        if (defaultUser) {
            stats = await prisma.userTopicStat.findUnique({
                where: { userId_topic: { userId: defaultUser.id, topic } }
            });
        }

        // Fallback for MVP if user hasn't explicitly seeded this topic
        if (!stats) {
            stats = {
                accuracy: 54,
                avg_runtime_ratio: 1.4,
                common_error_type: "base_case_handling"
            } as any;
        } else {
            // Calculate accuracy from db stats
            (stats as any).accuracy = stats.total_attempted > 0 ? Math.round((stats.total_solved / stats.total_attempted) * 100) : 0;
        }

        let recommended_curriculum = [];
        if (stats.accuracy < 50) {
            recommended_curriculum = ["Easy DP Problem 1", "Easy DP Problem 2"];
        } else if (stats.accuracy <= 75) {
            recommended_curriculum = ["1 Medium Problem", "1 Tricky Edge Case"];
        } else {
            recommended_curriculum = ["Optimization DP Problem"];
        }

        res.json({ stats, recommended_curriculum });
    } catch (e) {
        res.status(500).json({ error: "Failed to load topic stats" });
    }
});

// 3. POST /api/speed-run/start (15 Min Speed Run Session)
app.post('/api/speed-run/start', async (req: Request, res: Response) => {
    try {
        const defaultUser = await prisma.user.findFirst();

        const startTime = Date.now();
        const endTime = startTime + (15 * 60 * 1000); // 15 mins

        const sessionPayload = {
            session_id: "sr_019x82y",
            target_time_mins: 15,
            end_time: endTime,
            problems_selected: [
                { id: "p1", target: "easy" },
                { id: "p2", target: "medium" }
            ]
        };

        // if (defaultUser && redis.status === "ready") {
        //     await redis.set(`speed_run:${defaultUser.id}`, JSON.stringify(sessionPayload), "EX", 15 * 60);
        // }

        res.json(sessionPayload);
    } catch (e) {
        res.status(500).json({ error: "Failed to start speed run" });
    }
});

// 4. GET /api/explore/surprise (Surprise Me Random Control)
app.get('/api/explore/surprise', async (req: Request, res: Response) => {
    // Implementing bounded randomness engine:
    // 40% weak, 30% medium, 20% trending, 10% stretch
    const rand = Math.random() * 100;
    let selectedReason = "";

    if (rand < 40) selectedReason = "Weak Topic (e.g. Graph)";
    else if (rand < 70) selectedReason = "Medium Difficulty";
    else if (rand < 90) selectedReason = "Trending Daily Problem";
    else selectedReason = "Stretch Problem (+200 Rating)";

    res.json({
        problem_id: 'mock_random_p99',
        reason: selectedReason
    });
});

// 5. GET /api/explore/recommendations (CORE INTELLIGENCE DASHBOARD)
app.get('/api/explore/recommendations', async (req: Request, res: Response) => {
    try {
        const defaultUser = await prisma.user.findFirst();
        let missionContext = "Crack Binary Search";
        let progressStr = "2/7";
        let dpAcc = 54;

        if (defaultUser) {
            const activeMission = await prisma.userMission.findFirst({
                where: { userId: defaultUser.id, completed: false },
                include: { mission: true }
            });
            if (activeMission) {
                missionContext = activeMission.mission.title;
                progressStr = `${activeMission.current_level}/${activeMission.mission.total_levels}`;
            }

            const dpStats = await prisma.userTopicStat.findUnique({
                where: { userId_topic: { userId: defaultUser.id, topic: "dp" } }
            });
            if (dpStats && dpStats.total_attempted > 0) {
                dpAcc = Math.round((dpStats.total_solved / dpStats.total_attempted) * 100);
            }
        }

        // Build the combined layout logic response based on user performance objects
        res.json({
            continue_mission: {
                id: "active",
                mission: missionContext,
                progress: progressStr
            },
            weak_topic: {
                target: "dp",
                accuracy: dpAcc
            },
            live_duel: {
                available: true,
                rating_proximity: "±100"
            },
            most_failed_today: {
                title: "Maximum Subarray",
                failure_rate: 0.68,
                common_mistake: "edge_cases"
            }
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch aggregated explore state" });
    }
});

// 6. POST /api/visualize/generate (Nano Banana Pro Img Proxy)
app.post('/api/visualize/generate', async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Simulating or calling the actual Gemini 2.5 Flash Image API
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'dummy_key';

        console.log(`[NanoBananaPro] Sending request to AI model: "${prompt}"`);

        let imageUrl = "/ai-viz-gen.png"; // Fallback

        try {
            // Only attempt the real API call if a key is present
            if (GEMINI_API_KEY !== 'dummy_key') {
                const response = await axios.post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
                    {
                        contents: [{
                            parts: [
                                { text: prompt }
                            ]
                        }]
                    },
                    {
                        headers: {
                            'x-goog-api-key': GEMINI_API_KEY,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Parse the inline base64 image data from the Gemini API response
                if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                    const inlineData = response.data.candidates[0].content?.parts?.[0]?.inlineData;
                    if (inlineData) {
                        imageUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;
                    }
                }
            } else {
                throw new Error("Missing GEMINI_API_KEY. Using mock.");
            }
        } catch (apiError: any) {
            console.log("[NanoBananaPro] API call failed or missing key. Falling back to dynamic mock generation.");
            // Determine fallback image based on prompt intelligence
            if (prompt.toLowerCase().includes("tree")) imageUrl = "/ai-viz-tree.png";
            else if (prompt.toLowerCase().includes("graph")) imageUrl = "/ai-viz-graph.png";
            else if (prompt.toLowerCase().includes("linked list")) imageUrl = "/ai-viz-linkedlist.png";
            else imageUrl = "/ai-viz-gen.png";
        }

        // Return successful simulated (or real) Nano Banana result
        res.json({ image_url: imageUrl, generated_model: "gemini-2.5-flash-image" });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to generate AI visualization via Nano Banana Pro" });
    }
});

// 7. POST /api/visualize/pseudocode (Dynamic Pseudocode Generation)
app.post('/api/visualize/pseudocode', async (req: Request, res: Response) => {
    try {
        const { problemTitle, tags } = req.body;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'dummy_key';

        let lines = [
            "Initialize starting variables",
            "Traverse the primary data structure",
            "Perform optimal logic evaluation",
            "Return formulated answer"
        ];

        if (GEMINI_API_KEY !== 'dummy_key') {
            try {
                const prompt = `Write exactly 5 to 7 short, simple lines of generic algorithmic pseudocode to dynamically map the optimal solution for a competitive programming problem titled "${problemTitle}" with tags [${tags || 'Algorithm'}]. Do not use markdown. Just return raw text separated by newlines. Start lines with spaces to show indentation if needed (e.g. loops or ifs).`;
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        contents: [{ parts: [{ text: prompt }] }]
                    },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const rawText = response.data.candidates[0].content.parts[0].text;
                    // Split the text by newline and clean up any stray markdown
                    lines = rawText.split('\n')
                        .map((l: string) => l.replace(/```/g, '').trimEnd())
                        .filter((l: string) => l.trim().length > 0);
                }
            } catch (apiError: any) {
                console.error("[Pseudocode Proxy] External API call failed, using fallback metrics.", apiError.response?.data || apiError.message);
            }
        } else {
            // Intelligent fallback matrix if no real key is present
            const t = ((problemTitle || "") + (tags || "")).toLowerCase();
            if (t.includes('tree')) {
                lines = [
                    "Perform Depth First Search (DFS)",
                    "IF node is NULL, return 0",
                    "Recursively calculate maxDepth(node.left)",
                    "Recursively calculate maxDepth(node.right)",
                    "Return 1 + MAX(left depth, right depth)"
                ];
            } else if (t.includes('list')) {
                lines = [
                    "Initialize 'prev' to NULL, 'current' to head",
                    "WHILE 'current' is NOT NULL:",
                    "     Store 'next = current.next'",
                    "     Reverse pointer: 'current.next = prev'",
                    "     Move 'prev' and 'current' forward",
                    "Return 'prev' as the new head"
                ];
            } else if (t.includes('graph')) {
                lines = [
                    "Initialize a queue 'Q' and a set 'visited'",
                    "Add starting node to 'Q' and 'visited'",
                    "WHILE 'Q' is NOT empty:",
                    "     Dequeue current node 'curr'",
                    "     FOR EACH neighbor of 'curr':",
                    "         IF neighbor NOT IN 'visited':",
                    "             Add neighbor to 'Q' and 'visited'"
                ];
            } else {
                lines = [
                    "Initialize an empty hash map 'seen'",
                    "Iterate over the array with index 'i' and value 'num'",
                    "Calculate complement = target - num",
                    "IF complement exists in 'seen':",
                    "     Return [seen[complement], i]",
                    "ELSE:",
                    "     Add num to 'seen' with index 'i'",
                    "Return empty array if no solution found"
                ];
            }
        }
        res.json({ lines });
    } catch (e) {
        console.error("Failed to generate pseudocode", e);
        res.status(500).json({ error: "Failed to generate dynamic pseudocode" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

