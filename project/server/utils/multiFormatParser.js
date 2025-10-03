import fs from 'fs/promises';
import path from 'path';
import { parsePdfToText } from './pdfParser.js';

// Enhanced multi-format file parser for Resume Optimizer
export class MultiFormatParser {
  constructor() {
    this.supportedFormats = {
      pdf: ['.pdf'],
      word: ['.doc', '.docx'],
      image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
      text: ['.txt', '.rtf']
    };
  }

  // Detect file type based on extension and mime type
  detectFileType(filename, mimetype) {
    const ext = path.extname(filename).toLowerCase();
    
    // PDF files
    if (this.supportedFormats.pdf.includes(ext) || mimetype === 'application/pdf') {
      return 'pdf';
    }
    
    // Word documents
    if (this.supportedFormats.word.includes(ext) || 
        mimetype === 'application/msword' || 
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'word';
    }
    
    // Images
    if (this.supportedFormats.image.includes(ext) || mimetype.startsWith('image/')) {
      return 'image';
    }
    
    // Text files
    if (this.supportedFormats.text.includes(ext) || mimetype === 'text/plain') {
      return 'text';
    }
    
    return 'unknown';
  }

  // Parse PDF files
  async parsePDF(filePath) {
    try {
      return await parsePdfToText(filePath);
    } catch (error) {
      console.error('PDF parsing failed:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  // Parse Word documents
  async parseWord(filePath) {
    try {
      // Try to use mammoth for .docx files
      const mammoth = await this.loadMammoth();
      if (mammoth) {
        const buffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      }
      
      // Fallback: Try to read as text (works for some simple .doc files)
      const buffer = await fs.readFile(filePath);
      const text = buffer.toString('utf8');
      
      // Basic cleanup for Word document artifacts
      return text
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
        
    } catch (error) {
      console.error('Word document parsing failed:', error);
      throw new Error('Failed to parse Word document. Please convert to PDF or text format.');
    }
  }

  // Parse image files using OCR
  async parseImage(filePath) {
    try {
      // Try to use Tesseract.js for OCR
      const tesseract = await this.loadTesseract();
      if (tesseract) {
        const { data: { text } } = await tesseract.recognize(filePath);
        await tesseract.terminate();
        return text || '';
      }
      
      // Fallback: Return instruction for manual text entry
      throw new Error('OCR not available. Please convert image to text manually or use PDF/Word format.');
      
    } catch (error) {
      console.error('Image OCR failed:', error);
      throw new Error('Failed to extract text from image. Please use PDF or Word format, or enter text manually.');
    }
  }

  // Parse plain text files
  async parseText(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content.trim();
    } catch (error) {
      console.error('Text file parsing failed:', error);
      throw new Error('Failed to read text file');
    }
  }

  // Main parsing function
  async parseFile(filePath, filename, mimetype) {
    const fileType = this.detectFileType(filename, mimetype);
    
    console.log(`Parsing file: ${filename} (type: ${fileType}, mime: ${mimetype})`);
    
    switch (fileType) {
      case 'pdf':
        return await this.parsePDF(filePath);
      
      case 'word':
        return await this.parseWord(filePath);
      
      case 'image':
        return await this.parseImage(filePath);
      
      case 'text':
        return await this.parseText(filePath);
      
      default:
        throw new Error(`Unsupported file format: ${filename}. Supported formats: PDF, Word (.doc/.docx), Images (.jpg/.png), Text (.txt)`);
    }
  }

  // Lazy load mammoth for Word document parsing
  async loadMammoth() {
    try {
      const mammoth = await import('mammoth');
      return mammoth.default || mammoth;
    } catch (error) {
      console.warn('Mammoth not available for Word document parsing:', error.message);
      return null;
    }
  }

  // Lazy load Tesseract.js for OCR
  async loadTesseract() {
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      return worker;
    } catch (error) {
      console.warn('Tesseract.js not available for OCR:', error.message);
      return null;
    }
  }

  // Get supported file extensions for frontend validation
  getSupportedExtensions() {
    return [
      ...this.supportedFormats.pdf,
      ...this.supportedFormats.word,
      ...this.supportedFormats.image,
      ...this.supportedFormats.text
    ];
  }

  // Get MIME types for frontend validation
  getSupportedMimeTypes() {
    return [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'text/plain',
      'application/rtf'
    ];
  }

  // Validate file before processing
  validateFile(filename, mimetype, fileSize) {
    const fileType = this.detectFileType(filename, mimetype);
    
    if (fileType === 'unknown') {
      return {
        valid: false,
        error: `Unsupported file format: ${filename}. Supported formats: PDF, Word (.doc/.docx), Images (.jpg/.png), Text (.txt)`
      };
    }
    
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (fileSize > maxSize) {
      return {
        valid: false,
        error: `File too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB. Maximum size: 50MB`
      };
    }
    
    return {
      valid: true,
      fileType: fileType
    };
  }
}

export const multiFormatParser = new MultiFormatParser();