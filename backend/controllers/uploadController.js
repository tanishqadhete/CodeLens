const path = require("path");
const fs = require("fs");

const upload = require("../services/uploadService");
const extractZip = require("../services/extractService");
const { cloneRepository } = require("../services/githubCloneService");
const indexRepository = require("../services/indexRepositoryService");

const uploadGithubRepo = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required",
      });
    }
    const projectPath = await cloneRepository(repoUrl);
    console.log("Indexing repository...");
    await indexRepository(projectPath);
    res.json({
      success: true,
      projectPath,
      projectName: repoUrl.split("/").pop().replace(".git", ""),
    });
  } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Failed to clone repository",
      });
  }
};

exports.uploadGithubRepo = uploadGithubRepo;

exports.uploadZip = (req, res) => {
  upload.single("zipFile")(req, res, async (err) => {
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

      const zipPath = req.file.path;

      const extractFolder = path.join(
        "extracted",
        Date.now().toString()
      );

      fs.mkdirSync(extractFolder, {
        recursive: true,
      });
      console.log("File received:", req.file?.originalname);
      await extractZip(zipPath, extractFolder);
      console.log("Indexing repository...");

await indexRepository(extractFolder);
console.log("Repository indexed");

      console.log("Extraction complete");
      const projectName = path.parse(req.file.originalname).name;
      res.json({
        success: true,
        message: "Upload Successful",
        projectPath: extractFolder,
        projectName,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Extraction failed",
        error: error.message,
      });
    }
  });
};