require("dotenv").config();
const { RetrievalQAChain, loadQAStuffChain } = require("@langchain/classic/chains");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { PromptTemplate } = require("@langchain/core/prompts");
const { model } = require("./langchain");
const { embedder, client } = require("./chroma");

const template = `Eres un asistente experto en GAIA insumos. Usa el siguiente contexto para responder la pregunta del usuario de forma concisa.

Contexto:
{context}

Pregunta: {question}
Respuesta:`;

const QA_PROMPT = new PromptTemplate({
  template: template,
  inputVariables: ["context", "question"],
});

async function rag(query, collectionName) {
  const vectorStore = await Chroma.fromExistingCollection(embedder, {
    collectionName: collectionName,
    index: client,
  });

  const retriever = vectorStore.asRetriever();
  const docs = await retriever.invoke(query);

  // console.log(`[RAG DEBUG] Query: "${query}"`);
  // console.log(`[RAG DEBUG] Retrieved ${docs.length} documents:`);
  // docs.forEach((doc, i) => {
  //   console.log(`  Doc ${i+1}: ${doc.pageContent.substring(0, 100)}...`);
  // });

  const combineDocumentsChain = loadQAStuffChain(model, { prompt: QA_PROMPT });

  const response = await combineDocumentsChain.call({
    input_documents: docs,
    question: query,
  });

  // console.log(`[RAG DEBUG] Response: "${response.text}"`);

  return response.text;
}

module.exports = { rag };
