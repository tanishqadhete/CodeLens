const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CodeChunk = require("../models/CodeChunk");
const ApiFlow = require("../models/ApiFlow");

const chunkCode = require("./chunkService");
const createEmbedding = require("./embeddingService");
const getAllFiles = require("../utils/getAllFiles");
const { clearAstCache } = require("../utils/getAst");
const extractApis = require("./apiExtractor");

const EMBEDDING_CONCURRENCY = 4;

async function runWithConcurrency(
  items,
  worker,
  concurrency
) {
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const index = nextIndex++;

      if (index >= items.length) {
        return;
      }

      await worker(items[index]);
    }
  }

  const workers = [];

  const workerCount = Math.min(
    concurrency,
    items.length
  );

  for (let i = 0; i < workerCount; i++) {
    workers.push(runWorker());
  }

  await Promise.all(workers);
}

async function indexRepository(repositoryPath, projectId) {
  const runId = crypto.randomUUID();

  let indexingFailed = false;

  clearAstCache();

  try {
    const files = getAllFiles(repositoryPath);

    /*
     * --------------------------------------------------
     * STEP 1: Read files and create chunks
     * --------------------------------------------------
     */

    const allChunks = [];

    for (const file of files) {
      try {
        const content = await fs.promises.readFile(
          file,
          "utf-8"
        );

        const relativePath = path
          .relative(repositoryPath, file)
          .replace(/\\/g, "/");

        const chunks = chunkCode(
          content,
          relativePath
        );

        allChunks.push(
          ...chunks
        );

        console.log(
          `Prepared ${relativePath}`
        );
      } catch (err) {
        indexingFailed = true;

        console.log(
          `Failed: ${file}`
        );

        console.error(err);
      }
    }

    /*
     * --------------------------------------------------
     * STEP 2: Generate embeddings concurrently
     * --------------------------------------------------
     */

    console.log(
      `\nGenerating embeddings for ${allChunks.length} chunks...`
    );

    await runWithConcurrency(
      allChunks,
      async (chunkData) => {
        try {
          console.log(
            `Embedding ${chunkData.symbolName} from ${chunkData.filePath}`
          );

          const embedding =
            await createEmbedding(
              chunkData.chunk
            );

          await CodeChunk.create({
            repositoryPath,
            runId,
            filePath: chunkData.filePath,
            chunk: chunkData.chunk,
            embedding,
            chunkType: chunkData.chunkType,
            symbolName: chunkData.symbolName,
            startLine: chunkData.startLine,
            endLine: chunkData.endLine,
          });

          console.log(
            `Saved ${chunkData.symbolName}`
          );
        } catch (err) {
          indexingFailed = true;

          console.error(
            `Failed to embed ${chunkData.symbolName} from ${chunkData.filePath}`
          );

          console.error(err);
        }
      },
      EMBEDDING_CONCURRENCY
    );

    /*
     * --------------------------------------------------
     * STEP 3: Generate API flows
     * --------------------------------------------------
     */

    console.log(
      "\nGenerating API flows..."
    );

    const apis =
      extractApis(repositoryPath);

    console.log(
      `API flows generated: ${apis.length}`
    );

    /*
     * --------------------------------------------------
     * STEP 4: Embed API flows concurrently
     * --------------------------------------------------
     */

    await runWithConcurrency(
      apis,
      async (api) => {
        try {
          const flowText = `
API: ${api.method} ${api.route}

File: ${api.file}

Handlers:
${api.handlers.join(", ")}

Execution Flow:
${api.flow
  .map((item) => {
    if (item.type === "response") {
      return "HTTP Response";
    }

    return `${item.type}: ${item.function} (${item.file})`;
  })
  .join("\n")}
`;

          console.log(
            `Embedding API flow: ${api.method} ${api.route}`
          );

          const embedding =
            await createEmbedding(
              flowText
            );

          await ApiFlow.create({
            projectId,
            repositoryPath,
            runId,
            method: api.method,
            route: api.route,
            file: api.file,
            handlers: api.handlers,
            flow: api.flow,
            embedding,
          });

          console.log(
            `Saved API flow: ${api.method} ${api.route}`
          );
        } catch (err) {
          indexingFailed = true;

          console.error(
            `Failed to index API flow ${api.method} ${api.route}`
          );

          console.error(err);
        }
      },
      EMBEDDING_CONCURRENCY
    );

    /*
     * --------------------------------------------------
     * STEP 5: Handle failure
     * --------------------------------------------------
     */

    if (indexingFailed) {
      console.error(
        "\nRepository indexing failed. Keeping the previous index."
      );

      await CodeChunk.deleteMany({
        repositoryPath,
        runId,
      });

      await ApiFlow.deleteMany({
        repositoryPath,
        runId,
      });

      throw new Error(
        "Repository indexing failed"
      );
    }

    /*
     * --------------------------------------------------
     * STEP 6: Replace old generation
     * --------------------------------------------------
     */

    await CodeChunk.deleteMany({
      repositoryPath,
      runId: { $ne: runId },
    });

    await ApiFlow.deleteMany({
      repositoryPath,
      runId: { $ne: runId },
    });

    console.log(
      "\nRepository indexing completed."
    );
  } finally {
    clearAstCache();
  }
}

module.exports = indexRepository;