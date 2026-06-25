const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
connectDB();
const graphRoutes = require("./routes/graphRoutes.js");
const app = express();

app.use(cors());
app.use(express.json());

const uploadRoutes = require("./routes/uploadRoutes");
const documentationRoutes = require("./routes/documentationRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/api/upload", uploadRoutes);
app.use("/api/graph", graphRoutes);
app.use(
  "/api/documentation",
  documentationRoutes
);
app.use(
  "/api/chat",
  chatRoutes
);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});