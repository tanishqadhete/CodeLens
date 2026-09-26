const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

const ALLOWED_HOSTS = [
  "github.com",
  "gitlab.com",
  "bitbucket.org",
];

const cloneRepository = async (repoUrl, projectId) => {
  // Validate repository URL
  let url;

  try {
    url = new URL(repoUrl);
  } catch {
    throw new Error("Invalid repository URL");
  }

  // Only allow HTTPS
  if (url.protocol !== "https:") {
    throw new Error("Only HTTPS repository URLs are allowed");
  }

  // Only allow trusted Git hosting platforms
  if (!ALLOWED_HOSTS.includes(url.hostname)) {
    throw new Error(
      "Repository host is not allowed"
    );
  }

  const clonePath = path.join(
    __dirname,
    "..",
    "extracted",
    projectId
  );

  fs.mkdirSync(clonePath, {
    recursive: true,
  });

  const git = simpleGit();

  await git.clone(repoUrl, clonePath);

  return clonePath;
};

module.exports = { cloneRepository };
