const ignoredFunctions = new Set([
    "map",
    "filter",
    "reduce",
    "forEach",
    "push",
    "pop",
    "shift",
    "unshift",
    "slice",
    "splice",
    "concat",
    "includes",
    "find",
    "findIndex",
    "sort",
    "reverse",
    "flat",
    "flatMap",
    "every",
    "some",
    "json",
    "status",
    "send",
    "sendStatus",
    "trim",
    "trimStart",
    "trimEnd",
    "startsWith",
    "endsWith",
    "toString",
    "toLowerCase",
    "toUpperCase",
    "parse",
    "stringify"
]);
const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const buildImportMap = require("./importResolver");
const supportedExtensions = [".js", ".jsx", ".ts", ".tsx"];

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (supportedExtensions.includes(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
}

function buildFunctionCallGraph(projectPath) {
  const files = getAllFiles(projectPath);

  const graph = [];
  const exportMap = {};
  const functionIndex = {};
  const importMap = buildImportMap(projectPath);

  // PASS 1 : Collect exports
  files.forEach((file) => {
    const relativePath = path.relative(projectPath, file).replace(/\\/g, "/");
    const code = fs.readFileSync(file, "utf8");

    try {
      const ast = parse(code, {
        sourceType: "unambiguous",
        plugins: ["jsx", "typescript"],
      });

      traverse(ast, {
        FunctionDeclaration(pathNode) {
          if (pathNode.node.id) {
            const id = `${relativePath}::${pathNode.node.id.name}`;

if (!functionIndex[pathNode.node.id.name]) {
    functionIndex[pathNode.node.id.name] = [];
}

functionIndex[pathNode.node.id.name].push({
    id,
    file: relativePath,
});

exportMap[pathNode.node.id.name] = id;
          }
        },

        VariableDeclarator(pathNode) {
          if (
            pathNode.node.init &&
            (pathNode.node.init.type === "ArrowFunctionExpression" ||
              pathNode.node.init.type === "FunctionExpression")
          ) {
            const id = `${relativePath}::${pathNode.node.id.name}`;

if (!functionIndex[pathNode.node.id.name]) {
    functionIndex[pathNode.node.id.name] = [];
}

functionIndex[pathNode.node.id.name].push({
    id,
    file: relativePath,
});

exportMap[pathNode.node.id.name] = id;
          }
        },
      });
    } catch {}
  });

  // PASS 2 : Build graph
  files.forEach((file) => {
    const relativePath = path.relative(projectPath, file).replace(/\\/g, "/");
    const code = fs.readFileSync(file, "utf8");

    try {
      const ast = parse(code, {
        sourceType: "unambiguous",
        plugins: ["jsx", "typescript"],
      });

      traverse(ast, {
        FunctionDeclaration(pathNode) {
          extractFunction(
    pathNode,
    relativePath,
    graph,
    exportMap,
    importMap
);
        },

        FunctionExpression(pathNode) {
          extractFunction(
    pathNode,
    relativePath,
    graph,
    exportMap,
    importMap
);
        },

        ArrowFunctionExpression(pathNode) {
          extractFunction(
    pathNode,
    relativePath,
    graph,
    exportMap,
    importMap
);
        },
      });
    } catch {}
  });

  return graph;
}

function getNodeType(file) {
  const normalized = file.replace(/\\/g, "/");

  if (normalized.includes("/routes/")) return "route";
  if (normalized.includes("/middleware/")) return "middleware";
  if (normalized.includes("/controllers/")) return "controller";
  if (normalized.includes("/services/")) return "service";
  if (normalized.includes("/models/")) return "model";
  if (normalized.includes("/utils/")) return "utility";
  if (normalized.includes("/config/")) return "config";

  return "function";
}

function extractFunction(
    pathNode,
    relativePath,
    graph,
    exportMap,
    importMap
) {
  let functionName = "anonymous";

  if (pathNode.node.id) {
    functionName = pathNode.node.id.name;
  } else if (
    pathNode.parent.type === "VariableDeclarator"
  ) {
    functionName = pathNode.parent.id.name;
  }

  const id = `${relativePath}::${functionName}`;
  const code = pathNode.toString();
  const variableTypeMap = {};
  const calls = [];

  pathNode.traverse({
    VariableDeclarator(varPath) {

    const init = varPath.node.init;

    if (
        !init ||
        init.type !== "AwaitExpression" ||
        init.argument.type !== "CallExpression"
    ) {
        return;
    }

    const call = init.argument.callee;

    if (
        call.type !== "MemberExpression" ||
        call.object.type !== "Identifier"
    ) {
        return;
    }

    const modelName = call.object.name;

    if (
        varPath.node.id.type === "Identifier"
    ) {
        const importedModel =
    importMap[relativePath]?.[modelName];
        if (importedModel) {
    variableTypeMap[varPath.node.id.name] = importedModel;
}
    }

},
    CallExpression(callPath) {
      const callee = callPath.node.callee;

      if (callee.type === "Identifier") {

    const importedFile =
        importMap[relativePath]?.[callee.name];

    if (importedFile) {

        const id =
            `${importedFile}::${callee.name}`;

        calls.push(id);

    }

}

else if (
    callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.property.type === "Identifier"
) {

    const objectName = callee.object.name;
    if (
    objectName === "Promise" ||
    objectName === "Array" ||
    objectName === "Object" ||
    objectName === "Math" ||
    objectName === "JSON"
) {
    return;
}
    const functionName = callee.property.name;
    if (ignoredFunctions.has(functionName)) {
    return;
}
    // Imported module
    const importedFile =
        importMap[relativePath]?.[objectName];

    if (importedFile) {

        calls.push(
            `${importedFile}::${functionName}`
        );

        return;
    }

    // Model instance
    if (variableTypeMap[objectName]) {
        const modelPath = variableTypeMap[objectName];
        calls.push(
    `${modelPath}::${functionName}`
);

    }

}
    },
  });

  graph.push({
    id,
    file: relativePath,
    type: getNodeType(relativePath),
    function: functionName,
    calls,
    code,
  });
}

module.exports = buildFunctionCallGraph;