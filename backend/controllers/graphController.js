import { generateDependencyGraph } from "../services/dependencyGraph.js";

export const getDependencyGraph = async (req, res) => {
  try {
    const { projectPath } = req.body;

    const graph = generateDependencyGraph(projectPath);

    res.status(200).json(graph);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to generate graph"
    });
  }
};