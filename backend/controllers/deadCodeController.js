const detectDeadCode = require(
  "../services/deadCodeService"
);

exports.getDeadCode = (req, res) => {
  try {
    const { projectPath } = req.body;

    const result =
      detectDeadCode(projectPath);

    res.json(result);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message:
        "Failed to detect dead code",
    });
  }
};