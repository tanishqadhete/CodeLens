const retrieveChunks = require("../services/chatService");
const askGemini = require("../services/geminiService");

exports.askQuestion = async (req, res) => {
  try {
    const { projectId, question } = req.body;

    if (!projectId || !question) {
      return res.status(400).json({
        message: "projectId and question are required",
      });
    }

    const chunks = await retrieveChunks(
      projectId,
      question
    );

    if (!chunks.length) {
      return res.status(404).json({
        message: "No indexed code found for this project.",
      });
    }

    const context = chunks
      .map(
        (c, index) => `
========== FILE ${index + 1} ==========
PATH: ${c.filePath}

${c.chunk}
`
      )
      .join("\n");

    const answer = await askGemini(
      context,
      question
    );

    const sources = [
      ...new Set(
        chunks.map((c) => c.filePath)
      ),
    ];

    res.status(200).json({
      answer,
      sources,
    });
  } catch (err) {
    console.error("Chat Error:", err);

    res.status(500).json({
      message: "Failed to answer question",
      error: err.message,
    });
  }
};