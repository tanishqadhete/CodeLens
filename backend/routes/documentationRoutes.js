const router = require("express").Router();
const {
  generateDocs
} = require("../controllers/documentationController");

router.post("/", generateDocs);

module.exports = router;