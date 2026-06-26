const express = require("express");
const router = express.Router();
const {
  getApis,
} = require("../controllers/apiController");

router.post("/", getApis);

module.exports = router;