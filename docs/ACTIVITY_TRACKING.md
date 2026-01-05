# Sistema de Tracking de Actividades

Este documento explica el sistema de tracking de actividades que muestra en tiempo real al usuario qué agentes, tools y MCPs están siendo utilizados durante cada interacción con el chatbot.

## 📋 Descripción General

El sistema captura y muestra notificaciones sutiles en el frontend que informan al usuario sobre las operaciones que el chatbot está realizando "por detrás", incluyendo:

- **🤖 Agentes**: Qué agente especializado está procesando la consulta
- **🔧 Tools**: Qué herramientas se están utilizando (búsquedas, consultas de precios, etc.)
- **🔌 MCPs**: Qué servicios externos se están consultando (Model Context Protocol)

## 🏗️ Arquitectura

### 1. Activity Tracker Service (`src/services/activity_tracker.js`)

Módulo central que registra todas las actividades durante una petición:

```javascript
const { getTracker } = require("../services/activity_tracker");

const tracker = getTracker(requestId);

// Registrar un agente
tracker.trackAgent('IT_Agent', 'Procesando consulta sobre productos');

// Registrar una tool
tracker.trackTool('get_product_price', 'Consultando precio exacto', 'laptop gamer');

// Registrar un MCP
tracker.trackMCP('Time MCP Server', 'Consultando hora actual', '15:30:45');
```

**Características:**
- Usa un `requestId` único por cada petición
- Auto-limpieza después de 60 segundos
- Proporciona resumen de actividades

### 2. Backend Integration

#### Agentes Modificados:
- [`question_evaluator.js`](../src/services/agents/question_evaluator.js) - Trackea la evaluación de la pregunta
- [`it_agent.js`](../src/services/agents/it_agent.js) - Trackea procesamiento de consultas IT
- [`frequent_question_agent.js`](../src/services/agents/frequent_question_agent.js) - Trackea consultas frecuentes

#### Tools Modificadas:
- [`product_tools.js`](../src/services/tools/product_tools.js) - Trackea consultas de precios
- [`mcp_tool.js`](../src/services/tools/mcp_tool.js) - Trackea llamadas MCP

#### Ruta API:
[`chatbotV2.js`](../src/routes/chatbotV2.js) retorna metadata junto con la respuesta:

```json
{
  "response": "El precio de la laptop gamer es $1200 USD.",
  "metadata": {
    "activities": [
      {
        "type": "agent",
        "name": "QuestionEvaluator",
        "description": "Evaluando tipo de pregunta...",
        "timestamp": "2024-01-05T20:00:00.000Z"
      },
      {
        "type": "agent",
        "name": "IT_Agent",
        "description": "Procesando consulta sobre productos",
        "timestamp": "2024-01-05T20:00:01.000Z"
      },
      {
        "type": "tool",
        "name": "it_product_search",
        "description": "Buscando información en base vectorial",
        "input": "laptop gamer",
        "timestamp": "2024-01-05T20:00:02.000Z"
      },
      {
        "type": "tool",
        "name": "get_product_price",
        "description": "Consultando precio exacto",
        "input": "laptop gamer",
        "timestamp": "2024-01-05T20:00:03.000Z"
      }
    ],
    "summary": {
      "total": 4,
      "agents": 2,
      "tools": 2,
      "mcps": 0
    },
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "category": "it-questions"
  }
}
```

### 3. Frontend Integration

#### HTML ([`chatbot-v2.html`](../public/chatbot-v2.html))

Añade un contenedor para notificaciones:

```html
<div id="activity-notifications" class="activity-notifications"></div>
```

JavaScript procesa metadata y muestra notificaciones:

```javascript
function showActivityNotification(activity) {
  // Crea notificación animada con icono y descripción
}

function processMetadata(metadata) {
  // Muestra cada actividad con delay de 400ms entre ellas
  metadata.activities.forEach((activity, index) => {
    setTimeout(() => showActivityNotification(activity), index * 400);
  });
}
```

#### CSS ([`style.css`](../public/style.css))

Estilos para notificaciones sutiles en esquina inferior derecha:

- Animación de entrada desde la derecha
- Auto-desvanecimiento después de 3 segundos
- Diseño glassmorphism consistente con el resto de la UI
- Responsive para móviles

## 🎨 Diseño Visual

Las notificaciones aparecen en la esquina inferior derecha con:

- **Icono**: Emoji que representa el tipo (🤖 agente, 🔧 tool, 🔌 MCP)
- **Nombre**: Identificador del componente
- **Descripción**: Qué está haciendo
- **Animación**: Deslizamiento suave desde la derecha
- **Duración**: 3 segundos visible por notificación
- **Delay**: 400ms entre notificaciones para evitar sobrecarga visual

## 🚀 Flujo Completo de Ejemplo

1. Usuario pregunta: "¿Cuánto cuesta la laptop gamer?"
2. Backend genera `requestId` único
3. **QuestionEvaluator** evalúa la pregunta → Notificación aparece
4. **IT_Agent** se activa → Notificación aparece
5. **it_product_search** busca en vectorstore → Notificación aparece
6. **get_product_price** consulta precio exacto → Notificación aparece
7. Backend retorna respuesta + metadata
8. Frontend muestra notificaciones secuencialmente
9. Usuario ve respuesta + comprende el proceso realizado

## 🔧 Configuración

### Timeouts
- **Tracker auto-cleanup**: 60 segundos (`activity_tracker.js:85`)
- **Notificación visible**: 3 segundos (`chatbot-v2.html:122`)
- **Delay entre notificaciones**: 400ms (`chatbot-v2.html:132`)

### Personalización

Para añadir nuevos tipos de tracking:

```javascript
// En tu agente/tool
const { getTracker } = require("../services/activity_tracker");

async function myNewTool(input, requestId = 'default') {
  const tracker = getTracker(requestId);
  
  tracker.trackTool(
    'my_new_tool',
    'Descripción de lo que hace',
    input
  );
  
  // ... lógica de la tool
}
```

## 📊 Debug

El sistema automáticamente loggea en consola del navegador:

```javascript
console.log('📊 Activity Summary:', metadata.summary);
console.log('🔍 Category:', metadata.category);
```

## 🎯 Beneficios

1. **Transparencia**: Usuario ve qué está haciendo el chatbot
2. **Educación**: Comprende la complejidad del sistema
3. **Confianza**: Entiende de dónde viene la información
4. **Debug**: Facilita identificar problemas en producción
5. **UX**: Interfaz más interactiva y moderna

## 📝 Notas Técnicas

- Sistema completamente no-bloqueante
- No afecta performance del chatbot
- Compatible con llamadas asíncronas
- Thread-safe mediante requestId único
- Fallback gracioso si metadata no está disponible
