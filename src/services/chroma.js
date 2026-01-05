const { OpenAIEmbeddings } = require("@langchain/openai");
const { ChromaClient } = require('chromadb');

const host = process.env.CHROMA_HOST || 'localhost';
const port = parseInt(process.env.CHROMA_PORT || '8000');

const client = new ChromaClient({
  host: host,
  port: port
});

const embedder = new OpenAIEmbeddings();

module.exports = { client, embedder };
