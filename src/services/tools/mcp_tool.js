const { DynamicTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { getTracker } = require("../activity_tracker");

// Variable para almacenar el requestId actual (será establecido desde el agente)
let currentRequestId = 'default';

function setRequestId(requestId) {
  currentRequestId = requestId;
}

// Simulating an MCP Tool that connects to a "Time Server"
// In a real scenario, this would use the Model Context Protocol SDK to communicate with a server.
const getTimeTool = new DynamicTool({
  name: "get_current_time",
  description: "Get the current time from the Time MCP Server. Useful for questions about what time it is.",
  schema: z.object({}), // No input parameters needed
  func: async () => {
    const tracker = getTracker(currentRequestId);
    
    // Simulating MCP Server call
    console.log("[TOOL USE] get_current_time called (Simulating MCP Server call...)");
    
    const now = new Date();
    const timeString = `La hora actual es ${now.toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit' })} (Hora de Argentina).`;
    
    tracker.trackMCP(
      'Time MCP Server',
      'Consultando hora actual desde servidor MCP',
      timeString
    );
    
    return timeString;
  },
});

module.exports = {
  getTimeTool,
  setRequestId,
};
