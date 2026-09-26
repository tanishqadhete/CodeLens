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

// Give failed/crashed jobs some time before deleting
const ORPHAN_AGE_MS = 60 * 60 * 1000; // 1 hour

async function cleanupOrphanProjects() {
  try {
    const entries = await fs.readdir(
      EXTRACTED_ROOT,
      { withFileTypes: true }
    );

    const projects = await Project.find({})
      .select("projectId projectPath")
      .lean();

    const activeProjectIds = new Set(
      projects.map((project) => project.projectId)
    );

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const projectId = entry.name;

      // This folder belongs to a valid Project document
      if (activeProjectIds.has(projectId)) {
        continue;
      }

      const folderPath = path.resolve(
        EXTRACTED_ROOT,
        projectId
      );

      // Extra safety check
      if (
        !folderPath.startsWith(
          EXTRACTED_ROOT + path.sep
        )
      ) {
        continue;
      }

      const stats = await fs.stat(folderPath);

      // Don't immediately delete a folder from a job
      // that may still be running.
      if (
        Date.now() - stats.mtimeMs <
        ORPHAN_AGE_MS
      ) {
        continue;
      }

      console.log(
        `Cleaning orphan project folder: ${projectId}`
      );

      // Clean any DB data that may have been created
      // before the Project document was created.
      await CodeChunk.deleteMany({
        repositoryPath: folderPath,
      });

      await ApiFlow.deleteMany({
        repositoryPath: folderPath,
      });

      await fs.rm(folderPath, {
        recursive: true,
        force: true,
      });

      console.log(
        `Deleted orphan project: ${projectId}`
      );
    }
  } catch (error) {
    console.error(
      "Orphan project cleanup failed:",
      error
    );
  }
}

module.exports = cleanupOrphanProjects;