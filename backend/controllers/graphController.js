import { generateDependencyGraph } from "../services/dependencyGraph.js";
import resolveProjectPath from "../utils/projectPath.js";

export const getDependencyGraph = async (req, res) => {
  try {
    const { projectId } = req.body;
    const projectPath = await resolveProjectPath(projectId);

    const graph = generateDependencyGraph(projectPath);

    res.status(200).json(graph);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to generate graph"
    });
  }
};