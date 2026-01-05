
const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validation");
const { ChatRequestSchema } = require("../models/chatbot");
const { getMemory } = require("../services/memory");
const { evaluateQuestion } = require("../services/agents/question_evaluator");
const { runITAgent } = require("../services/agents/it_agent");
const { runFrequentQuestionAgent } = require("../services/agents/frequent_question_agent");
const { getTracker, clearTracker } = require("../services/activity_tracker");
const crypto = require("crypto");

router.post("/chatt", validate(ChatRequestSchema), async (req, res, next) => {
  // Generar ID único para esta petición
  const requestId = crypto.randomUUID();
  
  try {
    const { message, chat_id } = req.body;
    const chatId = chat_id || "default";
    const memory = getMemory(chatId);

    // 1. Evaluate the question
    let category = await evaluateQuestion(message, requestId);
    console.log(`Question evaluated as: ${category}`);

    // 2. Route to the appropriate agent
    let response;
    if (category === "frecuent-questions") {
      response = await runFrequentQuestionAgent(message, memory, requestId);
    } else {
      // Default to IT agent for "it-questions" and "n/a"
      response = await runITAgent(message, memory, requestId);
    }

    // 3. Recolectar metadata de actividades
    const tracker = getTracker(requestId);
    const activities = tracker.getActivities();
    const summary = tracker.getSummary();
    
    // Limpiar el tracker después de recolectar los datos
    clearTracker(requestId);

    // 4. Enviar respuesta con metadata
    res.json({
      response: response.text,
      metadata: {
        activities,
        summary,
        requestId,
        category
      }
    });
  } catch (error) {
    // Limpiar tracker en caso de error
    clearTracker(requestId);
    next(error);
  }
});

module.exports = router;
