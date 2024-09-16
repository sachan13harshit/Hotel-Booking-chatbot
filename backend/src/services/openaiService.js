const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createChatCompletion(messages, functions = null) {
  const requestOptions = {
    model: 'gpt-3.5-turbo',
    messages,
  };

  if (functions && functions.length > 0) {
    requestOptions.functions = functions;
    requestOptions.function_call = 'auto';
  }

  return await openai.chat.completions.create(requestOptions);
}

module.exports = { createChatCompletion };