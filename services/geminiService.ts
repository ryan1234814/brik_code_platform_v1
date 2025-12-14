import { GoogleGenAI } from "@google/genai";
import { Problem } from "../types";

// Initialize Gemini
// NOTE: Process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartHint = async (
  problem: Problem,
  currentCode: string,
  level: number
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Cannot generate AI hint.";
  }

  const model = "gemini-2.5-flash";
  let prompt = "";

  if (level === 1) {
    prompt = `I am trying to solve this problem: "${problem.description}". 
    My current code is: \n${currentCode}\n. 
    Give me a very small, high-level conceptual hint. Do not show code. Do not give the answer.`;
  } else if (level === 2) {
    prompt = `I am stuck on this problem: "${problem.title}". 
    My code: \n${currentCode}\n.
    Identify a potential logical flaw or suggest the specific data structure/algorithm to use. Be brief.`;
  } else {
    prompt = `I am completely stuck on "${problem.title}". 
    Explain the optimal approach step-by-step. You can show a tiny snippet of pseudo-code, but not the full solution.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "Could not generate hint.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI service is currently unavailable.";
  }
};

export const getSolution = async (problem: Problem): Promise<string> => {
   if (!process.env.API_KEY) return "No API Key configured.";

   try {
     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: `Provide the optimal solution for the coding problem: "${problem.title}: ${problem.description}". 
       Provide the code in Python (for DSA) or JS (for Web). Add brief comments explaining complexity.`,
     });
     return response.text || "No solution generated.";
   } catch (error) {
     return "Error retrieving solution.";
   }
};
