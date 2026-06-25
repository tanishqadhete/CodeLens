const express = require("express");
const router = express.Router();
const { getDependencyGraph } = require("../controllers/graphController");

router.post("/", getDependencyGraph);

module.exports = router;