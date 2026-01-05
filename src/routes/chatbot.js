
const express = require("express");
const router = express.Router();
const { rag } = require("../services/rag_service");
const { validate } = require("../middleware/validation");
const { ChatRequestSchema } = require("../models/chatbot");

router.post("/chat", validate(ChatRequestSchema), async (req, res, next) => {
  try {
    const { message } = req.body;
    const response = await rag(message, "it_supplies_collection");
    res.json({ response });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
