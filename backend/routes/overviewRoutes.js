const express = require("express");
const router = express.Router();

const overviewController = require("../controllers/overviewController");

router.post("/", overviewController.getOverview);

module.exports = router;