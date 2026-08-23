const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

const cloneRepository = async (repoUrl) => {
  const projectId = Date.now().toString();
  const clonePath = path.join(__dirname, "..", "extracted", projectId);
  fs.mkdirSync(clonePath, { recursive: true });
  const git = simpleGit();
  await git.clone(repoUrl, clonePath);
  return clonePath;
};

module.exports = { cloneRepository };