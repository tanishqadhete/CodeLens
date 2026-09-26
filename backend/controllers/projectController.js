const fs = require("fs/promises");
const path = require("path");

const Project = require("../models/Project");
const CodeChunk = require("../models/CodeChunk");
const ApiFlow = require("../models/ApiFlow");

const EXTRACTED_ROOT = path.resolve(__dirname, "..", "extracted");

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({ projectId });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const resolvedPath = path.resolve(project.projectPath);

    // Safety check: only delete folders inside extracted/
    if (
      !resolvedPath.startsWith(
        EXTRACTED_ROOT + path.sep
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project path",
      });
    }

    // Delete extracted project files
    await fs.rm(resolvedPath, {
      recursive: true,
      force: true,
    });

    // Delete indexed code chunks
    await CodeChunk.deleteMany({
      repositoryPath: project.projectPath,
    });

    // Delete indexed API flows
    await ApiFlow.deleteMany({
      repositoryPath: project.projectPath,
    });

    // Delete project record
    await Project.deleteOne({ projectId });

    res.json({
      success: true,
      message: "Project deleted",
    });
  } catch (err) {
    console.error("Delete project failed:", err);

    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};