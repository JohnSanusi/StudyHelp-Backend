import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const aiService = {
    /**
     * Generate questions from text content
     * @param {string} text - The source text
     * @param {Object} options - Options for generation (difficulty, count, type)
     * @returns {Promise<Array>} - Array of generated questions
     */
    async generateQuestions(text, options = {}) {
        const { 
            difficulty = 'medium', 
            count = 5, 
            type = 'multiple_choice' 
        } = options;

        const prompt = `
            Generate ${count} ${difficulty} difficulty ${type} questions based on the following text.
            Return the result ONLY as a valid JSON array of objects with this structure:
            [
                {
                    "question": "Question text",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0, // Index of correct option (0-3)
                    "explanation": "Explanation of why this is correct"
                }
            ]

            Text:
            ${text.substring(0, 10000)} // Limit text length to avoid token limits
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Clean up markdown code blocks if present
            const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error generating questions:', error);
            throw new Error('Failed to generate questions');
        }
    },

    /**
     * Summarize text content
     * @param {string} text - The source text
     * @returns {Promise<Object>} - Summary and key points
     */
    async summarizeText(text) {
        const prompt = `
            Analyze the following text and provide a summary and key points.
            Return the result ONLY as a valid JSON object with this structure:
            {
                "summary": "Concise summary of the text",
                "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
                "complexity": "basic" | "intermediate" | "advanced",
                "tags": ["Tag1", "Tag2"]
            }

            Text:
            ${text.substring(0, 10000)}
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error summarizing text:', error);
            throw new Error('Failed to summarize text');
        }
    },

    /**
     * Generate flashcards from text
     * @param {string} text - The source text
     * @param {number} count - Number of cards to generate
     * @returns {Promise<Array>} - Array of flashcards
     */
    async generateFlashcards(text, count = 10) {
        const prompt = `
            Generate ${count} flashcards based on the following text.
            Return the result ONLY as a valid JSON array of objects with this structure:
            [
                {
                    "front": "Question or term",
                    "back": "Answer or definition",
                    "tags": ["Tag1", "Tag2"]
                }
            ]

            Text:
            ${text.substring(0, 10000)}
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error generating flashcards:', error);
            throw new Error('Failed to generate flashcards');
        }
    }
};
