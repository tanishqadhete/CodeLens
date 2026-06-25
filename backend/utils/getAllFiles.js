const fs = require("fs");
const path = require("path");

const ignored = [
"package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
];

const allowedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".css",
  ".html",
  ".md",
  ".env",
];

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    // Skip unwanted folders
    if (
      stat.isDirectory() &&
      ignored.includes(entry)
    ) {
      continue;
    }
    if (!stat.isDirectory() && stat.size > 500000) {
        continue;
    }
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      const ext = path.extname(entry);

      if (
        allowedExtensions.includes(ext) ||
        entry === ".env"
      ) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

module.exports = getAllFiles;