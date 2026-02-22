import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import util from 'util';

const execPromise = util.promisify(exec);

const TEMP_DIR = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const executeCode = async (language: string, code: string, testcases: any[]) => {
    const runId = uuidv4();
    let runnerCode = "";
    let executablePath = "";
    let runCommand = "";

    try {
        if (language === 'typescript') {
            const filePath = path.join(TEMP_DIR, `${runId}.ts`);
            runnerCode = `
${code}

const testcases = ${JSON.stringify(testcases)};
const results: any[] = [];

for (let i = 0; i < testcases.length; i++) {
    const { nums, target } = testcases[i];
    const start = process.hrtime.bigint();
    try {
        const out = twoSum(nums, target);
        const end = process.hrtime.bigint();
        results.push({
            caseIndex: i,
            passed: true,
            output: out,
            runtimeMs: Number(end - start) / 1000000
        });
    } catch(err: any) {
        results.push({
            caseIndex: i,
            passed: false,
            error: err.toString()
        });
    }
}
console.log('---RESULTS_START---');
console.log(JSON.stringify(results));
console.log('---RESULTS_END---');
`;
            fs.writeFileSync(filePath, runnerCode);
            runCommand = `npx tsx ${filePath}`;
            executablePath = filePath;

        } else if (language === 'javascript') {
            const filePath = path.join(TEMP_DIR, `${runId}.js`);
            // We append a basic test runner that executes the user's var twoSum function
            runnerCode = `
${code}

const testcases = ${JSON.stringify(testcases)};
const results = [];

for (let i = 0; i < testcases.length; i++) {
    const { nums, target } = testcases[i];
    const start = process.hrtime.bigint();
    try {
        const out = twoSum(nums, target);
        const end = process.hrtime.bigint();
        results.push({
            caseIndex: i,
            passed: true, // we will evaluate fully on the frontend or backend later
            output: out,
            runtimeMs: Number(end - start) / 1000000
        });
    } catch(err) {
        results.push({
            caseIndex: i,
            passed: false,
            error: err.toString()
        });
    }
}
console.log('---RESULTS_START---');
console.log(JSON.stringify(results));
console.log('---RESULTS_END---');
`;
            fs.writeFileSync(filePath, runnerCode);
            runCommand = `node ${filePath}`;
            executablePath = filePath;

        } else if (language === 'python') {
            const filePath = path.join(TEMP_DIR, `${runId}.py`);
            runnerCode = `
import sys, json, time
from typing import *

${code}

testcases = ${JSON.stringify(testcases).replace(/null/g, 'None')}
results = []
sol = Solution()

for i, tc in enumerate(testcases):
    start = time.time()
    try:
        out = sol.twoSum(tc['nums'], tc['target'])
        end = time.time()
        results.append({
            "caseIndex": i,
            "passed": True,
            "output": out,
            "runtimeMs": (end - start) * 1000
        })
    except Exception as e:
        results.append({
            "caseIndex": i,
            "passed": False,
            "error": str(e)
        })

print('---RESULTS_START---')
print(json.dumps(results))
print('---RESULTS_END---')
`;
            fs.writeFileSync(filePath, runnerCode);
            runCommand = `python3 ${filePath}`;
            executablePath = filePath;

        } else if (language === 'java') {
            const className = `Solution_${runId.replace(/-/g, '')}`;
            const mainClassName = `Main_${runId.replace(/-/g, '')}`;
            const filePath = path.join(TEMP_DIR, `${mainClassName}.java`);
            const userCode = code.replace(/class\s+Solution/g, `class ${className}`);

            runnerCode = `
import java.util.*;

${userCode}

public class ${mainClassName} {
    public static String arrayToString(int[] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < arr.length; i++) {
            sb.append(arr[i]);
            if (i < arr.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    public static void main(String[] args) {
        ${className} sol = new ${className}();
        System.out.println("---RESULTS_START---");
        System.out.print("[");
        long start, end;
        int[] out;
        
        ${testcases.map((tc, idx) => `
        try {
            int[] nums_${idx} = new int[]{${tc.nums.join(',')}};
            int target_${idx} = ${tc.target};
            start = System.nanoTime();
            out = sol.twoSum(nums_${idx}, target_${idx});
            end = System.nanoTime();
            System.out.print("{\\"caseIndex\\": ${idx}, \\"passed\\": true, \\"output\\": " + arrayToString(out) + ", \\"runtimeMs\\": " + ((end - start) / 1000000.0) + "}");
        } catch(Exception e) {
            System.out.print("{\\"caseIndex\\": ${idx}, \\"passed\\": false, \\"error\\": \\"" + e.toString().replace("\\\"", "\\\\\\\"") + "\\"}");
        }
        ${idx < testcases.length - 1 ? 'System.out.print(",");' : ''}
        `).join('\n')}
        
        System.out.println("]");
        System.out.println("---RESULTS_END---");
    }
}
`;
            fs.writeFileSync(filePath, runnerCode);
            runCommand = `javac ${filePath} && java -cp ${TEMP_DIR} ${mainClassName}`;
            executablePath = filePath;
        } else if (language === 'cpp') {
            const filePath = path.join(TEMP_DIR, `${runId}.cpp`);
            const outPath = path.join(TEMP_DIR, `${runId}.out`);
            runnerCode = `
#include <iostream>
#include <vector>
#include <string>
#include <chrono>

using namespace std;

${code}

int main() {
    Solution sol;
    cout << "---RESULTS_START---\\n[";
    ${testcases.map((tc, idx) => `
    {
        vector<int> nums = {${tc.nums.join(',')}};
        int target = ${tc.target};
        auto start = chrono::high_resolution_clock::now();
        try {
            vector<int> out = sol.twoSum(nums, target);
            auto end = chrono::high_resolution_clock::now();
            double time_taken = chrono::duration_cast<chrono::nanoseconds>(end - start).count() / 1e6;
            cout << "{\\"caseIndex\\": ${idx}, \\"passed\\": true, \\"output\\": [";
            for(size_t i=0; i<out.size(); ++i) {
                cout << out[i] << (i < out.size()-1 ? "," : "");
            }
            cout << "], \\"runtimeMs\\": " << time_taken << "}";
        } catch(...) {
            cout << "{\\"caseIndex\\": ${idx}, \\"passed\\": false, \\"error\\": \\"Exception thrown\\"}";
        }
    }
    ${idx < testcases.length - 1 ? 'cout << ",";' : ''}
    `).join('\n')}
    cout << "]\\n---RESULTS_END---" << endl;
    return 0;
}
`;
            fs.writeFileSync(filePath, runnerCode);
            runCommand = `c++ -std=c++11 -O2 ${filePath} -o ${outPath} && ${outPath}`;
            executablePath = outPath; // Simplification: we only delete executablePath in finally, ideally should delete .cpp too but OS temp handles it or we can ignore
        } else {
            return { error: "Language not supported yet in MVP" };
        }

        const { stdout, stderr } = await execPromise(runCommand, { timeout: 5000 });

        // Clean up temp files
        if (executablePath && fs.existsSync(executablePath)) fs.unlinkSync(executablePath);

        const outStr = stdout.toString();
        const startIdx = outStr.indexOf('---RESULTS_START---');
        const endIdx = outStr.indexOf('---RESULTS_END---');

        if (startIdx !== -1 && endIdx !== -1) {
            const rawJson = outStr.substring(startIdx + 19, endIdx).trim();
            return { success: true, results: JSON.parse(rawJson) };
        }

        if (stderr && stderr.trim().length > 0) {
            return { success: false, error: stderr };
        }

        return { success: false, error: "Execution completed but failed to parse results. Output: " + stdout };

    } catch (err: any) {
        if (executablePath && fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
        return {
            success: false,
            error: err.message || err.toString(),
            stderr: err.stderr ? err.stderr.toString() : null,
            stdout: err.stdout ? err.stdout.toString() : null,
            code: err.code
        };
    }
};
