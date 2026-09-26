const path = require("path");
const traverse = require("@babel/traverse").default;

const getAllFiles = require("../utils/getAllFiles");
const { getAst } = require("../utils/getAst");

const buildImportMap = require("./importResolver");

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
  "stringify",
]);

function buildFunctionCallGraph(projectPath) {
  // Use the shared file walker
  const files = getAllFiles(projectPath);

  const graph = [];
  const functionIndex = {};
  const importMap = buildImportMap(projectPath);

  // PASS 1: Collect all functions
  files.forEach((file) => {
    const relativePath = path
      .relative(projectPath, file)
      .replace(/\\/g, "/");

    try {
      // Use the shared AST cache
      const ast = getAst(file);

      traverse(ast, {
        FunctionDeclaration(pathNode) {
          if (pathNode.node.id) {
            const functionName =
              pathNode.node.id.name;

            const id =
              `${relativePath}::${functionName}`;

            if (!functionIndex[functionName]) {
              functionIndex[functionName] = [];
            }

            functionIndex[functionName].push({
              id,
              file: relativePath,
            });
          }
        },

        VariableDeclarator(pathNode) {
          if (
            pathNode.node.init &&
            (
              pathNode.node.init.type ===
                "ArrowFunctionExpression" ||
              pathNode.node.init.type ===
                "FunctionExpression"
            )
          ) {
            const functionName =
              pathNode.node.id.name;

            const id =
              `${relativePath}::${functionName}`;

            if (!functionIndex[functionName]) {
              functionIndex[functionName] = [];
            }

            functionIndex[functionName].push({
              id,
              file: relativePath,
            });
          }
        },
      });
    } catch (err) {
      console.log(
        `Failed parsing ${relativePath}`
      );
    }
  });

  // PASS 2: Build graph
  files.forEach((file) => {
    const relativePath = path
      .relative(projectPath, file)
      .replace(/\\/g, "/");

    try {
      // getAst() returns the cached AST from PASS 1
      const ast = getAst(file);

      traverse(ast, {
        FunctionDeclaration(pathNode) {
          extractFunction(
            pathNode,
            relativePath,
            graph,
            functionIndex,
            importMap
          );
        },

        FunctionExpression(pathNode) {
          extractFunction(
            pathNode,
            relativePath,
            graph,
            functionIndex,
            importMap
          );
        },

        ArrowFunctionExpression(pathNode) {
          extractFunction(
            pathNode,
            relativePath,
            graph,
            functionIndex,
            importMap
          );
        },
      });
    } catch (err) {
      console.log(
        `Failed parsing ${relativePath}`
      );
    }
  });

  return graph;
}

function getNodeType(file) {
  const normalized = file.replace(/\\/g, "/");

  if (normalized.includes("/routes/")) {
    return "route";
  }

  if (normalized.includes("/middleware/")) {
    return "middleware";
  }

  if (normalized.includes("/controllers/")) {
    return "controller";
  }

  if (normalized.includes("/services/")) {
    return "service";
  }

  if (normalized.includes("/models/")) {
    return "model";
  }

  if (normalized.includes("/utils/")) {
    return "utility";
  }

  if (normalized.includes("/config/")) {
    return "config";
  }

  return "function";
}

function resolveFunctionCall(
  functionName,
  relativePath,
  functionIndex,
  importMap
) {
  // 1. Prefer explicit import resolution
  const importedFile =
    importMap[relativePath]?.[functionName];

  if (importedFile) {
    return `${importedFile}::${functionName}`;
  }

  // 2. Fall back to global function index
  const candidates =
    functionIndex[functionName] || [];

  // No function found
  if (candidates.length === 0) {
    return null;
  }

  // Exactly one function with this name
  if (candidates.length === 1) {
    return candidates[0].id;
  }

  // Multiple functions with the same name.
  // Do not silently choose one.
  return null;
}

function extractFunction(
  pathNode,
  relativePath,
  graph,
  functionIndex,
  importMap
) {
  let functionName = "anonymous";

  if (pathNode.node.id) {
    functionName = pathNode.node.id.name;
  } else if (
    pathNode.parent.type ===
    "VariableDeclarator"
  ) {
    functionName = pathNode.parent.id.name;
  }

  const id =
    `${relativePath}::${functionName}`;

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
          variableTypeMap[
            varPath.node.id.name
          ] = importedModel;
        }
      }
    },

    CallExpression(callPath) {
      const callee = callPath.node.callee;

      // Direct function call:
      // validate()
      if (callee.type === "Identifier") {
        const resolvedId =
          resolveFunctionCall(
            callee.name,
            relativePath,
            functionIndex,
            importMap
          );

        if (resolvedId) {
          calls.push(resolvedId);
        }

        return;
      }

      // Object method call:
      // object.validate()
      if (
        callee.type === "MemberExpression" &&
        callee.object.type === "Identifier" &&
        callee.property.type === "Identifier"
      ) {
        const objectName =
          callee.object.name;

        if (
          objectName === "Promise" ||
          objectName === "Array" ||
          objectName === "Object" ||
          objectName === "Math" ||
          objectName === "JSON"
        ) {
          return;
        }

        const functionName =
          callee.property.name;

        if (
          ignoredFunctions.has(functionName)
        ) {
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
          const modelPath =
            variableTypeMap[objectName];

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
