const ApiFlow = require("../models/ApiFlow");
const buildApiFlowGraph = require("../services/apiFlowGraph");

exports.getApis = async (req, res) => {
  try {
    const { projectId, graph } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId is required",
      });
    }

    const apis = await ApiFlow.find({
      projectId,
    }).lean();

    // API Explorer
    if (!graph) {
      return res.json(apis);
    }

    // API Flow Graph
    const flowGraph = buildApiFlowGraph(apis);

    res.json(flowGraph);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to load APIs",
    });
  }
};