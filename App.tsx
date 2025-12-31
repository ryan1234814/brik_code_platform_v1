import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Problem, ProblemType, ExplanationStyle, Difficulty } from './types';
import { ALL_PROBLEMS } from './constants';
import DSASandbox from './components/DSASandbox';
import WebDevSandbox from './components/WebDevSandbox';
import { LayoutDashboard, Code, Cpu, User, CheckCircle, BrainCircuit, ArrowRight, Activity, Trophy, Zap, ChevronLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

// --- COMPONENTS FOR APP STRUCTURE ---

const Onboarding: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    background: '',
    strongPointsDSA: '',
    strongPointsWeb: '',
    explanationStyle: ExplanationStyle.BulletPoints,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      ...formData as UserProfile,
      completedProblems: [],
      performanceHistory: [],
      solutions: {}
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg bg-surface p-8 rounded-xl shadow-2xl border border-secondary/20">
        <div className="flex items-center gap-3 mb-6 text-primary">
          <BrainCircuit size={32} />
          <h1 className="text-2xl font-bold text-white">BrikCode Setup</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input
              required
              className="w-full bg-black/30 border border-secondary/30 rounded p-2 text-white focus:border-primary focus:outline-none"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Professional Background</label>
            <input
              required
              placeholder="e.g. CS Student, Frontend Dev..."
              className="w-full bg-black/30 border border-secondary/30 rounded p-2 text-white focus:border-primary focus:outline-none"
              value={formData.background}
              onChange={e => setFormData({ ...formData, background: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">DSA Strong Points</label>
              <input
                placeholder="Arrays, DP..."
                className="w-full bg-black/30 border border-secondary/30 rounded p-2 text-white focus:border-primary focus:outline-none"
                value={formData.strongPointsDSA}
                onChange={e => setFormData({ ...formData, strongPointsDSA: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Web Strong Points</label>
              <input
                placeholder="React, CSS..."
                className="w-full bg-black/30 border border-secondary/30 rounded p-2 text-white focus:border-primary focus:outline-none"
                value={formData.strongPointsWeb}
                onChange={e => setFormData({ ...formData, strongPointsWeb: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Preferred Explanation Style</label>
            <p className="text-xs text-gray-500 mb-2">Used for your profile analytics and future interview matching.</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ExplanationStyle).map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFormData({ ...formData, explanationStyle: style })}
                  className={`p-2 text-xs rounded border ${formData.explanationStyle === style ? 'bg-primary/20 border-primary text-primary' : 'border-secondary/30 text-gray-400 hover:bg-white/5'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all mt-6">
            Start Coding
          </button>
        </form>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
  <div className="bg-surface p-4 rounded-xl border border-secondary/20 flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-xs font-medium uppercase">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
      {icon}
    </div>
  </div>
);

const ProblemList: React.FC<{
  title: string;
  icon: React.ReactNode;
  problems: Problem[];
  completedIds: string[];
  onSelect: (id: string) => void;
  headerColor: string;
}> = ({ title, icon, problems, completedIds, onSelect, headerColor }) => (
  <div className="bg-surface rounded-xl border border-secondary/20 overflow-hidden flex flex-col h-full">
    <div className={`p-4 ${headerColor} border-b border-white/5 flex items-center gap-2`}>
      {icon}
      <h3 className="font-bold text-white">{title}</h3>
      <span className="ml-auto text-xs bg-black/30 px-2 py-1 rounded-full text-white/80">{problems.length} Challenges</span>
    </div>
    <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
      {problems.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No challenges match filter.</p>}
      {problems.map(problem => {
        const isCompleted = completedIds.includes(problem.id);
        return (
          <div
            key={problem.id}
            onClick={() => onSelect(problem.id)}
            className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/10"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-200 group-hover:text-primary transition-colors text-sm">{problem.title}</h4>
                {isCompleted && <CheckCircle size={14} className="text-accent" />}
              </div>
              <div className="flex gap-2 text-[10px] text-gray-500 uppercase tracking-wide">
                <span className={`${problem.difficulty === 'Beginner' ? 'text-accent' :
                  problem.difficulty === 'Intermediate' ? 'text-warning' : 'text-danger'
                  }`}>{problem.difficulty}</span>
                <span>•</span>
                <span>{problem.tags[0]}</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        );
      })}
    </div>
  </div>
);

const Dashboard: React.FC<{
  user: UserProfile,
  onSelectProblem: (id: string) => void
}> = ({ user, onSelectProblem }) => {
  const [filter, setFilter] = useState<Difficulty | 'All'>('All');

  // --- Metrics Calculation ---
  const history = user.performanceHistory || [];
  const completedIds = user.completedProblems || [];

  // Calculate average scores specific to domain
  const dsaHistory = history.filter(h => {
    const p = ALL_PROBLEMS.find(prob => prob.id === h.problemId);
    return p?.type === ProblemType.DSA;
  });
  const webHistory = history.filter(h => {
    const p = ALL_PROBLEMS.find(prob => prob.id === h.problemId);
    return p?.type === ProblemType.WebDev;
  });

  const dsaAvg = dsaHistory.length
    ? Math.round(dsaHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) / dsaHistory.length)
    : 0;

  const webAvg = webHistory.length
    ? Math.round(webHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) / webHistory.length)
    : 0;

  // --- Filter Logic ---
  const filteredProblems = ALL_PROBLEMS.filter(p => filter === 'All' || p.difficulty === filter);
  const dsaProblems = filteredProblems.filter(p => p.type === ProblemType.DSA);
  const webProblems = filteredProblems.filter(p => p.type === ProblemType.WebDev);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Track your progress in DSA and Web Development.</p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-1 bg-surface p-1 rounded-lg border border-secondary/20 self-start">
          {['All', Difficulty.Beginner, Difficulty.Intermediate, Difficulty.Advanced].map(d => (
            <button
              key={d}
              onClick={() => setFilter(d as any)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filter === d ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Problems Solved"
          value={completedIds.length}
          icon={<Trophy size={20} className="text-yellow-400" />}
          colorClass="bg-yellow-400"
        />
        <MetricCard
          title="DSA Avg. Score"
          value={`${dsaAvg}%`}
          icon={<Cpu size={20} className="text-purple-400" />}
          colorClass="bg-purple-400"
        />
        <MetricCard
          title="Web Dev Avg. Score"
          value={`${webAvg}%`}
          icon={<Code size={20} className="text-orange-400" />}
          colorClass="bg-orange-400"
        />
        <MetricCard
          title="Total Attempts"
          value={history.length}
          icon={<Activity size={20} className="text-blue-400" />}
          colorClass="bg-blue-400"
        />
      </div>

      {/* Simplified Activity Section */}
      <div className="bg-surface p-6 rounded-xl border border-secondary/20">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Activity size={20} className="text-primary" />
          Recent Activity
        </h3>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.slice(-5).reverse().map((h, i) => {
              const p = ALL_PROBLEMS.find(prob => prob.id === h.problemId);
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                  <span className="text-sm font-medium">{p?.title || 'Unknown Problem'}</span>
                  <span className={`text-xs font-bold ${h.score >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{h.score}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            <p>Complete your first challenge to see activity here!</p>
          </div>
        )}
      </div>

      {/* Problem Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <ProblemList
          title="DSA Analytical Sandbox"
          icon={<Cpu size={20} className="text-white" />}
          problems={dsaProblems}
          completedIds={completedIds}
          onSelect={onSelectProblem}
          headerColor="bg-gradient-to-r from-purple-900/50 to-indigo-900/50"
        />

        <ProblemList
          title="Web Development Sandbox"
          icon={<Code size={20} className="text-white" />}
          problems={webProblems}
          completedIds={completedIds}
          onSelect={onSelectProblem}
          headerColor="bg-gradient-to-r from-orange-900/50 to-red-900/50"
        />
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-20 bg-[#0f172a] text-white min-h-screen">
          <h1 className="text-red-500 font-bold mb-4">Rendering Error Caught</h1>
          <div className="bg-black/50 p-4 rounded-lg font-mono text-xs overflow-auto max-w-2xl">
            {this.state.error?.message || String(this.state.error)}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors"
          >
            Reset Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  console.log("App Rendering...");
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);

  const handleComplete = useCallback((score: number) => {
    if (!currentProblemId) return;
    setUser(prevUser => {
      if (!prevUser) return null;
      const newHistory = [...(prevUser.performanceHistory || []), {
        problemId: currentProblemId,
        score,
        timestamp: Date.now()
      }];
      const newCompleted = (prevUser.completedProblems || []).includes(currentProblemId)
        ? prevUser.completedProblems
        : [...(prevUser.completedProblems || []), currentProblemId];

      return {
        ...prevUser,
        completedProblems: newCompleted,
        performanceHistory: newHistory
      };
    });
  }, [currentProblemId]);

  const handleSaveCode = useCallback((code: string | { html: string; css: string; js: string }) => {
    if (!currentProblemId) return;
    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        solutions: {
          ...prevUser.solutions || {},
          [currentProblemId]: code
        }
      };
    });
  }, [currentProblemId]);

  // Simple Onboarding Check - MOVED AFTER HOOKS to satisfy Rules of Hooks
  if (!user) {
    return <Onboarding onComplete={setUser} />;
  }

  const currentProblem = ALL_PROBLEMS.find(p => p.id === currentProblemId);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      {/* Navigation */}
      <nav className="h-14 border-b border-white/5 bg-[#1e293b] flex items-center justify-between px-4 sticky top-0 z-50">
        <div
          className="flex items-center gap-2 font-bold text-xl cursor-pointer"
          onClick={() => setCurrentProblemId(null)}
        >
          {currentProblemId ? (
            <div className="flex items-center gap-2 hover:bg-white/5 pr-4 py-1 -ml-2 pl-2 rounded transition-colors">
              <ChevronLeft size={20} className="text-blue-500" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Code size={20} className="text-white" />
              </div>
              <span>BrikCode</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentProblem && (
            <span className="text-sm text-gray-400 hidden md:block">
              Working on: <span className="text-white">{currentProblem.title}</span>
            </span>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 px-3 py-1 rounded-full border border-white/5">
            <User size={14} />
            {user.name || 'User'}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="h-[calc(100vh-3.5rem)] overflow-hidden">
        {!currentProblemId ? (
          <Dashboard user={user} onSelectProblem={setCurrentProblemId} />
        ) : !currentProblem ? (
          <div className="p-10 text-center">
            <p className="text-red-400">Problem not found. ID: {currentProblemId}</p>
            <button onClick={() => setCurrentProblemId(null)} className="mt-4 p-2 bg-blue-600 rounded">Go to Dashboard</button>
          </div>
        ) : (
          currentProblem.type === ProblemType.DSA ? (
            <DSASandbox
              problem={currentProblem}
              onComplete={handleComplete}
              onSave={handleSaveCode}
              savedCode={(user.solutions?.[currentProblem.id] || '') as string}
            />
          ) : (
            <WebDevSandbox
              problem={currentProblem}
              onComplete={handleComplete}
              onSave={handleSaveCode}
              savedCode={(user.solutions?.[currentProblem.id] || { html: '', css: '', js: '' }) as { html: string; css: string; js: string }}
            />
          )
        )}
      </main>
    </div>
  );
}