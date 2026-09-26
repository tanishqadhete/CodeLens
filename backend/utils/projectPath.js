const path = require("path");
const Project = require("../models/Project");

const EXTRACTED_ROOT = path.resolve(
  __dirname,
  "..",
  "extracted"
);

async function resolveProjectPath(projectId) {
  const project = await Project.findOne({ projectId });
  if (!project) {
    throw new Error("Project not found");
  }
  const resolved = path.resolve(project.projectPath);
  if (!resolved.startsWith(EXTRACTED_ROOT + path.sep)) {
    throw new Error("Invalid project path");
  }

  return resolved;
}

module.exports = resolveProjectPath;