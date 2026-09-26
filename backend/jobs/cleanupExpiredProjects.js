const fs = require("fs/promises");
const path = require("path");

const Project = require("../models/Project");
const CodeChunk = require("../models/CodeChunk");
const ApiFlow = require("../models/ApiFlow");

const EXTRACTED_ROOT = path.resolve(
  __dirname,
  "..",
  "extracted"
);

const PROJECT_EXPIRY_MS = 24 * 60 * 60 * 1000;

async function cleanupExpiredProjects() {
  try {
    const cutoff = new Date(
      Date.now() - PROJECT_EXPIRY_MS
    );

    const expiredProjects = await Project.find({
      lastActivityAt: {
        $lt: cutoff,
      },
    });

    for (const project of expiredProjects) {
      try {
        const resolvedPath = path.resolve(
          project.projectPath
        );

        // Safety check: never delete outside extracted/
        if (
          !resolvedPath.startsWith(
            EXTRACTED_ROOT + path.sep
          )
        ) {
          console.error(
            `Skipping unsafe project path: ${resolvedPath}`
          );
          continue;
        }

        console.log(
          `Cleaning expired project: ${project.projectId}`
        );

        // 1. Delete extracted files
        await fs.rm(resolvedPath, {
          recursive: true,
          force: true,
        });

        // 2. Delete code chunks
        await CodeChunk.deleteMany({
          repositoryPath: project.projectPath,
        });

        // 3. Delete API flows
        await ApiFlow.deleteMany({
          repositoryPath: project.projectPath,
        });

        // 4. Delete project record
        await Project.deleteOne({
          projectId: project.projectId,
        });

        console.log(
          `Deleted expired project: ${project.projectId}`
        );
      } catch (error) {
        console.error(
          `Failed to clean project ${project.projectId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error(
      "Expired project cleanup failed:",
      error
    );
  }
}

module.exports = cleanupExpiredProjects;