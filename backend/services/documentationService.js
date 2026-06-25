const path = require("path");
const fs = require("fs");

function getProjectStats(projectPath) {
  const stats = {
    totalFiles: 0,
    controllers: [],
    models: [],
    routes: [],
    services: []
  };

  function traverse(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else {
        stats.totalFiles++;

        const lower = fullPath.toLowerCase();

        if (lower.includes("controller"))
          stats.controllers.push(fullPath);

        if (lower.includes("model"))
          stats.models.push(fullPath);

        if (lower.includes("route"))
          stats.routes.push(fullPath);

        if (lower.includes("service"))
          stats.services.push(fullPath);
      }
    }
  }

  traverse(projectPath);

  return stats;
}

module.exports = getProjectStats;