const mongoose = require("mongoose");

const codeChunkSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    chunk: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CodeChunk", codeChunkSchema);