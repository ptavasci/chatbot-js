const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { model } = require("../langchain");
const { getTracker } = require("../activity_tracker");

const INSTRUCTION = `You are an intelligent assistant that ONLY identifies whether inputs are questions about IT products or about store information.

RESPOND WITH ONLY ONE WORD (lowercase, no additional text):
- "it-questions" for questions about IT products (monitors, laptops, keyboards, mice, processors, prices, descriptions, features, etc.)
- "frecuent-questions" for questions about store processes (registrations, payments, shipping, store hours, contact info, discounts, promotions, guarantees, returns, etc.)
- "it-questions" if the question references something mentioned before (like "that one", "the one I mentioned", "that product", "how much does it cost?" referring to a previous product)
- "n/a" if the question is about the current time or completely unrelated to both categories

CRITICAL RULES:
1. Respond with ONLY the classification word, nothing else
2. If the question references previous conversation (using words like "ese", "ese producto", "el que mencioné", "cuánto cuesta ese"), it's likely it-questions
3. Questions about prices, descriptions, or features of specific products = it-questions
4. Questions about how to buy, pay, ship, contact, store hours = frecuent-questions

Examples:

Q: Que precio esta el monitor gamer?
A: it-questions

Q: Que procesador tiene la laptop?
A: it-questions

Q: Donde esta ubicado el local?
A: frecuent-questions

Q: Que metodos de pagos aceptan?
A: frecuent-questions

Q: Cuanto cuesta ese? (referring to something mentioned before)
A: it-questions

Q: Me interesa el teclado que mencionaste antes
A: it-questions

Q: Como me llamo?
A: frecuent-questions

Q: Que me interesa?
A: it-questions

Question: {input}
`;

const prompt = PromptTemplate.fromTemplate(INSTRUCTION);
const outputParser = new StringOutputParser();

const chain = prompt.pipe(model).pipe(outputParser);

async function evaluateQuestion(input, requestId = 'default') {
  const tracker = getTracker(requestId);
  
  tracker.trackAgent(
    'QuestionEvaluator',
    'Evaluando tipo de pregunta (it-questions, frecuent-questions, n/a)'
  );
  
  const result = await chain.invoke({ input });
  return result.trim();
}

module.exports = { evaluateQuestion };
