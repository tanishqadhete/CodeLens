const fs = require("fs");
const path = require("path");

function loadFunctionGraph() {
  const graphPath = path.join(
    __dirname,
    "..",
    "functionGraph.json"
  );

  if (!fs.existsSync(graphPath)) {
    return [];
  }

  return JSON.parse(
    fs.readFileSync(graphPath, "utf-8")
  );
}

function expandWithGraph(chunks) {
  const graph = loadFunctionGraph();

  const graphMap = new Map();

  for (const node of graph) {
    graphMap.set(node.id, node);
  }

  const expanded = [...chunks];

  for (const chunk of chunks) {
    if (!chunk.symbolName) continue;

    const nodeId =
      `${chunk.filePath}::${chunk.symbolName}`;

    const node = graphMap.get(nodeId);

    if (!node) continue;

    for (const calledFunction of node.calls || []) {
      const calledNode =
        graphMap.get(calledFunction);

      if (!calledNode) continue;

      expanded.push({
        filePath: calledNode.file,
        symbolName: calledNode.function,
        chunk: calledNode.code,
        chunkType: "graph-related",
        startLine: null,
        endLine: null,
        score: 0.5,
        graphRelated: true,
      });
    }
  }

  return expanded;
}

module.exports = expandWithGraph;