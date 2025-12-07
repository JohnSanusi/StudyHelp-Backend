import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const processLessonContent = async (content) => {
    try {
        // 1. Extract Topics
        const topicsPrompt = `
            Analyze the following lesson content and extract the key topics covered.
            Return ONLY a JSON array of strings, e.g., ["Topic 1", "Topic 2"].
            Do not include any markdown formatting or code blocks.
            
            Content:
            ${content.substring(0, 10000)} // Limit content length for token limits
        `;

        const topicsResult = await model.generateContent(topicsPrompt);
        const topicsResponse = topicsResult.response.text();
        const topics = JSON.parse(topicsResponse.replace(/```json|```/g, '').trim());

        // 2. Generate Summary
        const summaryPrompt = `
            Summarize the following lesson content in 3 concise paragraphs.
            Capture the main ideas and key takeaways.
            
            Content:
            ${content.substring(0, 10000)}
        `;

        const summaryResult = await model.generateContent(summaryPrompt);
        const summary = summaryResult.response.text();

        // 3. Generate Questions
        const questionsPrompt = `
            Generate 5 multiple-choice questions based on the following lesson content.
            Return ONLY a JSON array of objects with this structure:
            [
                {
                    "question": "Question text",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "Correct option text",
                    "explanation": "Brief explanation"
                }
            ]
            Do not include any markdown formatting or code blocks.
            
            Content:
            ${content.substring(0, 10000)}
        `;

        const questionsResult = await model.generateContent(questionsPrompt);
        const questionsResponse = questionsResult.response.text();
        const questions = JSON.parse(questionsResponse.replace(/```json|```/g, '').trim());

        return {
            topics,
            summary,
            questions
        };
    } catch (error) {
        console.error('Error processing content with Gemini:', error);
        // Return partial or empty results on error to avoid crashing
        return {
            topics: [],
            summary: 'AI processing failed. Please try again later.',
            questions: []
        };
    }
};
