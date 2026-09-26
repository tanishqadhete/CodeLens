const router =
  require("express").Router();

const {
  askQuestion,
} = require(
  "../controllers/chatController"
);
const updateProjectActivity = require("../middleware/updateProjectActivity");

router.post( "/ask", updateProjectActivity, askQuestion );

module.exports = router;