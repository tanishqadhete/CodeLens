const retrieveChunks = require("../services/chatService");
const askGemini = require("../services/geminiService");

exports.askQuestion = async (req, res) => {
  try {
    const { repositoryPath, question } = req.body;

    if (!repositoryPath || !question) {
      return res.status(400).json({
        message: "repositoryPath and question are required",
      });
    }

    const chunks = await retrieveChunks(
      repositoryPath,
      question
    );

    if (!chunks.length) {
      return res.status(404).json({
        message: "No indexed code found for this repository.",
      });
    }


    // --------------------------------------------------
    // Build context for Gemini
    // --------------------------------------------------

    const context = chunks
      .map((c, index) => {

        // ----------------------------------------------
        // API FLOW
        // ----------------------------------------------

        if (c.apiFlowMatch) {

          const flowText = c.flow
            .map((node) => {

              if (node.type === "response") {
                return "→ HTTP Response";
              }

              return (
                `${node.type}: ` +
                `${node.file}::${node.function}`
              );

            })
            .join("\n");

          return `
========== API FLOW ${index + 1} ==========

METHOD: ${c.method}
ROUTE: ${c.route}
FILE: ${c.file}

HANDLERS:
${c.handlers.join(", ")}

EXECUTION FLOW:
${flowText}
`;

        }


        // ----------------------------------------------
        // CODE
        // ----------------------------------------------

        return `
========== CODE ${index + 1} ==========

FILE: ${c.filePath}
TYPE: ${c.chunkType}
SYMBOL: ${c.symbolName}
LINES: ${c.startLine}-${c.endLine}

${c.chunk}
`;

      })
      .join("\n");


    // --------------------------------------------------
    // Ask Gemini
    // --------------------------------------------------

    
    const answer = await askGemini(
      context,
      question
    );
    

    


    // --------------------------------------------------
    // Sources
    // --------------------------------------------------

    const sources = [
      ...new Set(
        chunks.map((c) =>
          c.apiFlowMatch
            ? c.file
            : c.filePath
        )
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