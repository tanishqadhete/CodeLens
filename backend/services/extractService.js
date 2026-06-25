const unzipper = require("unzipper");
const fs = require("fs");

const extractZip = async (zipPath, extractPath) => {
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();
};

module.exports = extractZip;