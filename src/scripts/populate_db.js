require("dotenv").config();
const { ChromaClient } = require("chromadb");
const fs = require("node:fs");
const path = require("node:path");
const { OpenAIEmbeddings } = require("@langchain/openai");

const client = new ChromaClient({
  host: process.env.CHROMA_HOST || "localhost",
  port: Number.parseInt(process.env.CHROMA_PORT || "8000")
});

const langchainEmbedder = new OpenAIEmbeddings();
const embedder = {
  generate: async (texts) => {
    return await langchainEmbedder.embedDocuments(texts);
  }
};

async function populateDatabase() {
  try {
    console.log("Starting population with OpenAI Embeddings...");

    // Populate IT supplies collection
    const itData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/it_supplies_data.json"), "utf8")
    );

    // Delete if exists
    try {
      await client.deleteCollection({ name: "it_supplies_collection" });
      console.log("Deleted existing it_supplies_collection");
    } catch (e) {
      console.error(e);
    }

    const itCollection = await client.getOrCreateCollection({
      name: "it_supplies_collection",
      embeddingFunction: embedder,
    });

    await itCollection.add({
      ids: itData.map((item, index) => `item-${index}`),
      documents: itData.map(
        (item) => `${item.nombre}: ${item.descripcion}. Para consultar el precio exacto, usar la tool get_product_price.`
      ),
      metadatas: itData.map((item) => ({
        price_note: "Use get_product_price tool",
      })),
    });
    console.log("Populated it_supplies_collection");

    // Populate store information collection
    const storeInfoData = fs.readFileSync(
      path.join(__dirname, "../data/store-information.txt"),
      "utf8"
    );

    // Delete if exists
    try {
      await client.deleteCollection({ name: "frecuent_questions_collection" });
      console.log("Deleted existing frecuent_questions_collection");
    } catch (e) {
      console.error(e);
    }

    const storeInfoCollection = await client.getOrCreateCollection({
      name: "frecuent_questions_collection",
      embeddingFunction: embedder,
    });

    const chunks = storeInfoData.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 0);

    await storeInfoCollection.add({
      ids: chunks.map((_, i) => `info-${i}`),
      documents: chunks,
    });
    console.log("Populated frecuent_questions_collection");

    console.log("Database populated successfully with OpenAI Embeddings.");
  } catch (error) {
    console.error("Error populating database:", error);
  }
}

populateDatabase();
