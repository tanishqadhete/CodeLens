const path = require("path");
const fs = require("fs");

const upload = require("../services/uploadService");
const extractZip = require("../services/extractService");
const { cloneRepository } = require("../services/githubCloneService");
const indexRepository = require("../services/indexRepositoryService");
const { randomUUID } = require("crypto");
const Project = require("../models/Project");

const uploadGithubRepo = async (req, res) => {
  let projectPath = null;

  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required",
      });
    }

    const projectId = randomUUID();

    projectPath = await cloneRepository(
      repoUrl,
      projectId
    );

    console.log("Indexing repository...");

    await indexRepository(
      projectPath,
      projectId
    );

    const projectName = repoUrl
      .split("/")
      .pop()
      .replace(".git", "");

    console.log("BEFORE Project.create:", {
  projectId,
  projectPath,
  projectName,
});

const project = await Project.create({
  projectId,
  projectPath,
  projectName,
});

console.log("AFTER Project.create:", project);
console.log(
  "Project count:",
  await Project.countDocuments()
);

    res.json({
      success: true,
      projectId,
      projectName,
    });
  } catch (err) {
    console.error(err);

    // Clean up cloned repository if processing failed
    if (projectPath) {
      await fs.promises
        .rm(projectPath, {
          recursive: true,
          force: true,
        })
        .catch((cleanupError) => {
          console.error(
            "Failed to clean up project folder:",
            cleanupError
          );
        });
    }

    res.status(500).json({
      success: false,
      message: "Failed to process repository",
    });
  }
};

exports.uploadGithubRepo = uploadGithubRepo;

exports.uploadZip = (req, res) => {
  upload.single("zipFile")(req, res, async (err) => {
    let extractFolder = null;
    let zipPath = null;

    try {
      if (err) {
        return res.status(500).json({
          message: "Upload Failed",
          error: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      zipPath = req.file.path;

      const projectId = randomUUID();

      extractFolder = path.join(
        "extracted",
        projectId
      );

      fs.mkdirSync(extractFolder, {
        recursive: true,
      });

      console.log(
        "File received:",
        req.file.originalname
      );

      await extractZip(
        zipPath,
        extractFolder
      );

      console.log("Indexing repository...");

      await indexRepository(
        extractFolder,
        projectId
      );

      console.log("Repository indexed");
      console.log("Extraction complete");

      const projectName = path.parse(
        req.file.originalname
      ).name;

      await Project.create({
        projectId,
        projectPath: extractFolder,
        projectName,
      });

      // The original ZIP is no longer needed
      await fs.promises
        .rm(zipPath, {
          force: true,
        })
        .catch((cleanupError) => {
          console.error(
            "Failed to delete uploaded ZIP:",
            cleanupError
          );
        });

      res.json({
        success: true,
        message: "Upload Successful",
        projectId,
        projectName,
      });
    } catch (error) {
      console.error(error);

      // Clean up extracted project if processing failed
      if (extractFolder) {
        await fs.promises
          .rm(extractFolder, {
            recursive: true,
            force: true,
          })
          .catch((cleanupError) => {
            console.error(
              "Failed to clean up extracted folder:",
              cleanupError
            );
          });
      }

      // Clean up original uploaded ZIP
      if (zipPath) {
        await fs.promises
          .rm(zipPath, {
            force: true,
          })
          .catch((cleanupError) => {
            console.error(
              "Failed to delete uploaded ZIP:",
              cleanupError
            );
          });
      }

      res.status(500).json({
        success: false,
        message: "Failed to process uploaded ZIP",
        error: error.message,
      });
    }
  });
};