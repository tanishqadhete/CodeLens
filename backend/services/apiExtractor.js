const path = require("path");

const getAllFiles = require("../utils/getAllFiles");
const { getAst } = require("../utils/getAst");

const buildFunctionCallGraph = require("./functionCallGraph");
const buildImportMap = require("./importResolver");

function buildCompleteFlow(startFunction, functionGraph) {
  const flow = [];
  const visited = new Set();

  function dfs(functionId) {
    if (!functionId) return;

    if (visited.has(functionId)) return;

    visited.add(functionId);

    const currentNode = functionGraph.find(
      (fn) => fn.id === functionId
    );

    if (!currentNode) return;

    flow.push(currentNode);

    currentNode.calls.forEach((calledFunction) => {
      const nextNode = functionGraph.find(
        (fn) => fn.id === calledFunction
      );

      if (nextNode) {
        dfs(nextNode.id);
      }
    });
  }

  dfs(startFunction);

  return flow;
}

function extractApis(folderPath) {
  const apis = [];

  const functionGraph =
    buildFunctionCallGraph(folderPath);

  const importMap =
    buildImportMap(folderPath);

  console.log(
    "Function Graph Size:",
    functionGraph.length
  );

  console.log(functionGraph[0]);

  // Use the shared file walker
  const files = getAllFiles(folderPath);

  for (const fullPath of files) {
    try {
      // Use the shared AST cache
      const ast = getAst(fullPath);

      // Convert absolute path to repository-relative path
      const relativeFile = path
        .relative(folderPath, fullPath)
        .replace(/\\/g, "/");

      const traverse =
        require("@babel/traverse").default;

      traverse(ast, {
        CallExpression({ node }) {
          if (
            node.callee.type !== "MemberExpression" ||
            !node.callee.object ||
            !node.callee.property
          ) {
            return;
          }

          const objectName =
            node.callee.object.name;

          const methodName =
            node.callee.property.name;

          if (
            (objectName !== "router" &&
              objectName !== "app") ||
            ![
              "get",
              "post",
              "put",
              "delete",
              "patch",
            ].includes(methodName)
          ) {
            return;
          }

          const args = node.arguments;

          if (
            args.length === 0 ||
            args[0].type !== "StringLiteral"
          ) {
            return;
          }

          const route = args[0].value;

          const handlers = [];

          for (let i = 1; i < args.length; i++) {
            const arg = args[i];

            if (arg.type === "Identifier") {
              handlers.push(arg.name);
            } else if (
              arg.type === "MemberExpression" &&
              arg.property.type === "Identifier"
            ) {
              handlers.push(
                arg.property.name
              );
            } else if (
              arg.type ===
                "ArrowFunctionExpression" ||
              arg.type ===
                "FunctionExpression"
            ) {
              handlers.push(
                "Anonymous Function"
              );
            }
          }

          const flow = [];
          const visited = new Set();

          handlers.forEach((handler) => {
            // Try to find if this handler exists
            // in the function graph
            const importedFile =
              importMap[relativeFile]?.[handler];

            let functionNode = null;

            if (importedFile) {
              functionNode =
                functionGraph.find(
                  (fn) =>
                    fn.file === importedFile &&
                    fn.function === handler
                );
            }

            // Fallback if not imported
            if (!functionNode) {
              functionNode =
                functionGraph.find(
                  (fn) =>
                    fn.function === handler
                );
            }

            if (functionNode) {
              buildExecutionFlow(
                functionNode.id,
                functionGraph,
                flow,
                visited
              );
            } else {
              flow.push({
                function: handler,
                type: "middleware",
                file: "",
                code: "",
                calls: [],
              });
            }
          });

          flow.push({
            id: "response",
            type: "response",
            function: "HTTP Response",
            file: "",
            code: "",
            calls: [],
          });

          apis.push({
            method:
              methodName.toUpperCase(),
            route,
            file: fullPath,
            handlers,
            flow,
          });
        },
      });
    } catch (err) {
      console.log(
        `Failed parsing ${fullPath}`
      );

      console.error(err.message);
    }
  }

  console.log("APIs Found:", apis.length);

  return apis;
}

function buildExecutionFlow(
  nodeId,
  functionGraph,
  flow,
  visited
) {
  if (!nodeId || visited.has(nodeId)) {
    return;
  }

  visited.add(nodeId);

  const node = functionGraph.find(
    (fn) => fn.id === nodeId
  );

  if (!node) return;

  flow.push(node);

  node.calls.forEach((call) => {
    buildExecutionFlow(
      call,
      functionGraph,
      flow,
      visited
    );
  });
}

module.exports = extractApis;
