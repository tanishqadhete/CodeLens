const mongoose = require("mongoose");

const codeChunkSchema = new mongoose.Schema(
  {
    repositoryPath: {
      type: String,
      required: true,
      index: true,
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

    // AST metadata
    chunkType: {
      type: String,
      required: true,
    },

    symbolName: {
      type: String,
      default: "",
    },

    startLine: {
      type: Number,
    },

    endLine: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CodeChunk", codeChunkSchema);