import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export const extractTextFromFile = async (file) => {
    const filePath = file.path;
    const fileType = file.mimetype;

    try {
        let text = '';

        if (fileType === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            text = data.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } else if (fileType === 'text/plain') {
            text = fs.readFileSync(filePath, 'utf8');
        } else {
            throw new Error('Unsupported file type for text extraction');
        }

        // Clean up text (remove excessive whitespace)
        return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error('Error extracting text:', error);
        throw new Error('Failed to extract text from file');
    }
};
