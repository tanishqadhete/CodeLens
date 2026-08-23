const CodeChunk = require("../models/CodeChunk");
const ApiFlow = require("../models/ApiFlow");
const createEmbedding = require("./embeddingService");

async function retrieveChunks(repositoryPath, question) {

  // --------------------------------------------------
  // 1. Create question embedding
  // --------------------------------------------------

  const questionEmbedding =
    await createEmbedding(question);


  // --------------------------------------------------
  // 2. Semantic / Vector Search - Code
  // --------------------------------------------------

  const vectorResults =
    await CodeChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: questionEmbedding,
          numCandidates: 100,
          limit: 10,
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

      {
        $match: {
          score: {
            $gte: 0.55,
          },
        },
      },
    ]);


  // --------------------------------------------------
  // 3. Semantic / Vector Search - API Flows
  // --------------------------------------------------

  const apiFlowResults =
    await ApiFlow.aggregate([
      {
        $vectorSearch: {
          index: "api_flow_vector_index",
          path: "embedding",
          queryVector: questionEmbedding,
          numCandidates: 100,
          limit: 5,
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

      {
        $match: {
          score: {
            $gte: 0.55,
          },
        },
      },
    ]);


  // --------------------------------------------------
  // Debug API flow retrieval
  // --------------------------------------------------

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


  // --------------------------------------------------
  // 4. Extract possible symbols from question
  // --------------------------------------------------

  const words =
    question.match(
      /[A-Za-z_$][A-Za-z0-9_$]*/g
    ) || [];

  const possibleSymbols = [
    ...new Set(words),
  ];


  // --------------------------------------------------
  // 5. Exact symbol search
  // --------------------------------------------------

  const exactResults = [];

  for (const symbol of possibleSymbols) {

    const matches =
      await CodeChunk.find({
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
        .lean();

    exactResults.push(...matches);
  }


  // --------------------------------------------------
  // 6. Mark exact matches
  // --------------------------------------------------

  const exactFormatted =
    exactResults.map((result) => ({
      ...result,
      score: 1,
      exactMatch: true,
    }));


  // --------------------------------------------------
  // 7. Combine Code results
  // --------------------------------------------------

  const combinedCodeResults = [
    ...exactFormatted,
    ...vectorResults,
  ];


  // --------------------------------------------------
  // 8. Remove duplicate Code results
  // --------------------------------------------------

  const uniqueCode = new Map();

  for (const result of combinedCodeResults) {

    const key = String(result._id);

    if (!uniqueCode.has(key)) {
      uniqueCode.set(key, result);
    }
  }

  const codeResults =
    Array.from(uniqueCode.values());


  // --------------------------------------------------
  // 9. Mark API flow results
  // --------------------------------------------------

  const formattedApiFlows =
    apiFlowResults.map((api) => ({
      ...api,

      resultType: "api-flow",
      apiFlowMatch: true,
    }));


  // --------------------------------------------------
  // 10. Combine Code + API Flow results
  // --------------------------------------------------

  const allResults = [
    ...codeResults,
    ...formattedApiFlows,
  ];


  // --------------------------------------------------
  // 11. Sort results
  // --------------------------------------------------

  allResults.sort((a, b) => {

    // Exact code symbol matches first
    if (
      Boolean(b.exactMatch) !==
      Boolean(a.exactMatch)
    ) {
      return b.exactMatch ? 1 : -1;
    }

    // Then API flow / normal similarity
    return b.score - a.score;

  });


  // --------------------------------------------------
  // 12. Limit final context
  // --------------------------------------------------

  const finalResults =
    allResults.slice(0, 10);


  // --------------------------------------------------
  // 13. Debug output
  // --------------------------------------------------

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