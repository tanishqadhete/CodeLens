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

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "CodeLens backend is running",
  });
});

app.use("/api/upload", uploadRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/apis", apiRoutes);
app.use("/api/overview", overviewRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});