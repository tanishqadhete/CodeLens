const fs = require("fs");
const path = require("path");

function extractApis(folderPath) {
  const apis = [];

  function traverse(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (
        file.endsWith(".js") ||
        file.endsWith(".ts")
      ) {
        const content = fs.readFileSync(
          fullPath,
          "utf-8"
        );

        const regex =
          /(router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`](.*?)['"`]/g;

        let match;

        while ((match = regex.exec(content)) !== null) {
          apis.push({
            method: match[2].toUpperCase(),
            route: match[3],
            file: fullPath,
          });
        }
      }
    }
  }

  traverse(folderPath);

  return apis;
}

module.exports = extractApis;