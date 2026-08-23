const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const buildFunctionCallGraph = require("./functionCallGraph");
const supportedExtensions = [".js", ".jsx", ".ts", ".tsx"];
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

      // Always include the current call

      // Continue recursion ONLY if the function exists in our repository
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
  const functionGraph = buildFunctionCallGraph(folderPath);
  const importMap = buildImportMap(folderPath);
  console.log("Function Graph Size:", functionGraph.length);
  console.log(functionGraph[0]);
  function traverseDirectory(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDirectory(fullPath);
        continue;
      }

      if (!supportedExtensions.includes(path.extname(fullPath))) {
        continue;
      }

      const code = fs.readFileSync(fullPath, "utf-8");

      try {
        const ast = parse(code, {
          sourceType: "unambiguous",
          plugins: ["jsx", "typescript"],
        });

        traverse(ast, {
          CallExpression({ node }) {
            if (
              node.callee.type !== "MemberExpression" ||
              !node.callee.object ||
              !node.callee.property
            ) {
              return;
            }

            const objectName = node.callee.object.name;
            const methodName = node.callee.property.name;

            if (
              (objectName !== "router" && objectName !== "app") ||
              !["get", "post", "put", "delete", "patch"].includes(methodName)
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
              }

              else if (
                arg.type === "MemberExpression" &&
                arg.property.type === "Identifier"
              ) {
                handlers.push(arg.property.name);
              }

              else if (
                arg.type === "ArrowFunctionExpression" ||
                arg.type === "FunctionExpression"
              ) {
                handlers.push("Anonymous Function");
              }
            }

const flow = [];
const visited = new Set();

handlers.forEach((handler) => {

  // Try to find if this handler exists in function graph
  const currentRouteFile = path
  .relative(folderPath, fullPath)
  .replace(/\\/g, "/");

const importedFile = importMap[currentRouteFile]?.[handler];

let functionNode = null;

if (importedFile) {
  functionNode = functionGraph.find(
    (fn) =>
      fn.file === importedFile &&
      fn.function === handler
  );
}

// fallback if not imported
if (!functionNode) {
  functionNode = functionGraph.find(
    (fn) => fn.function === handler
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
  method: methodName.toUpperCase(),
  route,
  file: fullPath,
  handlers,
  flow,
});
          },
        });
      } catch (err) {
        console.log(`Failed parsing ${fullPath}`);
        console.error(err.message);
      }
    }
  }

  traverseDirectory(folderPath);
  console.log("APIs Found:", apis.length);

  return apis;
}

function buildExecutionFlow(nodeId, functionGraph, flow, visited) {
    if (!nodeId || visited.has(nodeId)) return;

    visited.add(nodeId);

    const node = functionGraph.find(fn => fn.id === nodeId);

    if (!node) return;

    flow.push(node);

    node.calls.forEach(call => {
        buildExecutionFlow(call, functionGraph, flow, visited);
    });
}

module.exports = extractApis;