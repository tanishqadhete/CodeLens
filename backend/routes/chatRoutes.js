const router =
  require("express").Router();

const {
  askQuestion,
} = require(
  "../controllers/chatController"
);

router.post("/ask", askQuestion);

module.exports = router;