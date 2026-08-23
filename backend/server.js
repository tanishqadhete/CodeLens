require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");
const chatRoutes = require("./routes/chatRoutes");
const apiRoutes = require("./routes/apiRoutes");
const overviewRoutes = require("./routes/overviewRoutes");
const graphRoutes = require("./routes/graphRoutes.js");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/apis", apiRoutes);
app.use("/api/overview", overviewRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});