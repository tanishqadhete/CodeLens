const generateDocumentation = require(
  "../services/generateDocumentation"
);

exports.generateDocs = async (req, res) => {
  try {
    const { projectPath } = req.body;

    const result =
      generateDocumentation(projectPath);

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};