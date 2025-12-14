import React, { useState, useEffect } from 'react';
import { UserProfile, Problem, ProblemType, ExplanationStyle, Difficulty } from './types';
import { ALL_PROBLEMS } from './constants';
import DSASandbox from './components/DSASandbox';
import WebDevSandbox from './components/WebDevSandbox';
import { LayoutDashboard, Code2, Cpu, User, CheckCircle, BrainCircuit, ArrowRight, Activity, Trophy, Zap, ChevronLeft } from 'lucide-react';
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
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Professional Background</label>
            <input 
              required
              placeholder="e.g. CS Student, Frontend Dev..."
              className="w-full bg-black/30 border border-secondary/30 rounded p-2 text-white focus:border-primary focus:outline-none"
              value={formData.background}
              onChange={e => setFormData({...formData, background: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">DSA Strong Points</label>
              <input 
                placeholder="Arrays, DP..."
                className="w-full bg-black/30 border border-secondary/30 rounded p-2 text-white focus:border-primary focus:outline-none"
                value={formData.strongPointsDSA}
                onChange={e => setFormData({...formData, strongPointsDSA: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Web Strong Points</label>
              <input 
                placeholder="React, CSS..."
                className="w-full bg-black/30 border border-secondary/30 rounded p-2 text-white focus:border-primary focus:outline-none"
                value={formData.strongPointsWeb}
                onChange={e => setFormData({...formData, strongPointsWeb: e.target.value})}
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
                  onClick={() => setFormData({...formData, explanationStyle: style})}
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
                  <span className={`${
                    problem.difficulty === 'Beginner' ? 'text-accent' :
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
  const history = user.performanceHistory;
  
  // Calculate average scores specific to domain
  const dsaHistory = history.filter(h => ALL_PROBLEMS.find(p => p.id === h.problemId)?.type === ProblemType.DSA);
  const webHistory = history.filter(h => ALL_PROBLEMS.find(p => p.id === h.problemId)?.type === ProblemType.WebDev);

  const dsaAvg = dsaHistory.length 
    ? Math.round(dsaHistory.reduce((acc, curr) => acc + curr.score, 0) / dsaHistory.length) 
    : 0;
  
  const webAvg = webHistory.length 
    ? Math.round(webHistory.reduce((acc, curr) => acc + curr.score, 0) / webHistory.length) 
    : 0;
    
  // --- Filter Logic ---
  const filteredProblems = ALL_PROBLEMS.filter(p => filter === 'All' || p.difficulty === filter);
  const dsaProblems = filteredProblems.filter(p => p.type === ProblemType.DSA);
  const webProblems = filteredProblems.filter(p => p.type === ProblemType.WebDev);

  // Format data for chart
  const chartData = history.map((h, i) => ({
    name: `Attempt ${i + 1}`,
    score: h.score,
    type: ALL_PROBLEMS.find(p => p.id === h.problemId)?.type || 'Unknown'
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
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
            value={user.completedProblems.length} 
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
            icon={<Code2 size={20} className="text-orange-400" />} 
            colorClass="bg-orange-400"
        />
        <MetricCard 
            title="Current Streak" 
            value="3 Days" 
            icon={<Zap size={20} className="text-blue-400" />} 
            colorClass="bg-blue-400"
        />
      </div>

      {/* Analytics Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-secondary/20">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Score History
                </h3>
            </div>
            <div className="h-64 w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#3b82f6' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <Activity size={48} className="mb-2 opacity-20" />
                        <p>No activity recorded yet.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Profile Stats / Strong Points */}
        <div className="bg-surface p-6 rounded-xl border border-secondary/20 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Skill Profile</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>DSA Proficiency</span>
                            <span>{dsaAvg > 80 ? 'Advanced' : dsaAvg > 50 ? 'Intermediate' : 'Beginner'}</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(dsaAvg, 5)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Focus: {user.strongPointsDSA}</p>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Web Dev Proficiency</span>
                            <span>{webAvg > 80 ? 'Advanced' : webAvg > 50 ? 'Intermediate' : 'Beginner'}</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.max(webAvg, 5)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Focus: {user.strongPointsWeb}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs text-blue-300 leading-relaxed">
                    <span className="font-bold">Recommendation:</span> Based on your recent activity, try solving 
                    <span className="text-white font-bold"> {dsaAvg < webAvg ? 'more DSA problems' : 'more Web Dev challenges'} </span> 
                    to balance your skill set.
                </p>
            </div>
        </div>
      </div>

      {/* Two Separate Problem Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProblemList 
            title="DSA Analytical Sandbox" 
            icon={<Cpu size={20} className="text-white" />}
            problems={dsaProblems}
            completedIds={user.completedProblems}
            onSelect={onSelectProblem}
            headerColor="bg-gradient-to-r from-purple-900/50 to-indigo-900/50"
        />
        
        <ProblemList 
            title="Web Development Sandbox" 
            icon={<Code2 size={20} className="text-white" />}
            problems={webProblems}
            completedIds={user.completedProblems}
            onSelect={onSelectProblem}
            headerColor="bg-gradient-to-r from-orange-900/50 to-red-900/50"
        />
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);

  // Simple Onboarding Check
  if (!user) {
    return <Onboarding onComplete={setUser} />;
  }

  const currentProblem = ALL_PROBLEMS.find(p => p.id === currentProblemId);

  // Use functional updates to prevent race conditions or stale state usage
  // when separate calls (save code vs complete problem) happen close together.
  const handleComplete = (score: number) => {
    if (!currentProblemId) return;
    
    setUser(prevUser => {
        if (!prevUser) return null;

        const newHistory = [...prevUser.performanceHistory, {
            problemId: currentProblemId,
            score,
            timestamp: Date.now()
        }];

        const newCompleted = prevUser.completedProblems.includes(currentProblemId) 
            ? prevUser.completedProblems 
            : [...prevUser.completedProblems, currentProblemId];

        return {
            ...prevUser,
            completedProblems: newCompleted,
            performanceHistory: newHistory
        };
    });
  };

  const handleSaveCode = (code: string | { html: string; css: string; js: string }) => {
     if (!currentProblemId) return;
     
     setUser(prevUser => {
         if (!prevUser) return null;
         return {
             ...prevUser,
             solutions: {
                 ...prevUser.solutions,
                 [currentProblemId]: code
             }
         };
     });
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans">
      {/* Navigation */}
      <nav className="h-14 border-b border-secondary/20 bg-surface flex items-center justify-between px-4 sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 font-bold text-xl cursor-pointer"
          onClick={() => setCurrentProblemId(null)}
        >
          {currentProblemId ? (
            <div className="flex items-center gap-2 hover:bg-white/5 pr-4 py-1 -ml-2 pl-2 rounded transition-colors">
               <ChevronLeft size={20} className="text-primary" />
               <span className="text-sm font-medium">Dashboard</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Code2 size={20} className="text-white" />
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
           <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 px-3 py-1 rounded-full">
             <User size={14} />
             {user.name}
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="h-[calc(100vh-3.5rem)]">
        {!currentProblemId ? (
          <Dashboard user={user} onSelectProblem={setCurrentProblemId} />
        ) : (
          currentProblem?.type === ProblemType.DSA ? (
            <DSASandbox 
                problem={currentProblem} 
                onComplete={handleComplete}
                onSave={handleSaveCode}
                savedCode={user.solutions[currentProblem.id] as string}
            />
          ) : (
            <WebDevSandbox 
                problem={currentProblem!} 
                onComplete={handleComplete}
                onSave={handleSaveCode}
                savedCode={user.solutions[currentProblem.id] as { html: string; css: string; js: string }}
            />
          )
        )}
      </main>
    </div>
  );
}