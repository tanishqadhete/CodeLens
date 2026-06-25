const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const indexRepository = require(
  "./services/indexRepositoryService"
);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB Connected");

  await indexRepository(
    "6860abcdef12345678901234",
    "./extracted/1782221122737"
  );

  console.log("Finished");

  process.exit(0);
}

run();