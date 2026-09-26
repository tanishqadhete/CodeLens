const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");

const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_ENTRIES = 5000;

const extractZip = async (zipPath, extractPath) => {
  const resolvedExtractPath = path.resolve(extractPath);

  let totalSize = 0;
  let entryCount = 0;

  const directory = await unzipper.Open.file(zipPath);

  for (const entry of directory.files) {
    entryCount++;

    // Prevent zip bombs with too many files
    if (entryCount > MAX_ENTRIES) {
      throw new Error(
        "ZIP contains too many files"
      );
    }

    // Resolve the destination path
    const entryPath = path.resolve(
      resolvedExtractPath,
      entry.path
    );

    // Prevent zip-slip
    if (
      !entryPath.startsWith(
        resolvedExtractPath + path.sep
      ) &&
      entryPath !== resolvedExtractPath
    ) {
      throw new Error(
        "Invalid ZIP entry path"
      );
    }

    // Directory entry
    if (entry.type === "Directory") {
      await fs.promises.mkdir(entryPath, {
        recursive: true,
      });

      continue;
    }

    // Check decompressed size
    totalSize += entry.uncompressedSize || 0;

    if (totalSize > MAX_TOTAL_SIZE) {
      throw new Error(
        "ZIP decompressed size exceeds 200 MB"
      );
    }

    // Make sure parent directory exists
    await fs.promises.mkdir(
      path.dirname(entryPath),
      {
        recursive: true,
      }
    );

    // Extract file
    await new Promise((resolve, reject) => {
      entry
        .stream()
        .pipe(fs.createWriteStream(entryPath))
        .on("finish", resolve)
        .on("error", reject);
    });
  }
};

module.exports = extractZip;

