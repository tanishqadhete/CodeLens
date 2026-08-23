const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/uploadController");

router.post("/", uploadController.uploadZip);
router.post("/github", uploadController.uploadGithubRepo);
module.exports = router;