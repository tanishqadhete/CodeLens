const extractApis = require(
  "../services/apiExtractor"
);

exports.getApis = (req, res) => {
  try {
    const { projectPath } = req.body;

    const apis = extractApis(projectPath);

    res.json(apis);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to extract APIs",
    });
  }
};