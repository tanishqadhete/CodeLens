const express = require("express");
const router = express.Router();

const {
  getApis,
} = require("../controllers/apiController");
const updateProjectActivity = require("../middleware/updateProjectActivity");

router.post(
  "/",
  updateProjectActivity,
  getApis
);

module.exports = router;