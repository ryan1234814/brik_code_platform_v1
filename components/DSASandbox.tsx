import React, { useState, useEffect } from 'react';
import { Problem, Language, JudgeResult } from '../types';
import { executeCodeOnPiston } from '../services/pistonService';
import OutputConsole from './OutputConsole';
import { Play, RotateCcw, HelpCircle, Check, ArrowRight, Lightbulb, Loader2, CheckCircle2 } from 'lucide-react';
import { getSmartHint, getSolution } from '../services/geminiService';

interface Props {
  problem: Problem;
  onComplete: (score: number) => void;
  onSave: (code: string) => void;
  savedCode?: string;
}

const DSASandbox: React.FC<Props> = ({ problem, onComplete, onSave, savedCode }) => {
  const [language, setLanguage] = useState<Language>(Language.Python);
  const [code, setCode] = useState<string>('');
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [judgeResult, setJudgeResult] = useState<JudgeResult>({ status: 'Idle', passedCases: 0, totalCases: 0, logs: '' });
  const [hintLevel, setHintLevel] = useState(0);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isJudgeRunning, setIsJudgeRunning] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  // Initialize code: Use saved code if available, otherwise default
  useEffect(() => {
    if (savedCode) {
        setCode(savedCode);
    } else if (problem.initialCode && problem.initialCode[language]) {
      setCode(problem.initialCode[language] || '');
    } else {
      setCode('');
    }
    // Reset other states
    setLogs([]);
    setJudgeResult({ status: 'Idle', passedCases: 0, totalCases: 0, logs: '' });
    setHintLevel(0);
    setAiMessage(null);
    setIsSolved(false);
  }, [problem.id, language]); // Only reset if problem ID or language changes

  // Save on unmount (optional, but good practice)
  useEffect(() => {
      return () => {
          if (code) onSave(code);
      }
  }, [code, onSave]);

  const prepareCodeForJudge = (userCode: string, lang: Language): string => {
    const driver = problem.driverCode?.[lang] || '';
    
    if (lang === Language.Python) {
      return `${userCode}\n\n${driver}`;
    } else if (lang === Language.C) {
      return `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n${userCode}\n\n${driver}`;
    } else if (lang === Language.Java) {
      return `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n\n${userCode}\n\n${driver}`;
    }
    return userCode;
  };

  const handleRun = async () => {
    // Save current progress before running
    onSave(code);

    setConsoleOpen(true);
    setLogs(['>>> Queuing Submission to Judge...']);
    setJudgeResult({ status: 'Pending', passedCases: 0, totalCases: problem.testCases?.length || 0, logs: '' });
    setIsJudgeRunning(true);
    setIsSolved(false);

    if (!problem.testCases) {
        setIsJudgeRunning(false);
        return;
    }

    const finalSourceCode = prepareCodeForJudge(code, language);
    let passedCount = 0;
    const fullLogHistory: string[] = ['>>> Queuing Submission to Judge...'];
    let finalStatus: JudgeResult['status'] = 'AC';
    let totalTime = 0;

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg]);
        fullLogHistory.push(msg);
    };

    try {
      for (const [index, testCase] of problem.testCases.entries()) {
        const headerMsg = `\n>>> Running Test Case ${index + 1}/${problem.testCases.length}`;
        addLog(headerMsg);
        
        const startTime = performance.now();
        const result = await executeCodeOnPiston(language, finalSourceCode, testCase.input);
        const endTime = performance.now();
        totalTime += (endTime - startTime);

        if (result.compile && result.compile.code !== 0) {
            finalStatus = 'CE';
            addLog(`COMPILATION ERROR:\n${result.compile.stderr || result.compile.stdout}`);
            break;
        }
        
        if (result.run.code !== 0) {
             finalStatus = 'RE';
             addLog(`RUNTIME ERROR (Exit Code ${result.run.code}):\n${result.run.stderr}`);
             break;
        }

        const actualOutput = result.run.stdout.trim();
        const expectedOutput = testCase.expectedOutput.trim();

        addLog(`  Input:    ${testCase.input.replace(/\n/g, ' ')}`);
        addLog(`  Expected: ${expectedOutput}`);
        addLog(`  Output:   ${actualOutput}`);

        if (actualOutput === expectedOutput) {
          passedCount++;
          addLog(`  Result:   ✔ PASSED (${(endTime - startTime).toFixed(2)}ms)`);
        } else {
          finalStatus = 'WA';
          addLog(`  Result:   ✘ FAILED`);
          if (result.run.stderr) {
              addLog(`  Stderr:   ${result.run.stderr}`);
          }
          break;
        }
      }
    } catch (e: any) {
      finalStatus = 'RE';
      addLog(`System Execution Error: ${e.message}`);
    }

    setIsJudgeRunning(false);
    
    setJudgeResult({
      status: finalStatus,
      passedCases: passedCount,
      totalCases: problem.testCases.length,
      logs: fullLogHistory.join('\n'),
      time: `${totalTime.toFixed(2)}ms`
    });

    if (finalStatus === 'AC') {
      setIsSolved(true);
      onComplete(100);
      addLog('\n>>> 🎉 CONGRATULATIONS! All test cases passed.');
    }
  };

  const getHint = async () => {
    if (hintLevel >= 3) {
      setLoadingAI(true);
      const sol = await getSolution(problem);
      setAiMessage(`SOLUTION:\n${sol}`);
      setLoadingAI(false);
      return;
    }

    setLoadingAI(true);
    const nextLevel = hintLevel + 1;
    const hint = await getSmartHint(problem, code, nextLevel);
    setHintLevel(nextLevel);
    setAiMessage(`HINT (Level ${nextLevel}): ${hint}`);
    setLoadingAI(false);
  };

  return (
    <div className="flex flex-col h-full bg-background text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-secondary/20 bg-surface">
        <div>
          <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{problem.title}</h2>
              {isSolved && (
                  <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 font-bold animate-in fade-in zoom-in">
                      <CheckCircle2 size={12} /> SOLVED
                  </span>
              )}
          </div>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${
              problem.difficulty === 'Beginner' ? 'bg-accent/20 text-accent' :
              problem.difficulty === 'Intermediate' ? 'bg-warning/20 text-warning' :
              'bg-danger/20 text-danger'
            }`}>{problem.difficulty}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Language:</span>
            <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-black/30 border border-secondary/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary text-gray-200"
            >
                <option value={Language.Python}>Python 3.10</option>
                <option value={Language.Java}>Java 15</option>
                <option value={Language.C}>C (GCC)</option>
            </select>
          </div>

          <button 
            onClick={getHint} 
            disabled={loadingAI}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-warning/30 text-warning hover:bg-warning/10 text-sm transition-colors disabled:opacity-50"
          >
            {loadingAI ? <Loader2 size={14} className="animate-spin" /> : hintLevel >= 3 ? <span className="flex items-center gap-1"><Lightbulb size={14}/> Show Solution</span> : <span className="flex items-center gap-1"><HelpCircle size={14}/> Hint ({3 - hintLevel} left)</span>}
          </button>

          <button 
            onClick={handleRun}
            disabled={isJudgeRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all shadow-lg ${
                isJudgeRunning 
                ? 'bg-secondary cursor-not-allowed text-gray-300' 
                : isSolved ? 'bg-accent hover:bg-emerald-600 text-white shadow-accent/20' : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
            }`}
          >
            {isJudgeRunning ? (
                <>
                    <Loader2 size={16} className="animate-spin" /> Running...
                </>
            ) : (
                <>
                    <Play size={16} fill="currentColor" /> {isSolved ? 'Run Again' : 'Run Code'}
                </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Problem Description Side */}
        <div className="w-1/3 p-6 overflow-y-auto border-r border-secondary/20 bg-surface/50">
          <h3 className="text-lg font-semibold mb-4 text-white">Description</h3>
          <p className="text-gray-300 mb-6 leading-relaxed whitespace-pre-line font-sans">
            {problem.description}
          </p>

          {problem.testCases && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Sample Cases</h4>
              {problem.testCases.slice(0, 3).map((tc, i) => (
                <div key={i} className="mb-3 p-3 bg-black/40 rounded border border-white/5 font-mono text-xs">
                  <div className="text-gray-500 mb-1">Input:</div>
                  <div className="mb-2 text-gray-200">{tc.input}</div>
                  <div className="text-gray-500 mb-1">Expected Output:</div>
                  <div className="text-accent">{tc.expectedOutput}</div>
                </div>
              ))}
            </div>
          )}

          {aiMessage && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg animate-in fade-in slide-in-from-bottom-2">
               <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-2 text-sm">
                 <Lightbulb size={16} /> AI Assistant
               </h4>
               <p className="text-sm text-gray-200 whitespace-pre-wrap">{aiMessage}</p>
            </div>
          )}
        </div>

        {/* Code Editor Side */}
        <div className="flex-1 relative flex flex-col">
           {/* Simple IDE Header */}
           <div className="bg-[#0d1117] border-b border-white/5 px-4 py-2 text-xs text-gray-500 font-mono">
             {language === Language.Python && 'main.py'}
             {language === Language.Java && 'Main.java'}
             {language === Language.C && 'main.c'}
           </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-[#0d1117] text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none leading-normal"
            spellCheck={false}
            placeholder="// Write your solution here..."
          />
        </div>
      </div>

      <OutputConsole 
        logs={logs} 
        judgeResult={judgeResult} 
        isOpen={consoleOpen} 
        onToggle={() => setConsoleOpen(!consoleOpen)} 
      />
    </div>
  );
};

export default DSASandbox;