/**
 * Provides an easy-to-use LLM function
 */
const OpenAI = require("openai")

const openai = new OpenAI(); // Global instance of openai object
// Takes an array of [message objects](https://platform.openai.com/docs/api-reference/chat/object) and returns the predicted message
module.exports.llm = async function llm(messages) {
  // Defining what AI model to use
  const completion = await openai.chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message;
};