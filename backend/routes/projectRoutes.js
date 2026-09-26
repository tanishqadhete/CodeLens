const express = require("express");

const router = express.Router();

const {
  deleteProject,
} = require("../controllers/projectController");

router.delete("/:projectId", deleteProject);

module.exports = router;