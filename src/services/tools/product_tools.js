const { DynamicTool } = require("@langchain/core/tools");
const { z } = require("zod");
const fs = require('fs');
const path = require('path');
const { getTracker } = require("../activity_tracker");

// Read data dynamically to avoid issues if the file changes or if direct import behaves unexpectedly
const dataPath = path.join(process.cwd(), 'src', 'data', 'it_supplies_data.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const products = JSON.parse(rawData);

// Variable para almacenar el requestId actual (será establecido desde el agente)
let currentRequestId = 'default';

function setRequestId(requestId) {
  currentRequestId = requestId;
}

const getProductPrice = new DynamicTool({
  name: "get_product_price",
  description: "Útil para cuando necesitas encontrar el precio de un producto de informática específico. La entrada debe ser el nombre del producto.",
  schema: z.object({
    input: z.string().describe("El nombre del producto de informática a buscar")
  }),
  func: async (args) => {
    const tracker = getTracker(currentRequestId);
    // Robust input handling
    let productName = "";
    if (typeof args === 'string') {
      productName = args;
    } else if (args && args.input) {
      productName = args.input;
    } else if (args && typeof args === 'object') {
      // Try to find any string property if 'input' is missing
      productName = Object.values(args).find(v => typeof v === 'string') || "";
    }

    console.log(`[TOOL USE] get_product_price called with: "${productName}" (Raw args: ${JSON.stringify(args)})`);
    
    tracker.trackTool(
      'get_product_price',
      'Consultando precio exacto de producto',
      productName
    );

    if (!productName) {
      return "Por favor, proporciona el nombre de un producto.";
    }

    try {
      const product = products.find(p => p.nombre.toLowerCase().includes(productName.toLowerCase()));
      if (product) {
        return `El precio de ${product.nombre} es ${product.precio} USD.`;
      }
      return "Producto no encontrado. Por favor, verifica el nombre e intenta de nuevo.";
    } catch (error) {
      console.error("Error in getProductPrice:", error);
      return "Error al buscar el precio del producto.";
    }
  },
});

module.exports = {
  getProductPrice,
  setRequestId,
};
