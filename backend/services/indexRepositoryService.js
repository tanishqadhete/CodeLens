const fs = require("fs");
const path = require("path");

const CodeChunk = require("../models/CodeChunk");
const ApiFlow = require("../models/ApiFlow");

const chunkCode = require("./chunkService");
const createEmbedding = require("./embeddingService");
const getAllFiles = require("../utils/getAllFiles");
const extractApis = require("./apiExtractor");


async function indexRepository(repositoryPath) {

  // ==================================================
  // 1. Remove old indexed code
  // ==================================================

  await CodeChunk.deleteMany({
    repositoryPath,
  });


  // ==================================================
  // 2. Remove old API flows
  // ==================================================

  await ApiFlow.deleteMany({
    repositoryPath,
  });


  // ==================================================
  // 3. Get repository files
  // ==================================================

  const files = getAllFiles(repositoryPath);


  // ==================================================
  // 4. Index code chunks
  // ==================================================

  for (const file of files) {

    try {

      const content =
        await fs.promises.readFile(
          file,
          "utf-8"
        );


      const relativePath =
        path
          .relative(repositoryPath, file)
          .replace(/\\/g, "/");


      // AST-based chunks
      const chunks =
        chunkCode(
          content,
          relativePath
        );


      for (const chunkData of chunks) {

        console.log(
          `Embedding ${chunkData.symbolName} from ${relativePath}`
        );


        // Embed actual code
        const embedding =
          await createEmbedding(
            chunkData.chunk
          );


        await CodeChunk.create({

          repositoryPath,

          filePath:
            relativePath,

          chunk:
            chunkData.chunk,

          embedding,

          chunkType:
            chunkData.chunkType,

          symbolName:
            chunkData.symbolName,

          startLine:
            chunkData.startLine,

          endLine:
            chunkData.endLine,

        });


        console.log(
          `Saved ${chunkData.symbolName}`
        );

      }


      console.log(
        `Indexed ${relativePath}`
      );


    } catch (err) {

      console.log(
        `Failed: ${file}`
      );

      console.error(err);

    }

  }


  // ==================================================
  // 5. Generate API flows
  // ==================================================

  console.log(
    "\nGenerating API flows..."
  );


  const apis =
    extractApis(repositoryPath);


  console.log(
    `API flows generated: ${apis.length}`
  );


  // ==================================================
  // 6. Store API flows + embeddings
  // ==================================================

  for (const api of apis) {

    try {

      // Convert the structured API flow
      // into meaningful text for embedding.

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


      // Create vector representation
      const embedding =
        await createEmbedding(
          flowText
        );


      // Save API flow + embedding
      await ApiFlow.create({

        repositoryPath,

        method:
          api.method,

        route:
          api.route,

        file:
          api.file,

        handlers:
          api.handlers,

        flow:
          api.flow,

        embedding,

      });


      console.log(
        `Saved API flow: ${api.method} ${api.route}`
      );


    } catch (err) {

      console.error(
        `Failed to index API flow ${api.method} ${api.route}`
      );

      console.error(err);

    }

  }


  console.log(
    "\nRepository indexing completed."
  );

}


module.exports = indexRepository;