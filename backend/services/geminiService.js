const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

async function askGemini(context, question) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a senior software engineer analyzing a code repository.

Use ONLY the provided code context.

If the answer cannot be determined from the context, say:
"I couldn't find enough information in the repository."

Formatting rules:
- Use markdown.
- Use headings and bullet points.
- Prefer short points instead of long paragraphs.
- Explain the flow step-by-step.
- Mention filenames in backticks.
- Use code blocks for snippets if necessary.
- Keep answers concise and easy to read.

Repository Context:
${context}

Question:
${question}
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

module.exports = askGemini;