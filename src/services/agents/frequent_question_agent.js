const { ConversationalRetrievalQAChain } = require("@langchain/classic/chains");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { PromptTemplate } = require("@langchain/core/prompts");
const { model } = require("../langchain");
const { embedder, client } = require("../chroma");
const { getTracker } = require("../activity_tracker");

const INSTRUCTION = `Eres "FrequentQuestionsAgent", un asistente de IA altamente capacitado y amigable para "GAIA insumos", una tienda líder en insumos de informática.

TU ROL:
- Proporcionar respuestas precisas, concisas y corteses a preguntas frecuentes sobre la operación de la tienda.
- Responder sobre: horarios, ubicación, contacto, métodos de pago, envíos y entregas, garantías, promociones y soporte al cliente.
- Responder SIEMPRE en español neutro con tintes rioplatenses (usando "vos", pero evitando el uso de "che").
- NO inventar detalles ni proporcionar información más allá del contexto dado.
- Ser profesional, amigable y servicial.
- **IMPORTANTE**: Puedes recordar información personal de la conversación (nombres, preferencias, intereses) sin necesidad de buscarla en el contexto. Usa tu memoria de conversación para responder preguntas personales.

INFORMACIÓN SOBRE "GAIA INSUMOS":
{context}

Chat History:
{chat_history}

Question: {question}

Answer:`;

const prompt = PromptTemplate.fromTemplate(INSTRUCTION);

async function runFrequentQuestionAgent(question, memory, requestId = 'default') {
  const tracker = getTracker(requestId);

  tracker.trackAgent(
    'FrequentQuestionsAgent',
    'Procesando consulta sobre información de la tienda'
  );

  // Using new Chroma with explicit client to avoid import issues
  const vectorStore = new Chroma(embedder, {
    collectionName: "frecuent_questions_collection",
    index: client,
  });

  const retriever = vectorStore.asRetriever(3);

  tracker.trackTool(
    'store_info_search',
    'Buscando información de la tienda en base vectorial',
    question
  );

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    retriever, // Retrieving top 3 as per README
    {
      // memory: memory, // Handle memory manually
      qaChainOptions: {
        type: "stuff",
        prompt: prompt
      },
      returnSourceDocuments: true,
    }
  );

  // Load memory variables
  const memoryVariables = await memory.loadMemoryVariables({});
  const chatHistory = memoryVariables.chat_history || [];

  // Call chain with chat_history
  const response = await chain.call({
    question: question,
    chat_history: chatHistory
  });

  // Save to memory manually
  await memory.saveContext(
    { input: question },
    { output: response.text }
  );

  return { text: response.text, sourceDocuments: response.sourceDocuments };
}

module.exports = { runFrequentQuestionAgent };
