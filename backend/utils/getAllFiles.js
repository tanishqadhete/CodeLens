const fs = require("fs");
const path = require("path");

const defaultIgnoredDirs = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vscode",
];

const defaultIgnoredFiles = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

const allowedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
];

function isSensitiveFile(filename) {
  return (
    filename === ".env" ||
    filename.startsWith(".env.") ||
    filename.endsWith(".pem") ||
    filename.endsWith(".key")
  );
}

function getAllFiles(
  dir,
  {
    ignoredDirs = defaultIgnoredDirs,
    ignoredFiles = defaultIgnoredFiles,
  } = {},
  files = []
) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    // Skip unwanted directories
    if (
      stat.isDirectory() &&
      ignoredDirs.includes(entry)
    ) {
      continue;
    }

    // Skip explicitly ignored files
    if (
      !stat.isDirectory() &&
      ignoredFiles.includes(entry)
    ) {
      continue;
    }

    // Skip sensitive files
    if (
      !stat.isDirectory() &&
      isSensitiveFile(entry)
    ) {
      continue;
    }

    // Skip very large files
    if (
      !stat.isDirectory() &&
      stat.size > 500000
    ) {
      continue;
    }

    if (stat.isDirectory()) {
      getAllFiles(
        fullPath,
        {
          ignoredDirs,
          ignoredFiles,
        },
        files
      );
    } else {
      const ext = path.extname(entry);

      if (allowedExtensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

module.exports = getAllFiles;