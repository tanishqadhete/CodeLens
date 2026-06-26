const fs = require("fs");
const path = require("path");

function normalizePath(filePath) {
  return path.normalize(filePath);
}

function getAllFiles(dir) {
  let results = [];

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(
        getAllFiles(fullPath)
      );
    } else if (
      file.endsWith(".js") ||
      file.endsWith(".jsx")
    ) {
      results.push(normalizePath(fullPath));
    }
  }

  return results;
}

function detectDeadCode(projectPath) {
  const allFiles = getAllFiles(projectPath);

  const importedFiles = new Set();

  const importRegex =
    /import.*from\s+['"](.*?)['"]/g;

  const requireRegex =
    /require\(['"](.*?)['"]\)/g;

  allFiles.forEach((file) => {
    const content = fs.readFileSync(
      file,
      "utf8"
    );

    let match;

    // ES Imports
    while (
      (match = importRegex.exec(content)) !==
      null
    ) {
      const importPath = match[1];

      // Ignore npm packages
      if (!importPath.startsWith(".")) {
        continue;
      }

      const resolvedPath =
        normalizePath(
          path.resolve(
            path.dirname(file),
            importPath
          )
        );

      if (
        fs.existsSync(
          resolvedPath + ".js"
        )
      ) {
        importedFiles.add(
          normalizePath(
            resolvedPath + ".js"
          )
        );
      }

      if (
        fs.existsSync(
          resolvedPath + ".jsx"
        )
      ) {
        importedFiles.add(
          normalizePath(
            resolvedPath + ".jsx"
          )
        );
      }

      if (
        fs.existsSync(
          path.join(
            resolvedPath,
            "index.js"
          )
        )
      ) {
        importedFiles.add(
          normalizePath(
            path.join(
              resolvedPath,
              "index.js"
            )
          )
        );
      }

      if (
        fs.existsSync(
          path.join(
            resolvedPath,
            "index.jsx"
          )
        )
      ) {
        importedFiles.add(
          normalizePath(
            path.join(
              resolvedPath,
              "index.jsx"
            )
          )
        );
      }
    }

    // CommonJS require()
    while (
      (match = requireRegex.exec(content)) !==
      null
    ) {
      const importPath = match[1];

      if (!importPath.startsWith(".")) {
        continue;
      }

      const resolvedPath =
        normalizePath(
          path.resolve(
            path.dirname(file),
            importPath
          )
        );

      if (
        fs.existsSync(
          resolvedPath + ".js"
        )
      ) {
        importedFiles.add(
          normalizePath(
            resolvedPath + ".js"
          )
        );
      }

      if (
        fs.existsSync(
          resolvedPath + ".jsx"
        )
      ) {
        importedFiles.add(
          normalizePath(
            resolvedPath + ".jsx"
          )
        );
      }

      if (
        fs.existsSync(
          path.join(
            resolvedPath,
            "index.js"
          )
        )
      ) {
        importedFiles.add(
          normalizePath(
            path.join(
              resolvedPath,
              "index.js"
            )
          )
        );
      }

      if (
        fs.existsSync(
          path.join(
            resolvedPath,
            "index.jsx"
          )
        )
      ) {
        importedFiles.add(
          normalizePath(
            path.join(
              resolvedPath,
              "index.jsx"
            )
          )
        );
      }
    }
  });

  const unusedFiles =
    allFiles.filter((file) => {
      const name =
        path.basename(file);

      // Entry files
      if (
        name === "main.jsx" ||
        name === "main.js" ||
        name === "App.jsx" ||
        name === "App.js" ||
        name === "server.js" ||
        name === "index.js"
      ) {
        return false;
      }

      return !importedFiles.has(file);
    });
  const unusedFunctions = [];  
  const functionRegex =
  /function\s+([a-zA-Z0-9_]+)/g;
  const arrowFunctionRegex =
  /const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s*)?\(/g;
  let entireProject = "";
  allFiles.forEach((file) => {
    entireProject += fs.readFileSync(
      file,
      "utf8"
    );
  });
  allFiles.forEach((file) => {
    const content = fs.readFileSync(
      file,
      "utf8"
    );

    let match;

    while (
      (match =
        functionRegex.exec(content)) !==
      null
    ) {
      const functionName = match[1];

      const regex = new RegExp(
        "\\b" + functionName + "\\b",
        "g"
      );

      const occurrences =
        (
          entireProject.match(regex) ||
          []
        ).length;

      if (
        occurrences <= 1 &&
        functionName[0] ===
          functionName[0].toLowerCase()
      ) {
        unusedFunctions.push({
          function: functionName,
          file,
        });
      }
    }
    while (
      (match =
        arrowFunctionRegex.exec(content)) !==
      null
    ) {
      const functionName = match[1];

      const regex = new RegExp(
        "\\b" + functionName + "\\b",
        "g"
      );

      const occurrences =
        (
          entireProject.match(regex) ||
          []
        ).length;

      if (
        occurrences <= 1 &&
        functionName[0] ===
          functionName[0].toLowerCase()
      ) {
        unusedFunctions.push({
          function: functionName,
          file,
        });
      }
    }
  });
  const unusedComponents = [];

const componentRegex =
  /function\s+([A-Z][a-zA-Z0-9_]*)/g;

const arrowComponentRegex =
  /const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*(async\s*)?\(/g;

const exportedComponentRegex =
  /export\s+const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*(async\s*)?\(/g;

allFiles.forEach((file) => {
  const content = fs.readFileSync(
    file,
    "utf8"
  );

  let match;

  // function MyComponent() {}
  while (
    (match =
      componentRegex.exec(content)) !==
    null
  ) {
    const componentName = match[1];

    const regex = new RegExp(
      "\\b" + componentName + "\\b",
      "g"
    );

    const occurrences =
      (
        entireProject.match(regex) ||
        []
      ).length;

    if (occurrences <= 1) {
      unusedComponents.push({
        component: componentName,
        file,
      });
    }
  }

  // const MyComponent = () => {}
  while (
    (match =
      arrowComponentRegex.exec(
        content
      )) !== null
  ) {
    const componentName = match[1];

    const regex = new RegExp(
      "\\b" + componentName + "\\b",
      "g"
    );

    const occurrences =
      (
        entireProject.match(regex) ||
        []
      ).length;

    if (occurrences <= 1) {
      unusedComponents.push({
        component: componentName,
        file,
      });
    }
  }

  // export const MyComponent = () => {}
  while (
    (match =
      exportedComponentRegex.exec(
        content
      )) !== null
  ) {
    const componentName = match[1];

    const regex = new RegExp(
      "\\b" + componentName + "\\b",
      "g"
    );

    const occurrences =
      (
        entireProject.match(regex) ||
        []
      ).length;

    if (occurrences <= 1) {
      unusedComponents.push({
        component: componentName,
        file,
      });
    }
  }
});

const uniqueUnusedComponents =
  Array.from(
    new Map(
      unusedComponents.map((c) => [
        c.component,
        c,
      ])
    ).values()
  );
  return {
    warning:
    "Basic heuristic. Results may contain false positives.",
    unusedFiles,
    unusedFunctions,
    unusedComponents: uniqueUnusedComponents,
  };
}

module.exports = detectDeadCode;