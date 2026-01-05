const { z } = require("zod");

const ChatRequestSchema = z.object({
  message: z.string(),
  chat_id: z.string().optional(),
});

module.exports = {
  ChatRequestSchema,
};
