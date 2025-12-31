import { GoogleGenerativeAI } from "@google/generative-ai";
import { Problem } from "../types";

// Initialize Gemini
const apiKey = process.env.API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const getSmartHint = async (
  problem: Problem,
  currentCode: string,
  level: number
): Promise<string> => {
  if (!apiKey) {
    return "API Key missing. Cannot generate AI hint.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Could not generate hint.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI service is currently unavailable.";
  }
};

export const getSolution = async (problem: Problem): Promise<string> => {
  if (!apiKey) return "No API Key configured.";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Provide the optimal solution for the coding problem: "${problem.title}: ${problem.description}". 
     Provide the code in Python (for DSA) or JS (for Web). Add brief comments explaining complexity.`);
    const response = await result.response;
    return response.text() || "No solution generated.";
  } catch (error) {
    return "Error retrieving solution.";
  }
};
