const fs = require("fs");
const path = require("path");

const CodeChunk = require("../models/CodeChunk");
const chunkCode = require("./chunkService");
const createEmbedding = require("./embeddingService");
const getAllFiles = require("../utils/getAllFiles");

async function indexRepository(projectId, projectPath) {
  const files = getAllFiles(projectPath);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");

      const chunks = chunkCode(content);

      for (const chunk of chunks) {
          console.log(`Embedding chunk from ${file}`);

            const embedding = await createEmbedding(chunk);

            console.log(`Saving chunk from ${file}`);

        await CodeChunk.create({
          projectId,
          filePath: path.relative(
            projectPath,
            file
          ),
          chunk,
          embedding,
        });
      }

      console.log(`Indexed ${file}`);
    } catch (err) {
        console.log(`Failed: ${file}`);
        console.error(err);
    }
  }
}

module.exports = indexRepository;