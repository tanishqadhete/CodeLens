const fs = require("fs");
const path = require("path");

function getRouteFiles(projectPath) {
  const routeFiles = [];

  function traverse(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else {
        if (
          file.toLowerCase().includes("route") ||
          fullPath.includes(`${path.sep}routes${path.sep}`)
        ) {
          routeFiles.push(fullPath);
        }
      }
    }
  }

  traverse(projectPath);

  return routeFiles;
}

function extractEndpoints(content) {
  const endpoints = [];

  const regex =
    /router\.(get|post|put|delete|patch)\s*\(\s*["'`](.*?)["'`]/g;

  let match;

  while ((match = regex.exec(content))) {
    endpoints.push(match[2]);
  }

  return endpoints;
}

function categorize(endpoint) {
  const lower = endpoint.toLowerCase();

  if (
    lower.includes("login") ||
    lower.includes("register") ||
    lower.includes("auth") ||
    lower.includes("password")
  ) {
    return "Authentication";
  }

  if (
    lower.includes("auction") ||
    lower.includes("bid")
  ) {
    return "Auction";
  }

  if (
    lower.includes("payment") ||
    lower.includes("checkout")
  ) {
    return "Payments";
  }

  if (lower.includes("user")) {
    return "Users";
  }

  if (lower.includes("notification")) {
    return "Notifications";
  }

  if (
        lower.includes("friend") ||
        lower.includes("like")
    ) {
    return "Social";
    }

    if (
    lower.includes("post")
    ) {
    return "Posts";
    }

  return "Miscellaneous";
}

function humanize(endpoint) {
  if (endpoint === "/" || endpoint === "") {
    return "Root Endpoint";
  }

  const parts = endpoint
    .split("/")
    .filter(
      part =>
        part &&
        !part.startsWith(":")
    );

  if (parts.length === 0) {
    return "Details";
  }

  return parts
    .map(
      part =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

function analyzeModules(projectPath) {
  const routeFiles = getRouteFiles(projectPath);

  const modules = {};

  for (const file of routeFiles) {
    try {
      const content = fs.readFileSync(file, "utf8");

      const endpoints = extractEndpoints(content);

      endpoints.forEach((endpoint) => {
        const category = categorize(endpoint);

        if (!modules[category]) {
          modules[category] = new Set();
        }

        modules[category].add(
            humanize(endpoint)
        );
      });
    } catch (err) {
      console.log(err);
    }
  }

  for (const key in modules) {
    modules[key] = [...modules[key]];
    }

    return modules;
}

module.exports = analyzeModules;