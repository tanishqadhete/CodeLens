import overviewService from "../services/overviewService.js";
import resolveProjectPath from "../utils/projectPath.js";

export const getOverview = async (req, res) => {
  try {
    const { projectId } = req.body;

    console.log("Overview projectId:", projectId);

    const projectPath = await resolveProjectPath(projectId);

    console.log("Overview projectPath:", projectPath);

    const data = await overviewService.generateOverview(projectPath);

    res.json(data);
  } catch (err) {
    console.error("Overview error:", err);

    res.status(500).json({
      message: "Failed to generate overview",
    });
  }
};

/*export const getOverview = async (req, res) => {
  try {
    const { projectId } = req.body;
    const projectPath = await resolveProjectPath(projectId);

    const data = await overviewService.generateOverview(projectPath);

    res.json(data);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to generate overview",
    });
  }
};*/