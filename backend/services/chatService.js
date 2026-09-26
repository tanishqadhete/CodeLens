const CodeChunk = require("../models/CodeChunk");
const ApiFlow = require("../models/ApiFlow");
const createEmbedding = require("./embeddingService");

async function retrieveChunks(repositoryPath, question) {
  const questionEmbedding = await createEmbedding(question);
  const vectorResults = await CodeChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: questionEmbedding,
        numCandidates: 400,
        limit: 25,
        filter: {
          repositoryPath: repositoryPath,
        },
      },
    },
    {
      $project: {
        _id: 1,
        filePath: 1,
        chunk: 1,
        chunkType: 1,
        symbolName: 1,
        startLine: 1,
        endLine: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ]);

  const apiFlowResults = await ApiFlow.aggregate([
    {
      $vectorSearch: {
        index: "api_flow_vector_index",
        path: "embedding",
        queryVector: questionEmbedding,
        numCandidates: 400,
        limit: 25,
        filter: {
          repositoryPath: repositoryPath,
        },
      },
    },
    {
      $project: {
        _id: 1,
        repositoryPath: 1,
        method: 1,
        route: 1,
        file: 1,
        handlers: 1,
        flow: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ]);

  console.log(
    "\n========== API FLOW RETRIEVAL ==========\n"
  );

  console.log(
    apiFlowResults.map((api) => ({
      method: api.method,
      route: api.route,
      score: api.score,
      file: api.file,
    }))
  );

  console.log(
    "\n=========================================\n"
  );

  const STOP_WORDS = new Set([
    "the",
    "how",
    "does",
    "what",
    "why",
    "where",
    "when",
    "which",
    "who",
    "this",
    "that",
    "these",
    "those",
    "with",
    "from",
    "into",
    "about",
    "for",
    "and",
    "are",
    "is",
    "was",
    "were",
    "can",
    "could",
    "would",
    "should",
    "function",
    "class",
    "method",
    "code",
    "work",
    "works",
    "show",
    "explain",
    "tell",
    "please",
  ]);

  const words =
    question.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || [];

  const possibleSymbols = [
    ...new Set(
      words
        .filter((word) => word.length >= 3)
        .filter(
          (word) =>
            !STOP_WORDS.has(word.toLowerCase())
        )
    ),
  ];

  const exactResults = [];

  const exactMatches = await Promise.all(
    possibleSymbols.map((symbol) =>
      CodeChunk.find({
        repositoryPath,
        symbolName: symbol,
      })
        .select({
          _id: 1,
          filePath: 1,
          chunk: 1,
          chunkType: 1,
          symbolName: 1,
          startLine: 1,
          endLine: 1,
        })
        .lean()
    )
  );

  for (const matches of exactMatches) {
    exactResults.push(...matches);
  }

  const exactFormatted = exactResults.map((result) => ({
    ...result,
    score: 1,
    exactMatch: true,
  }));

  const combinedCodeResults = [
    ...exactFormatted,
    ...vectorResults,
  ];

  const uniqueCode = new Map();

  for (const result of combinedCodeResults) {
    const key = String(result._id);

    if (!uniqueCode.has(key)) {
      uniqueCode.set(key, result);
    }
  }

  const codeResults =
    Array.from(uniqueCode.values());

  const exactCodeResults = codeResults
    .filter((result) => result.exactMatch)
    .sort((a, b) => b.score - a.score);

  const semanticCodeResults = codeResults
    .filter((result) => !result.exactMatch)
    .sort((a, b) => b.score - a.score);

  function applyRelativeThreshold(results) {
    if (results.length === 0) {
      return [];
    }

    const topScore = results[0].score;

    const minimumScore = Math.max(
      topScore - 0.15,
      0.3
    );

    return results.filter(
      (result) => result.score >= minimumScore
    );
  }

  const filteredSemanticCodeResults =
    applyRelativeThreshold(semanticCodeResults);

  const filteredApiFlowResults =
    applyRelativeThreshold(apiFlowResults);

  const selectedExactResults =
    exactCodeResults.slice(0, 8);

  const selectedSemanticCodeResults =
    filteredSemanticCodeResults.slice(0, 12);

  const selectedApiFlowResults =
    filteredApiFlowResults.slice(0, 6).map((api) => ({
      ...api,
      resultType: "api-flow",
      apiFlowMatch: true,
    }));

  const finalResults = [
    ...selectedExactResults,
    ...selectedSemanticCodeResults,
    ...selectedApiFlowResults,
  ];


  console.log(
    "\n========== FINAL RETRIEVAL ==========\n"
  );

  console.log(
    finalResults.map((r) => {
      if (r.apiFlowMatch) {
        return {
          type: "API FLOW",
          method: r.method,
          route: r.route,
          score: r.score,
        };
      }

      return {
        type: "CODE",
        file: r.filePath,
        symbol: r.symbolName,
        score: r.score,
        exact: r.exactMatch || false,
      };
    })
  );

  console.log(
    "\n======================================\n"
  );

  return finalResults;
}

module.exports = retrieveChunks;