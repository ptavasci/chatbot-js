const { AgentExecutor, createToolCallingAgent } = require("@langchain/classic/agents");
const { DynamicTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { model } = require("../langchain");
const { embedder, client } = require("../chroma");
const { getProductPrice, setRequestId: setProductToolRequestId } = require("../tools/product_tools");
const { getTimeTool, setRequestId: setMcpToolRequestId } = require("../tools/mcp_tool");
const { getTracker } = require("../activity_tracker");

const INSTRUCTION = `Eres IT_Agent, un experto en insumos de informática para GAIA insumos. Tienes información detallada sobre diversos artículos tecnológicos, incluyendo sus descripciones, precios y características.

TU ROL:
- Proporcionar información precisa y detallada sobre productos de informática.
- Ayudar a los clientes a encontrar el componente o periférico perfecto para sus necesidades.
- Mencionar siempre el precio cuando esté disponible.
- Destacar características importantes como especificaciones técnicas, compatibilidad y rendimiento.
- Ser amigable, profesional y servicial.
- Responder SIEMPRE en español rioplatense (usando "vos", "che", etc.).
- **IMPORTANTE**: Puedes recordar información personal de la conversación (nombres, preferencias, intereses).
- **REGLA CRÍTICA**: NUNCA respondas sobre el precio de un producto basándote en búsquedas generales. SIEMPRE utiliza la herramienta 'get_product_price' para obtener el precio exacto antes de responder.

TIENES ACCESO A HERRAMIENTAS:
- it_product_search: Para buscar descripciones, especificaciones y detalles de los productos de informática.
- get_product_price: Para buscar el precio EXACTO y ACTUAL de un producto específico.
- get_current_time: Para saber la hora actual si te lo preguntan.

Si te preguntan por el precio de un producto específico, DEBES usar la herramienta 'get_product_price'.`;

async function runITAgent(question, memory, requestId = 'default') {
  const tracker = getTracker(requestId);

  // Establecer requestId en las tools para que puedan trackear
  setProductToolRequestId(requestId);
  setMcpToolRequestId(requestId);

  tracker.trackAgent(
    'IT_Agent',
    'Procesando consulta sobre productos de informática'
  );

  // 1. Setup Vector Store
  const vectorStore = new Chroma(embedder, {
    collectionName: "it_supplies_collection",
    index: client,
  });

  // 2. Create Retriever Tool
  const retriever = vectorStore.asRetriever(5);
  const retrieverTool = new DynamicTool({
    name: "it_product_search",
    description: "Para buscar descripciones, especificaciones y detalles de los productos de informática.",
    schema: z.object({
      input: z.string().describe("La consulta de búsqueda para encontrar productos de informática")
    }),
    func: async (args) => {
      let query = "";
      if (typeof args === 'string') {
        query = args;
      } else if (args && args.input) {
        query = args.input;
      } else if (args && typeof args === 'object') {
        query = Object.values(args).find(v => typeof v === 'string') || "";
      }

      console.log(`[TOOL USE] it_product_search called with: "${query}" (Raw args: ${JSON.stringify(args)})`);

      tracker.trackTool(
        'it_product_search',
        'Buscando información de productos en base vectorial',
        query
      );

      const docs = await retriever.invoke(query);
      return docs.map(d => d.pageContent).join("\n\n");
    }
  });

  // 3. Define Tools
  const tools = [retrieverTool, getProductPrice, getTimeTool];

  // 4. Create Prompt
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", INSTRUCTION],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // 5. Create Agent
  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt,
  });

  // 6. Create Executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory: memory,
    verbose: true,
  });

  // 7. Invoke
  const result = await agentExecutor.invoke({ input: question });

  return { text: result.output };
}

module.exports = { runITAgent };
