const express = require("express");
const router = express.Router();
const { getDependencyGraph } = require("../controllers/graphController");
const updateProjectActivity = require("../middleware/updateProjectActivity");

router.post( "/", updateProjectActivity, getDependencyGraph );

module.exports = router;