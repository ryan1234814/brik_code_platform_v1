import { ExecutionResult, Language } from '../types';
import { PISTON_RUNTIMES } from '../constants';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';


/**
 * executeCodeOnPiston
 * 
 * This function acts as the "Worker/Judge Server" interface.
 * In a real backend architecture:
 * 1. The Frontend sends code to Backend.
 * 2. Backend pushes to a Queue (Redis/RabbitMQ).
 * 3. Worker Node pulls job, spins up a Docker container (e.g., using nsjail for isolation).
 * 4. Worker compiles (if needed) and runs the code against test cases.
 * 
 * Here, Piston acts as that ephemeral container service.
 * We send the "stitched" code (User Code + Wrapper/Driver) to Piston.
 */
export const executeCodeOnPiston = async (
  language: Language,
  code: string,
  stdin: string
): Promise<ExecutionResult> => {
  const runtime = PISTON_RUNTIMES[language];
  
  if (!runtime) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Java requires the class name to match the file name. 
  // Our Driver wrapper usually wraps everything in "Main" class.
  const fileName = language === Language.Java ? 'Main.java' : (language === Language.Python ? 'main.py' : 'main.c');

  try {
    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [
          {
            name: fileName,
            content: code,
          },
        ],
        stdin: stdin,
        // Piston specific: compile_timeout, run_timeout can be set here if needed.
        compile_timeout: 10000,
        run_timeout: 3000,
      }),
    });

    if (!response.ok) {
        throw new Error(`Piston API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Piston Execution Failed:', error);
    throw error;
  }
};
