export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum ProblemType {
  DSA = 'DSA',
  WebDev = 'WebDev',
}

export enum Language {
  Python = 'python',
  Java = 'java',
  C = 'c',
}

export enum ExplanationStyle {
  BulletPoints = 'Bullet Points',
  StepByStep = 'Step-by-Step',
  ShortParagraph = 'Short Paragraph',
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  type: ProblemType;
  difficulty: Difficulty;
  description: string;
  tags: string[];
  // DSA Specifics
  testCases?: TestCase[]; 
  initialCode?: Partial<Record<Language, string>>;
  driverCode?: Partial<Record<Language, string>>; // Hidden wrapper code
  // Web Dev Specifics
  requirements?: string[]; // Logic, UX, etc.
  initialWebCode?: {
    html: string;
    css: string;
    js: string;
  };
}

export interface UserProfile {
  name: string;
  background: string; // e.g., CS Student, Junior Dev
  strongPointsDSA: string;
  strongPointsWeb: string;
  explanationStyle: ExplanationStyle;
  completedProblems: string[]; // IDs of completed problems
  performanceHistory: {
    problemId: string;
    score: number;
    timestamp: number;
  }[];
  solutions: Record<string, string | { html: string; css: string; js: string }>;
}

export interface ExecutionResult {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
  };
  language: string;
  version: string;
}

export interface JudgeResult {
  status: 'AC' | 'WA' | 'TLE' | 'CE' | 'RE' | 'Pending' | 'Idle';
  passedCases: number;
  totalCases: number;
  logs: string;
  time?: string;
  memory?: string;
}