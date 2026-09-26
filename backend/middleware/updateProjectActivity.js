const Project = require("../models/Project");

const updateProjectActivity = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    if (projectId) {
      await Project.updateOne(
        { projectId },
        {
          $set: {
            lastActivityAt: new Date(),
          },
        }
      );
    }

    next();
  } catch (error) {
    console.error(
      "Failed to update project activity:",
      error
    );

    // Activity tracking should not break the actual request
    next();
  }
};

module.exports = updateProjectActivity;