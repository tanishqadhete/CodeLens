const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/uploadController");

router.post("/", uploadController.uploadZip);

module.exports = router;