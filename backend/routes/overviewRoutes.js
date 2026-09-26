const express = require("express");

const router = express.Router();

const overviewController = require("../controllers/overviewController");
const updateProjectActivity = require("../middleware/updateProjectActivity");

router.post(
  "/",
  updateProjectActivity,
  overviewController.getOverview
);

module.exports = router;