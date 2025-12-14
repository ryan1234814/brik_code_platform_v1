import React, { useEffect, useRef } from 'react';
import { Terminal, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { JudgeResult } from '../types';

interface OutputConsoleProps {
  logs: string[];
  judgeResult: JudgeResult | null;
  isOpen: boolean;
  onToggle: () => void;
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ logs, judgeResult, isOpen, onToggle }) => {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever logs change
  useEffect(() => {
    if (isOpen && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen, judgeResult]);

  if (!isOpen) return (
    <button 
      onClick={onToggle}
      className="fixed bottom-4 right-4 bg-surface border border-secondary/30 text-white p-2 rounded-full shadow-lg hover:bg-primary transition-all z-50"
    >
      <Terminal size={20} />
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 bg-black/90 border-t border-secondary/30 text-mono text-sm shadow-2xl z-40 flex flex-col font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-secondary/20">
        <div className="flex items-center gap-2 text-gray-300">
          <Terminal size={16} />
          <span>Console / Test Output</span>
        </div>
        <div className="flex gap-2">
            <button onClick={onToggle} className="text-gray-400 hover:text-white">Minimize</button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto text-gray-300 space-y-2">
        {judgeResult && (
          <div className="mb-4 p-3 rounded bg-surface/50 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-gray-100">Status:</span>
              {judgeResult.status === 'AC' && <span className="text-accent flex items-center gap-1"><CheckCircle size={16}/> Accepted</span>}
              {judgeResult.status === 'WA' && <span className="text-danger flex items-center gap-1"><XCircle size={16}/> Wrong Answer</span>}
              {judgeResult.status === 'TLE' && <span className="text-warning flex items-center gap-1"><Clock size={16}/> Time Limit Exceeded</span>}
              {judgeResult.status === 'CE' && <span className="text-warning flex items-center gap-1"><AlertTriangle size={16}/> Compilation Error</span>}
              {judgeResult.status === 'Pending' && <span className="text-primary animate-pulse">Running...</span>}
            </div>
            
            {judgeResult.status !== 'Pending' && judgeResult.status !== 'Idle' && (
               <div className="text-xs text-gray-400">
                 Cases Passed: {judgeResult.passedCases} / {judgeResult.totalCases}
               </div>
            )}
          </div>
        )}

        {logs.length === 0 && <div className="text-gray-600 italic">No output yet...</div>}
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap font-mono border-l-2 border-transparent hover:border-white/10 pl-2">
            <span className="text-green-500 mr-2">$</span>
            {log}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default OutputConsole;