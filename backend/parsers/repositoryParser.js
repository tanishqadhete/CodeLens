import fs from "fs";
import path from "path";

const ignoredFolders = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "public",
  "assets",
];

const extensionMap = {
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".json": "JSON",
  ".md": "Markdown",
  ".html": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
  ".py": "Python",
  ".java": "Java",
  ".cpp": "C++",
  ".c": "C",
  ".cs": "C#",
  ".go": "Go",
  ".php": "PHP",
  ".rb": "Ruby",
  ".xml": "XML",
  ".yml": "YAML",
  ".yaml": "YAML",
};

const supportedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".html",
  ".css",
  ".scss",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".cs",
  ".go",
  ".php",
  ".rb",
  ".xml",
  ".yml",
  ".yaml",
]);

function parseDirectory(dirPath, rootPath, files = []) {
    console.log("Scanning:", dirPath);
    const entries = fs.readdirSync(dirPath, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    console.log("Found:", fullPath);
    // Ignore unwanted folders
    if (
      entry.isDirectory() &&
      ignoredFolders.includes(entry.name)
    ) {
      continue;
    }

    // Recursively parse directories
    if (entry.isDirectory()) {
      parseDirectory(fullPath, rootPath, files);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    // Skip binary and unsupported files
    if (!supportedExtensions.has(extension)) {
      continue;
    }

    // Skip very large files (>1MB)
    const stats = fs.statSync(fullPath);
    if (stats.size > 1024 * 1024) {
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, "utf8");

      files.push({
        path: path.relative(rootPath, fullPath),
        language: extensionMap[extension],
        content,
      });
    } catch (err) {
      console.log(`Could not read: ${fullPath}`);
    }
  }

  return files;
}

export const parseRepository = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder does not exist: ${folderPath}`);
  }

  return parseDirectory(folderPath, folderPath);
};