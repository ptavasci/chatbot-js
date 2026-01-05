const fs = require('node:fs');
const path = require('node:path');
const { BaseListChatMessageHistory } = require("@langchain/core/chat_history");
const { HumanMessage, AIMessage, BaseMessage } = require("@langchain/core/messages");
const { ConversationSummaryBufferMemory } = require("@langchain/classic/memory");
const { model } = require("./langchain");

const MEMORIES_DIR = path.join(process.cwd(), 'conversation_memories');

class FileChatMessageHistory extends BaseListChatMessageHistory {
  constructor(chatId) {
    super();
    this.chatId = chatId;
    this.filePath = path.join(MEMORIES_DIR, `${chatId}.json`);
    this.messages = [];

    // Ensure directory exists
    if (!fs.existsSync(MEMORIES_DIR)) {
      fs.mkdirSync(MEMORIES_DIR, { recursive: true });
    }
  }

  async getMessages() {
    if (this.messages.length > 0) {
      return this.messages;
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const storedMessages = JSON.parse(data);
        this.messages = storedMessages.map(msg => {
          if (msg.type === 'human') return new HumanMessage(msg.data.content);
          if (msg.type === 'ai') return new AIMessage(msg.data.content);
          return new BaseMessage(msg.data.content);
        });
      } catch (error) {
        console.error(`Error reading memory file for ${this.chatId}:`, error);
        this.messages = [];
      }
    }
    return this.messages;
  }

  async addMessage(message) {
    this.messages.push(message);
    await this.saveMessages();
  }

  async addMessages(messages) {
    this.messages.push(...messages);
    await this.saveMessages();
  }

  async saveMessages() {
    try {
      const serializedMessages = this.messages.map(msg => ({
        type: msg._getType(),
        data: { content: msg.content }
      }));
      fs.writeFileSync(this.filePath, JSON.stringify(serializedMessages, null, 2));
    } catch (error) {
      console.error(`Error saving memory file for ${this.chatId}:`, error);
    }
  }

  async clear() {
    this.messages = [];
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
    } catch (error) {
      console.error(`Error clearing memory file for ${this.chatId}:`, error);
    }
  }
}

const memories = {};

function getMemory(chatId) {
  if (!memories[chatId]) {
    const chatHistory = new FileChatMessageHistory(chatId);
    memories[chatId] = new ConversationSummaryBufferMemory({
      llm: model,
      maxTokenLimit: 1000,
      chatHistory: chatHistory,
      memoryKey: "chat_history",
      returnMessages: true,
      inputKey: "input",
      outputKey: "output",
    });
  }
  return memories[chatId];
}

module.exports = { getMemory };
