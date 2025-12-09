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
