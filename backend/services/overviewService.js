const fs = require("fs");
const path = require("path");
const extractApis = require("./apiExtractor");

const ignoredFolders = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
];

async function generateOverview(projectPath) {
  if (!projectPath) {
    throw new Error("projectPath is missing");
  }

  const absolutePath = path.resolve(projectPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Repository path does not exist: ${absolutePath}`
    );
  }

  console.log("Original path:", absolutePath);

  let analysisPath = absolutePath;

  let rootFolders = getFolderStructure(absolutePath);

  if (rootFolders.length === 1) {
    const possibleProject = path.join(
      absolutePath,
      rootFolders[0]
    );

    if (fs.existsSync(possibleProject)) {
      const innerFolders = getFolderStructure(possibleProject);

      if (
        innerFolders.length === 1 &&
        !fs.existsSync(
          path.join(possibleProject, "package.json")
        )
      ) {
        analysisPath = path.join(
          possibleProject,
          innerFolders[0]
        );
      } else {
        analysisPath = possibleProject;
      }
    }
  }

  console.log(
    "Final analysis path:",
    analysisPath
  );

  const projectName =
    getProjectName(analysisPath);

  const folderStructure =
    getFolderStructure(analysisPath);

  const fileCount =
    countFiles(analysisPath);

  const techStack =
    getTechStack(analysisPath);

  const stats =
    getRepositoryStats(analysisPath);

  console.log("Extracting APIs...");

  const apis =
    extractApis(analysisPath);

  console.log(
    "APIs extracted:",
    apis.length
  );

  stats.apis = apis.length;

  const summary =
    "Repository structure analyzed using static code analysis.";

  return {
    projectName,
    summary,
    techStack,
    folderStructure,
    stats: {
      files: fileCount,
      ...stats
    }
  };
}


/* ========================================
   PROJECT NAME
======================================== */

function getProjectName(projectPath) {
  const name = path.basename(projectPath);

  if (/^\d+$/.test(name)) {
    return "Unknown Project";
  }

  return name;
}


/* ========================================
   FILE COUNT
======================================== */

function countFiles(dir) {
  let count = 0;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      if (ignoredFolders.includes(file)) {
        continue;
      }

      count += countFiles(filePath);
    } else {
      count++;
    }
  }

  return count;
}


/* ========================================
   FOLDER STRUCTURE
======================================== */

function getFolderStructure(projectPath) {
  return fs.readdirSync(projectPath)
    .filter(item => {
      const fullPath =
        path.join(projectPath, item);

      return (
        fs.statSync(fullPath).isDirectory() &&
        !ignoredFolders.includes(item)
      );
    });
}


/* ========================================
   REPOSITORY STATISTICS
======================================== */

function getRepositoryStats(projectPath) {
  return {
    models:
      countDirectoryFiles(
        projectPath,
        "models"
      ),

    controllers:
      countDirectoryFiles(
        projectPath,
        "controllers"
      ),

    routes:
      countDirectoryFiles(
        projectPath,
        "routes"
      ),

    middleware:
      countMiddlewares(projectPath),

    apis: 0
  };
}


/* ========================================
   DIRECTORY FILE COUNT
======================================== */

function countDirectoryFiles(
  projectPath,
  folderName
) {
  const folderPath =
    findFolder(
      projectPath,
      folderName
    );

  if (!folderPath) {
    return 0;
  }

  return countFiles(folderPath);
}


/* ========================================
   MIDDLEWARE DETECTION
======================================== */

function countMiddlewares(projectPath) {

  const middlewareFiles = new Set();

  /*
   * Count source files inside folders named:
   *
   * middleware/
   * middlewares/
   *
   * We intentionally do NOT count files containing
   * app.use() or router.use() because those files may
   * only be USING middleware rather than defining it.
   */
  findAllMiddlewareFolders(
    projectPath,
    middlewareFiles
  );

  return middlewareFiles.size;
}


/* ========================================
   FIND MIDDLEWARE FOLDERS
======================================== */

function findAllMiddlewareFolders(
  root,
  middlewareFiles
) {
  const files = fs.readdirSync(root);

  for (const file of files) {

    const current =
      path.join(root, file);

    const stat =
      fs.statSync(current);

    if (!stat.isDirectory()) {
      continue;
    }

    if (ignoredFolders.includes(file)) {
      continue;
    }

    const folderName =
      file.toLowerCase();

    /*
     * Support both:
     *
     * middleware
     * middlewares
     */
    if (
      folderName === "middleware" ||
      folderName === "middlewares"
    ) {

      collectFiles(
        current,
        middlewareFiles
      );

      continue;
    }

    findAllMiddlewareFolders(
      current,
      middlewareFiles
    );
  }
}


/* ========================================
   COLLECT FILES
======================================== */

function collectFiles(
  directory,
  result
) {
  const files =
    fs.readdirSync(directory);

  for (const file of files) {

    const current =
      path.join(directory, file);

    const stat =
      fs.statSync(current);

    if (stat.isDirectory()) {

      if (
        ignoredFolders.includes(file)
      ) {
        continue;
      }

      collectFiles(
        current,
        result
      );

    } else {

      /*
       * Only count source files.
       */
      if (
        /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(file)
      ) {
        result.add(current);
      }
    }
  }
}


/* ========================================
   SCAN FOR EXPRESS MIDDLEWARE
======================================== */


/* ========================================
   SOURCE FILES
======================================== */

function getSourceFiles(root) {
  const result = [];

  function walk(directory) {

    const files =
      fs.readdirSync(directory);

    for (const file of files) {

      const current =
        path.join(directory, file);

      const stat =
        fs.statSync(current);

      if (stat.isDirectory()) {

        if (
          ignoredFolders.includes(file)
        ) {
          continue;
        }

        walk(current);

      } else {

        if (
          /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(file)
        ) {
          result.push(current);
        }
      }
    }
  }

  walk(root);

  return result;
}


/* ========================================
   FIND FOLDER
======================================== */

function findFolder(
  root,
  targetFolder
) {
  const files =
    fs.readdirSync(root);

  for (const file of files) {

    const current =
      path.join(root, file);

    if (
      !fs.statSync(current).isDirectory()
    ) {
      continue;
    }

    if (
      ignoredFolders.includes(file)
    ) {
      continue;
    }

    if (
      file.toLowerCase() ===
      targetFolder.toLowerCase()
    ) {
      return current;
    }

    const found =
      findFolder(
        current,
        targetFolder
      );

    if (found) {
      return found;
    }
  }

  return null;
}


/* ========================================
   PACKAGE.JSON
======================================== */

function findAllPackageJson(
  root,
  packages = []
) {
  const files =
    fs.readdirSync(root);

  for (const file of files) {

    const current =
      path.join(root, file);

    if (
      fs.statSync(current).isDirectory()
    ) {

      if (
        ignoredFolders.includes(file)
      ) {
        continue;
      }

      findAllPackageJson(
        current,
        packages
      );

    } else if (
      file === "package.json"
    ) {

      packages.push(current);
    }
  }

  return packages;
}


/* ========================================
   TECH STACK
======================================== */

function getTechStack(projectPath) {

  const packageFiles =
    findAllPackageJson(projectPath);

  if (!packageFiles.length) {
    return [];
  }

  const techMap = {

    react: "React",
    express: "Express",
    mongoose: "Mongoose",
    mongodb: "MongoDB",
    mysql: "MySQL",
    postgres: "PostgreSQL",
    prisma: "Prisma",
    sequelize: "Sequelize",
    jsonwebtoken: "JWT",
    bcrypt: "Bcrypt",
    socketio: "Socket.IO",
    socket: "Socket.IO",
    tailwindcss: "Tailwind CSS",
    vite: "Vite",
    next: "Next.js",
    typescript: "TypeScript",
    firebase: "Firebase",
    cloudinary: "Cloudinary",
    multer: "Multer"
  };

  const stack =
    new Set();

  packageFiles.forEach(file => {

    const packageJson =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8"
        )
      );

    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };

    Object.keys(dependencies)
      .forEach(dep => {

        const lower =
          dep.toLowerCase();

        Object.keys(techMap)
          .forEach(key => {

            if (
              lower.includes(key)
            ) {
              stack.add(
                techMap[key]
              );
            }
          });
      });
  });

  if (stack.has("Express")) {
    stack.add("Node.js");
  }

  if (stack.has("Mongoose")) {
    stack.add("MongoDB");
  }

  return [...stack];
}


module.exports = {
  generateOverview
};
