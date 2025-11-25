// lib/gemini.js

/**
 * This file handles all communication with Google's Gemini AI
 */

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini - it automatically picks up GEMINI_API_KEY from environment
const ai = new GoogleGenAI({});

/**
 * Detect if user wants technical or educational response
 * @param {string} message - User's question
 * @returns {Promise<string>} - "technical" or "educational"
 */
export async function detectMode(message) {
  const prompt = `
Analyze this message and respond with ONLY one word: "technical" or "educational"

Technical indicators: asks for scientific names, specific dates, fossil locations, geological formations, precise measurements, research papers
Educational indicators: asks general questions, uses casual language, wants stories or explanations, asks "why" or "how"

Message: "${message}"

Response (one word only):`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const mode = response.text.trim().toLowerCase();
    
    // Default to educational if unclear
    return mode === 'technical' ? 'technical' : 'educational';
  } catch (error) {
    console.error('Mode detection error:', error);
    return 'educational'; // Safe default
  }
}

/**
 * Extract dinosaur/prehistoric animal names from user message
 * @param {string} message - User's question
 * @returns {Promise<string|null>} - Dinosaur name or null
 */
export async function extractDinosaurName(message) {
  const prompt = `Extract the dinosaur or prehistoric animal name from this message. 
Respond with ONLY the scientific genus name (capitalized), or "NONE" if no dinosaur is mentioned.

Examples:
"Tell me about T-Rex" -> Tyrannosaurus
"what was the biggest dinosaur" -> NONE
"I love velociraptors!" -> Velociraptor
"How big was Spinosaurus?" -> Spinosaurus

Message: "${message}"

Response (one word only):`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const name = response.text.trim();
    return name === 'NONE' ? null : name;
  } catch (error) {
    console.error('Name extraction error:', error);
    return null;
  }
}

/**
 * Generate response using Gemini with context from PaleoDB
 * @param {string} userMessage - User's question
 * @param {object} paleoData - Data from PaleoDB
 * @param {string} mode - "technical" or "educational"
 * @returns {Promise<string>} - AI-generated response
 */
export async function generateResponse(userMessage, paleoData, mode) {
  // Create different prompts based on mode
  let systemPrompt = '';
  
  if (mode === 'technical') {
    systemPrompt = `You are a paleontology expert providing technical, accurate information.
Use scientific nomenclature, cite specific data from the provided PaleoDB information.
Include geological time periods, fossil locations, and taxonomic classifications.
Create tables and diagrams and include titles, bullet points and sub headings if necessary. 
Be precise and academic in tone.`;
  } else {
    systemPrompt = `You are a friendly paleontologist making paleontology exciting and accessible.
Use storytelling, and make comparisons to help people understand. 
Create tables and diagrams and include titles, bullet points and sub headings if necessary. 
Be enthusiastic but accurate. Explain complex concepts simply.
Do NOT make the total content longer than 200 words.
Focus on the interesting aspects of paleontology while staying scientifically accurate.`;
  }
  
  const prompt = `${systemPrompt}

PaleoDB Data:
${JSON.stringify(paleoData, null, 2)}

User Question: ${userMessage}

Please provide a helpful response based on the data above. If the data doesn't contain enough information, you can acknowledge that and provide general knowledge, but always prioritize the PaleoDB data when available.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

/**
 * Generate a search query to find dinosaur images online
 * @param {string} - dinosaurName - Name of the dinosaur
 * @returns {string} - Optimized search query
 */

export function generateImageSearchQuery(dinosaurName){
    return `${dinosaurName} dinosaur fossil skeleton reconstruction`
}