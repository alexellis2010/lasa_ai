const OpenAI =  require("openai")

const openai = new OpenAI();

module.exports.llm = async function llm(messages) {
  const completion = await openai.chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message;
};