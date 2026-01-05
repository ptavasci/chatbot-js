const { ChatOpenAI } = require("@langchain/openai");
const { ConversationSummaryBufferMemory } = require("@langchain/classic/memory");

const model = new ChatOpenAI({
  temperature: 0,
  max_tokens: 400,
  modelName: "gpt-4o-mini",
});

const memory = new ConversationSummaryBufferMemory({
  llm: model,
  maxTokenLimit: 1000,
  memoryKey: "chat_history",
  returnMessages: true,
});

module.exports = { model, memory };
