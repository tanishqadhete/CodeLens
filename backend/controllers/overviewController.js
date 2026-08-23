const overviewService = require("../services/overviewService");

exports.getOverview = async (req, res) => {
  try {
    const { projectPath } = req.body;

    const data = await overviewService.generateOverview(projectPath);

    res.json(data);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to generate overview",
    });
  }
};