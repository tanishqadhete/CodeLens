const express = require("express");
const router = express.Router();

const {
  getDeadCode,
} = require(
  "../controllers/deadCodeController"
);

router.post("/", getDeadCode);

module.exports = router;