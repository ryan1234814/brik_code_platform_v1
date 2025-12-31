import React, { useState, useEffect } from 'react';
import { Problem } from '../types';
import { Play, RotateCcw, Monitor, Code, HelpCircle, Lightbulb, CheckCircle } from 'lucide-react';
import { getSmartHint } from '../services/geminiService';

interface Props {
  problem: Problem;
  onComplete: (score: number) => void;
  onSave: (code: { html: string; css: string; js: string }) => void;
  savedCode?: { html: string; css: string; js: string };
}

const WebDevSandbox: React.FC<Props> = ({ problem, onComplete, onSave, savedCode }) => {
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [srcDoc, setSrcDoc] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    if (savedCode) {
      setHtml(savedCode.html);
      setCss(savedCode.css);
      setJs(savedCode.js);
    } else if (problem.initialWebCode) {
      setHtml(problem.initialWebCode.html);
      setCss(problem.initialWebCode.css);
      setJs(problem.initialWebCode.js);
    }
  }, [problem.id]); // Only reset if problem ID changes

  // Debounced update for preview & Auto-Save
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <style>${css}</style>
          <body>${html}</body>
          <script>${js}</script>
        </html>
      `);
      // Auto-save work
      onSave({ html, css, js });
    }, 500);
    return () => clearTimeout(timeout);
  }, [html, css, js, onSave]);

  const handleValidation = () => {
    // Save Code
    onSave({ html, css, js });

    // Basic structural validation (Mocking a complex DOM analysis)
    const isSuccess = Math.random() > 0.3; // Simulating AI checking
    if (isSuccess) {
      setIsSolved(true);
      onComplete(100);
      // We use a custom alert here for Web, or we could add a success banner.
      // Since WebDev is visual, the visual cue is important.
    } else {
      alert("Something seems off. Check requirements.");
    }
  };

  const getHint = async () => {
    const fullCode = `HTML:\n${html}\nCSS:\n${css}\nJS:\n${js}`;
    const nextLevel = hintLevel + 1;
    const hint = await getSmartHint(problem, fullCode, nextLevel);
    setHintLevel(nextLevel);
    setAiMessage(hint);
  };

  return (
    <div className="flex h-full bg-background text-gray-100">
      {/* Editor Column */}
      <div className="w-1/2 flex flex-col border-r border-secondary/20">
        <div className="flex items-center justify-between p-2 bg-surface border-b border-secondary/20">
          <div className="flex gap-1">
            {['html', 'css', 'js'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang as any)}
                className={`px-4 py-2 text-sm font-medium uppercase rounded-t-md transition-colors ${activeTab === lang
                  ? 'bg-[#0d1117] text-white border-t border-primary'
                  : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {isSolved && (
              <span className="text-green-400 text-xs font-bold flex items-center gap-1 mr-2">
                <CheckCircle size={14} /> SOLVED
              </span>
            )}
            <button onClick={getHint} className="text-warning text-xs border border-warning/30 px-2 py-1 rounded hover:bg-warning/10">
              Hint
            </button>
            <button
              onClick={handleValidation}
              className={`text-white text-xs px-3 py-1 rounded transition-colors ${isSolved ? 'bg-accent hover:bg-emerald-600' : 'bg-primary hover:bg-blue-600'}`}
            >
              {isSolved ? 'Update' : 'Submit'}
            </button>
          </div>
        </div>

        <div className="flex-1 relative bg-[#0d1117]">
          {activeTab === 'html' && (
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full h-full bg-transparent p-4 font-mono text-sm resize-none focus:outline-none text-orange-200"
              spellCheck={false}
              placeholder="<!-- HTML -->"
            />
          )}
          {activeTab === 'css' && (
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              className="w-full h-full bg-transparent p-4 font-mono text-sm resize-none focus:outline-none text-blue-200"
              spellCheck={false}
              placeholder="/* CSS */"
            />
          )}
          {activeTab === 'js' && (
            <textarea
              value={js}
              onChange={(e) => setJs(e.target.value)}
              className="w-full h-full bg-transparent p-4 font-mono text-sm resize-none focus:outline-none text-yellow-200"
              spellCheck={false}
              placeholder="// JavaScript"
            />
          )}
        </div>

        {/* Requirements / Hint Panel at bottom left */}
        <div className="h-48 bg-surface border-t border-secondary/20 p-4 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-400 mb-2">Requirements</h3>
          <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
            {problem.requirements?.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
          {aiMessage && (
            <div className="mt-2 p-2 bg-blue-900/20 text-blue-200 text-xs rounded border border-blue-500/20">
              <span className="font-bold">AI:</span> {aiMessage}
            </div>
          )}
          {isSolved && (
            <div className="mt-2 p-2 bg-green-900/20 text-green-200 text-xs rounded border border-green-500/20 flex items-center gap-2">
              <CheckCircle size={14} /> Problem Solved! You can return to dashboard.
            </div>
          )}
        </div>
      </div>

      {/* Preview Column */}
      <div className="w-1/2 flex flex-col bg-white">
        <div className="bg-gray-100 p-2 border-b flex justify-between items-center text-black">
          <span className="text-xs font-mono flex items-center gap-2"><Monitor size={14} /> Live Preview</span>
        </div>
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts"
          className="flex-1 w-full h-full border-none"
        />
      </div>
    </div>
  );
};

export default WebDevSandbox;