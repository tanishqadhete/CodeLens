const path = require("path");
const fs = require("fs");

const upload = require("../services/uploadService");
const extractZip = require("../services/extractService");

exports.uploadZip = (req, res) => {
  upload.single("zipFile")(req, res, async (err) => {
    try {
      if (err) {
        return res.status(500).json({
          message: "Upload Failed",
          error: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const zipPath = req.file.path;

      const extractFolder = path.join(
        "extracted",
        Date.now().toString()
      );

      fs.mkdirSync(extractFolder, {
        recursive: true,
      });
      console.log("File received:", req.file?.originalname);
      await extractZip(zipPath, extractFolder);
      console.log("Extraction complete");
      const countFiles = (dir) => {
        let count = 0;

        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);

          if (fs.statSync(filePath).isDirectory()) {
            count += countFiles(filePath);
          } else {
            count++;
          }
        }

        return count;
      };
      const fileCount = countFiles(extractFolder);
      console.log("Files counted:", fileCount);
      res.json({
        success: true,
        message: "Upload Successful",
        filesExtracted: fileCount,
        extractedFolder: extractFolder,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Extraction failed",
        error: error.message,
      });
    }
  });
};