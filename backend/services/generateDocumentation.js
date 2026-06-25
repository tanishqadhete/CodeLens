const getProjectStats = require("./documentationService");
const analyzeModules = require("./moduleAnalyzer");

function generateDocumentation(projectPath) {
  const stats = getProjectStats(projectPath);
  const modules = analyzeModules(projectPath);

  let markdown = `# Project Overview\n\n`;

  markdown += `## Statistics\n`;
  markdown += `- Total Files: ${stats.totalFiles}\n`;
  markdown += `- Controllers: ${stats.controllers.length}\n`;
  markdown += `- Models: ${stats.models.length}\n`;
  markdown += `- Routes: ${stats.routes.length}\n`;
  markdown += `- Services: ${stats.services.length}\n\n`;

  Object.keys(modules).forEach(module => {
    markdown += `## ${module}\n`;

    modules[module].forEach(feature => {
        markdown += `- ${feature}\n`;
    });

    markdown += "\n";
    });
    const features = Object.keys(modules);
  return {
    markdown,
    stats,
    features,
    modules
  };
}

module.exports = generateDocumentation;