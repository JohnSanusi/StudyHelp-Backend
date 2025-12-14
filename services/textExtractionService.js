import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';

export const textExtractionService = {
    /**
     * Extract text from a file based on its mimetype
     * @param {Object} file - The file object from multer (path, mimetype)
     * @returns {Promise<string>} - Extracted text
     */
    async extractText(file) {
        const { path, mimetype } = file;

        try {
            if (mimetype === 'application/pdf') {
                return await this.extractFromPDF(path);
            } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                return await this.extractFromDOCX(path);
            } else if (mimetype.startsWith('image/')) {
                return await this.extractFromImage(path);
            } else if (mimetype === 'text/plain') {
                return await fs.readFile(path, 'utf8');
            } else {
                throw new Error(`Unsupported file type: ${mimetype}`);
            }
        } catch (error) {
            console.error(`Error extracting text from ${mimetype}:`, error);
            throw error;
        }
    },

    async extractFromPDF(filePath) {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    },

    async extractFromDOCX(filePath) {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    },

    async extractFromImage(filePath) {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        return text;
    }
};
