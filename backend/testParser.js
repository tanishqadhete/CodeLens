import { parseRepository } from "./parsers/repositoryParser.js";

const files = parseRepository(
  "./extracted/1782219267873"
);

console.log("Files Found:", files.length);

const stats = {};

for (const file of files) {
  stats[file.language] =
    (stats[file.language] || 0) + 1;
}

console.log(stats);

console.log("\nFiles:");
for (const file of files) {
  console.log(`${file.language} -> ${file.path}`);
}