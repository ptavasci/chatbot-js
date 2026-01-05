
const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validation");
const { ChatRequestSchema } = require("../models/chatbot");
const { getMemory } = require("../services/memory");
const { evaluateQuestion } = require("../services/agents/question_evaluator");
const { runITAgent } = require("../services/agents/it_agent");
const { runFrequentQuestionAgent } = require("../services/agents/frequent_question_agent");

router.post("/chatt", validate(ChatRequestSchema), async (req, res, next) => {
  try {
    const { message, chat_id } = req.body;
    const chatId = chat_id || "default";
    const memory = getMemory(chatId);

    // 1. Evaluate the question
    let category = await evaluateQuestion(message);
    console.log(`Question evaluated as: ${category}`);

    // 2. Route to the appropriate agent
    let response;
    if (category === "frecuent-questions") {
      response = await runFrequentQuestionAgent(message, memory);
    } else {
      // Default to IT agent for "it-questions" and "n/a"
      response = await runITAgent(message, memory);
    }

    res.json({ response: response.text });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
