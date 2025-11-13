'use server';

import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
  // In a real server environment, this should throw a hard error.
  // For this environment, we log a warning and allow the mock to proceed.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || 'mock_key' });

/**
 * Takes a simple user prompt and uses the Gemini model to expand it into a
 * detailed prompt suitable for an AI image generation model.
 * @param simplePrompt The user's initial, simple prompt.
 * @returns A promise that resolves to the polished, detailed prompt string.
 */
export const polishPrompt = async (simplePrompt: string): Promise<string> => {
  if (!apiKey || apiKey === 'mock_key') {
      // Mock response if API key is not available
      return new Promise(resolve => {
          setTimeout(() => {
              resolve(`(Mock Response) An ultra-detailed, cinematic photograph of ${simplePrompt}. 
- Style: Hyperrealistic, dramatic lighting.
- Composition: Close-up shot, rule of thirds.
- Mood: Mysterious, awe-inspiring.
- Details: 8k resolution, photorealistic textures.`);
          }, 1500);
      });
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert prompt engineer for AI image generation models like Stable Diffusion or Midjourney. 
        Your task is to take a user's simple idea and expand it into a rich, detailed, and effective prompt. 
        Focus on adding descriptive keywords related to style, composition, lighting, mood, and level of detail. 
        Do not add any preamble or explanation, just return the polished prompt.

        User's idea: "${simplePrompt}"
        
        Polished Prompt:`,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};