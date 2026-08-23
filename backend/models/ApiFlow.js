const mongoose = require("mongoose");

const apiFlowSchema = new mongoose.Schema(
  {
    repositoryPath: {
      type: String,
      required: true,
      index: true,
    },

    method: {
      type: String,
      required: true,
    },

    route: {
      type: String,
      required: true,
    },

    file: {
      type: String,
      required: true,
    },

    handlers: {
      type: [String],
      default: [],
    },

    flow: {
      type: Array,
      default: [],
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

module.exports = mongoose.model("ApiFlow", apiFlowSchema);