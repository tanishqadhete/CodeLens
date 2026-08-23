const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const {
  getApis,
} = require("../controllers/apiController");

router.post("/", getApis);
router.post("/explain-node", apiController.explainNode);

module.exports = router;