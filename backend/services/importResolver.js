const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const supportedExtensions = [".js", ".jsx", ".ts", ".tsx"];

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (supportedExtensions.includes(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
}

function resolveImportPath(currentFile, importPath) {
  let resolved = path.normalize(
    path.join(path.dirname(currentFile), importPath)
  );

  const extensions = [".js", ".jsx", ".ts", ".tsx"];

  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    return resolved.replace(/\\/g, "/");
  }

  for (const ext of extensions) {
    if (fs.existsSync(resolved + ext)) {
      return (resolved + ext).replace(/\\/g, "/");
    }
  }

  for (const ext of extensions) {
    const indexPath = path.join(resolved, "index" + ext);

    if (fs.existsSync(indexPath)) {
      return indexPath.replace(/\\/g, "/");
    }
  }

  return null;
}

function buildImportMap(projectPath) {
  const files = getAllFiles(projectPath);

  const importMap = {};

  files.forEach((file) => {

    const relativeFile = path
      .relative(projectPath, file)
      .replace(/\\/g, "/");

    importMap[relativeFile] = {};

    const code = fs.readFileSync(file, "utf8");

    try {

      const ast = parse(code, {
        sourceType: "unambiguous",
        plugins: ["jsx", "typescript"],
      });

      traverse(ast, {

        ImportDeclaration(pathNode) {

          const source = pathNode.node.source.value;

          if (
            !source.startsWith("./") &&
            !source.startsWith("../")
          ) {
            return;
          }

          const absoluteTarget = resolveImportPath(file, source);

          if (!absoluteTarget) return;

          const targetFile = path
            .relative(projectPath, absoluteTarget)
            .replace(/\\/g, "/");

          pathNode.node.specifiers.forEach((specifier) => {

            importMap[relativeFile][specifier.local.name] = targetFile;

          });

        },

        VariableDeclaration(pathNode) {

          pathNode.node.declarations.forEach((decl) => {

            if (
              !decl.init ||
              decl.init.type !== "CallExpression"
            ) {
              return;
            }

            if (
              decl.init.callee.name !== "require"
            ) {
              return;
            }

            if (
              decl.init.arguments.length === 0 ||
              decl.init.arguments[0].type !== "StringLiteral"
            ) {
              return;
            }

            const source = decl.init.arguments[0].value;

            if (
              !source.startsWith("./") &&
              !source.startsWith("../")
            ) {
              return;
            }

            const absoluteTarget = resolveImportPath(file, source);

            if (!absoluteTarget) return;

            const targetFile = path
              .relative(projectPath, absoluteTarget)
              .replace(/\\/g, "/");

            if (
              decl.id.type === "Identifier"
            ) {

              importMap[relativeFile][decl.id.name] = targetFile;

            }

            if (
              decl.id.type === "ObjectPattern"
            ) {

              decl.id.properties.forEach((prop) => {

                importMap[relativeFile][prop.key.name] =
                  targetFile;

              });

            }

          });

        },

      });

    } catch (err) {}

  });

  return importMap;
}

module.exports = buildImportMap;