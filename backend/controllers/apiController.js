const extractApis = require("../services/apiExtractor");
const buildApiFlowGraph = require("../services/apiFlowGraph");
const explainNode = require("../services/apiFlowExplainService");
exports.getApis = (req, res) => {
  console.log("BODY:", req.body);
console.log("GRAPH:", req.body.graph, typeof req.body.graph);
  try {
    const { projectPath, graph } = req.body;

    const apis = extractApis(projectPath);
    console.log(JSON.stringify(apis, null, 2));
    // API Explorer
    if (!graph) {
      return res.json(apis);
    }

    // API Flow Graph
    const flowGraph = buildApiFlowGraph(apis);

    res.json(flowGraph);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to extract APIs",
    });
  }
};

exports.explainNode = async (req, res) => {
  try {
    const { node, route, method } = req.body;

    if (!node) {
      return res.status(400).json({
        message: "Node is required",
      });
    }

    const explanation = await explainNode(
      node,
      route,
      method
    );

    res.json({
      explanation,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to explain node",
    });
  }
};