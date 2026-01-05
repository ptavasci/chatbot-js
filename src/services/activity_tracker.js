/**
 * Activity Tracker Service
 * Registra todos los eventos de agentes, tools y MCPs durante una petición
 */

class ActivityTracker {
  constructor() {
    this.activities = [];
  }

  /**
   * Registra el uso de un agente
   * @param {string} agentName - Nombre del agente
   * @param {string} description - Descripción de lo que hace
   */
  trackAgent(agentName, description) {
    this.activities.push({
      type: 'agent',
      name: agentName,
      description,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Registra el uso de una tool
   * @param {string} toolName - Nombre de la tool
   * @param {string} description - Descripción de la acción
   * @param {any} input - Input usado (opcional)
   */
  trackTool(toolName, description, input = null) {
    this.activities.push({
      type: 'tool',
      name: toolName,
      description,
      input: input ? String(input).substring(0, 100) : null, // Limitar longitud
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Registra el uso de un MCP
   * @param {string} mcpName - Nombre del MCP
   * @param {string} description - Descripción de la acción
   * @param {any} result - Resultado (opcional)
   */
  trackMCP(mcpName, description, result = null) {
    this.activities.push({
      type: 'mcp',
      name: mcpName,
      description,
      result: result ? String(result).substring(0, 100) : null, // Limitar longitud
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtiene todas las actividades registradas
   * @returns {Array} Lista de actividades
   */
  getActivities() {
    return this.activities;
  }

  /**
   * Limpia todas las actividades
   */
  clear() {
    this.activities = [];
  }

  /**
   * Obtiene un resumen de actividades por tipo
   * @returns {Object} Resumen con contadores
   */
  getSummary() {
    const summary = {
      total: this.activities.length,
      agents: this.activities.filter(a => a.type === 'agent').length,
      tools: this.activities.filter(a => a.type === 'tool').length,
      mcps: this.activities.filter(a => a.type === 'mcp').length
    };
    return summary;
  }
}

// Store de trackers por request (usando un Map con timeout para limpiar)
const trackerStore = new Map();
const TRACKER_TIMEOUT = 60000; // 60 segundos

/**
 * Crea o recupera un tracker para una petición específica
 * @param {string} requestId - ID único de la petición
 * @returns {ActivityTracker} Instancia del tracker
 */
function getTracker(requestId = 'default') {
  if (!trackerStore.has(requestId)) {
    const tracker = new ActivityTracker();
    trackerStore.set(requestId, tracker);
    
    // Auto-cleanup después del timeout
    setTimeout(() => {
      trackerStore.delete(requestId);
    }, TRACKER_TIMEOUT);
  }
  
  return trackerStore.get(requestId);
}

/**
 * Limpia un tracker específico
 * @param {string} requestId - ID de la petición
 */
function clearTracker(requestId) {
  trackerStore.delete(requestId);
}

module.exports = {
  ActivityTracker,
  getTracker,
  clearTracker
};
