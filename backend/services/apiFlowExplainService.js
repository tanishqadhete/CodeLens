const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

async function explainNode(node, route, method) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are helping developers understand an API execution flow.

API Endpoint:
${method} ${route}

Current Node Type:
${node.type}

Current Function:
${node.function}

File:
${node.file}

Source Code:
${node.code}

Instructions:
- Explain ONLY this node.
- Explain its responsibility in this API.
- Mention how it relates to the previous/next step if applicable.
- Maximum 2 short sentences.
- Do not explain the entire API.
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result =
        await model.generateContent(prompt);

      return result.response.text();
    } catch (err) {
      if (err.status !== 503 || attempt === 3) {
        throw err;
      }

      console.log(
        `Gemini busy. Retry ${attempt}/3`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );
    }
  }
}

module.exports = explainNode;