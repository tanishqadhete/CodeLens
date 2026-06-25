const CodeChunk = require("../models/CodeChunk");
const createEmbedding = require("./embeddingService");
const cosineSimilarity = require("../utils/cosineSimilarity");

async function retrieveChunks(projectId, question) {
  const questionEmbedding =
    await createEmbedding(question);

  const chunks =
    await CodeChunk.find({ projectId });

  const ranked = chunks
    .map((chunk) => ({
      ...chunk.toObject(),
      score: cosineSimilarity(
        questionEmbedding,
        chunk.embedding
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return ranked;
}

module.exports = retrieveChunks;