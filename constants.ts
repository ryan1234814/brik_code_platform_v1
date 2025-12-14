import { Difficulty, Problem, ProblemType, Language } from './types';

// Helper to generate boilerplate code
const getBoilerplate = (lang: Language, funcName: string, params: string[], returnType: string) => {
  if (lang === Language.Python) return `def ${funcName}(${params.join(', ')}):\n    # Write your code here\n    pass`;
  if (lang === Language.Java) return `public static ${returnType} ${funcName}(${params.join(', ')}) {\n        // Write your code here\n        return ${returnType === 'void' ? '' : 'null'};\n    }`;
  if (lang === Language.C) return `${returnType} ${funcName}(${params.join(', ')}) {\n    // Write your code here\n}`;
  return '';
};

// --- DATA GENERATION ---

const dsaTopics = ['Arrays', 'Strings', 'LinkedLists', 'Trees', 'DP', 'Graphs', 'Sorting', 'Searching'];
const webTopics = ['DOM Manipulation', 'Forms', 'API Fetching', 'Layouts', 'Events', 'State Management'];

const generateDSAProblems = (): Problem[] => {
  const problems: Problem[] = [];
  
  // 1. Two Sum (Classic)
  // Input Format for Test Cases: "N (count)\n[N integers]\nTarget"
  // e.g. "3\n2 7 11\n9" -> Output "0 1"
  problems.push({
    id: 'dsa-1',
    title: 'Two Sum',
    type: ProblemType.DSA,
    difficulty: Difficulty.Beginner,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Assume exactly one solution exists. \n\nInput Format:\nLine 1: Count N\nLine 2: N integers separated by space\nLine 3: Target integer',
    tags: ['Arrays', 'Hashing'],
    testCases: [
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1' }, 
      { input: '3\n3 2 4\n6', expectedOutput: '1 2' },
      { input: '2\n3 3\n6', expectedOutput: '0 1' }
    ],
    initialCode: {
      [Language.Python]: `def two_sum(nums, target):\n    # Return a list or tuple of indices, e.g., [0, 1]\n    pass`,
      [Language.Java]: `// Returns array of indices\npublic static int[] twoSum(int[] nums, int target) {\n    // Write code here\n    return new int[]{0, 0};\n}`,
      [Language.C]: `// Prints indices separated by space\nvoid twoSum(int* nums, int numsSize, int target) {\n    // Write code here\n    // printf("%d %d", idx1, idx2);\n}`
    },
    // The "Hidden" Driver Code that performs the I/O and calls the user function
    driverCode: {
      [Language.Python]: `
if __name__ == "__main__":
    import sys
    input_data = sys.stdin.read().split()
    if not input_data:
        sys.exit(0)
    
    iterator = iter(input_data)
    try:
        n = int(next(iterator))
        nums = []
        for _ in range(n):
            nums.append(int(next(iterator)))
        target = int(next(iterator))
        
        result = two_sum(nums, target)
        if result:
            print(f"{result[0]} {result[1]}")
    except StopIteration:
        pass
`,
      [Language.Java]: `
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNext()) return;
        
        int n = scanner.nextInt();
        int[] nums = new int[n];
        for(int i=0; i<n; i++) {
            nums[i] = scanner.nextInt();
        }
        int target = scanner.nextInt();
        
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
} // End of Main class (User code is injected inside Main class)
`,
      [Language.C]: `
int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    
    int* nums = (int*)malloc(n * sizeof(int));
    for(int i=0; i<n; i++) {
        scanf("%d", &nums[i]);
    }
    int target;
    scanf("%d", &target);
    
    twoSum(nums, n, target);
    
    free(nums);
    return 0;
}
`
    }
  });

  // Generate 19 more DSA problems with a generic driver strategy
  for (let i = 2; i <= 20; i++) {
    const topic = dsaTopics[i % dsaTopics.length];
    const diff = i < 7 ? Difficulty.Beginner : i < 14 ? Difficulty.Intermediate : Difficulty.Advanced;
    problems.push({
      id: `dsa-${i}`,
      title: `${topic} Challenge ${i}`,
      type: ProblemType.DSA,
      difficulty: diff,
      description: `Solve a problem related to ${topic}. Input consists of a single integer N. Output N * 2.\n\n(This is a generated placeholder problem to demonstrate the judge system).`,
      tags: [topic],
      testCases: [
        { input: '10', expectedOutput: '20' },
        { input: '5', expectedOutput: '10' },
        { input: '123', expectedOutput: '246' }
      ],
      initialCode: {
        [Language.Python]: `def solve(n):\n    return n * 2`,
        [Language.Java]: `public static int solve(int n) {\n    return n * 2;\n}`,
        [Language.C]: `int solve(int n) {\n    return n * 2;\n}`
      },
      driverCode: {
        [Language.Python]: `
if __name__ == "__main__":
    import sys
    try:
        raw = sys.stdin.read().strip()
        if raw:
            n = int(raw)
            print(solve(n))
    except Exception as e:
        pass
`,
        [Language.Java]: `
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if(scanner.hasNextInt()) {
            int n = scanner.nextInt();
            System.out.println(solve(n));
        }
    }
}
`,
        [Language.C]: `
int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        printf("%d", solve(n));
    }
    return 0;
}
`
      }
    });
  }
  return problems;
};

const generateWebProblems = (): Problem[] => {
  const problems: Problem[] = [];
  
  // 1. Counter
  problems.push({
    id: 'web-1',
    title: 'Simple Counter',
    type: ProblemType.WebDev,
    difficulty: Difficulty.Beginner,
    description: 'Create a counter with Increment and Decrement buttons. The count should not go below zero.',
    tags: ['DOM', 'Events'],
    requirements: ['Display current count', 'Increment button', 'Decrement button', 'No negative numbers'],
    initialWebCode: {
      html: `<div id="app">\n  <h1 id="count">0</h1>\n  <button id="inc">Inc</button>\n  <button id="dec">Dec</button>\n</div>`,
      css: `body { font-family: sans-serif; padding: 20px; }\n#count { font-size: 2em; }`,
      js: `const countEl = document.getElementById('count');\nconst incBtn = document.getElementById('inc');\nconst decBtn = document.getElementById('dec');\n\n// Add logic here`
    }
  });

  // Generate 14 more Web Problems
  for (let i = 2; i <= 15; i++) {
    const topic = webTopics[i % webTopics.length];
    const diff = i < 6 ? Difficulty.Beginner : i < 11 ? Difficulty.Intermediate : Difficulty.Advanced;
    problems.push({
      id: `web-${i}`,
      title: `${topic} Implementation`,
      type: ProblemType.WebDev,
      difficulty: diff,
      description: `Implement a feature demonstrating ${topic}. Ensure accessibility and performance best practices.`,
      tags: [topic],
      requirements: ['Functional correctness', 'Clean UI', 'Error handling'],
      initialWebCode: {
        html: `<div class="container">\n  <h2>${topic} Demo</h2>\n  <div id="output"></div>\n</div>`,
        css: `.container { padding: 1rem; border: 1px solid #ccc; }`,
        js: `// Implement ${topic} logic\nconsole.log("Ready");`
      }
    });
  }
  return problems;
};

export const ALL_PROBLEMS = [...generateDSAProblems(), ...generateWebProblems()];

export const PISTON_RUNTIMES = {
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  c: { language: 'c', version: '10.2.0' },
};