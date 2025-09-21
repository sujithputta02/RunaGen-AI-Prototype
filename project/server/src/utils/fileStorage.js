import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FileStorage {
  constructor() {
    this.storageDir = path.join(__dirname, '../../data/conversations');
    this.ensureStorageDir();
  }

  async ensureStorageDir() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  async saveConversation(conversation) {
    try {
      const filePath = path.join(this.storageDir, `${conversation.sessionId}.json`);
      await fs.writeFile(filePath, JSON.stringify(conversation, null, 2));
      console.log('💾 Conversation saved to file:', filePath);
      return true;
    } catch (error) {
      console.error('Failed to save conversation to file:', error);
      return false;
    }
  }

  async getConversation(sessionId) {
    try {
      const filePath = path.join(this.storageDir, `${sessionId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('Conversation not found in file storage:', sessionId);
      return null;
    }
  }

  async getRecentConversations(userId, limit = 10) {
    try {
      const files = await fs.readdir(this.storageDir);
      const conversations = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.storageDir, file);
            const data = await fs.readFile(filePath, 'utf8');
            const conversation = JSON.parse(data);
            
            if (conversation.userId === userId) {
              conversations.push(conversation);
            }
          } catch (error) {
            console.warn('Failed to read conversation file:', file, error.message);
          }
        }
      }

      // Sort by creation date (newest first) and limit results
      return conversations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent conversations from file storage:', error);
      return [];
    }
  }

  async searchConversations(userId, query, limit = 10) {
    try {
      const conversations = await this.getRecentConversations(userId, 50);
      const results = [];

      for (const conv of conversations) {
        const matchingMessages = conv.messages.filter(msg => 
          msg.content.toLowerCase().includes(query.toLowerCase())
        );

        if (matchingMessages.length > 0) {
          results.push({
            ...conv,
            matchingMessages: matchingMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
              intent: msg.metadata?.intent
            })),
            relevanceScore: matchingMessages.length
          });
        }
      }

      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to search conversations in file storage:', error);
      return [];
    }
  }

  async deleteConversation(sessionId) {
    try {
      const filePath = path.join(this.storageDir, `${sessionId}.json`);
      await fs.unlink(filePath);
      console.log('🗑️ Conversation deleted:', sessionId);
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  }

  async getStorageStats() {
    try {
      const files = await fs.readdir(this.storageDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      return {
        totalConversations: jsonFiles.length,
        storageType: 'file',
        storagePath: this.storageDir
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { totalConversations: 0, storageType: 'file', error: error.message };
    }
  }
}

export const fileStorage = new FileStorage();
