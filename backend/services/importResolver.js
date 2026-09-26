const fs = require("fs");
const path = require("path");
const { getAst } = require("../utils/getAst");
const getAllFiles = require("../utils/getAllFiles");

const supportedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
];

function resolveImportPath(
  currentFile,
  importPath
) {
  let resolved = path.normalize(
    path.join(
      path.dirname(currentFile),
      importPath
    )
  );

  if (
    fs.existsSync(resolved) &&
    fs.statSync(resolved).isFile()
  ) {
    return resolved.replace(/\\/g, "/");
  }

  for (const ext of supportedExtensions) {
    if (fs.existsSync(resolved + ext)) {
      return (resolved + ext).replace(
        /\\/g,
        "/"
      );
    }
  }

  for (const ext of supportedExtensions) {
    const indexPath = path.join(
      resolved,
      "index" + ext
    );

    if (fs.existsSync(indexPath)) {
      return indexPath.replace(
        /\\/g,
        "/"
      );
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

    try {
      // Reuse the shared AST cache
      const ast = getAst(file);

      const traverse =
        require("@babel/traverse").default;

      traverse(ast, {
        ImportDeclaration(pathNode) {
          const source =
            pathNode.node.source.value;

          // Ignore npm packages
          if (
            !source.startsWith("./") &&
            !source.startsWith("../")
          ) {
            return;
          }

          const absoluteTarget =
            resolveImportPath(
              file,
              source
            );

          if (!absoluteTarget) {
            return;
          }

          const targetFile = path
            .relative(
              projectPath,
              absoluteTarget
            )
            .replace(/\\/g, "/");

          pathNode.node.specifiers.forEach(
            (specifier) => {
              importMap[relativeFile][
                specifier.local.name
              ] = targetFile;
            }
          );
        },

        VariableDeclaration(pathNode) {
          pathNode.node.declarations.forEach(
            (decl) => {
              if (
                !decl.init ||
                decl.init.type !==
                  "CallExpression"
              ) {
                return;
              }

              if (
                decl.init.callee.name !==
                "require"
              ) {
                return;
              }

              if (
                decl.init.arguments.length ===
                  0 ||
                decl.init.arguments[0].type !==
                  "StringLiteral"
              ) {
                return;
              }

              const source =
                decl.init.arguments[0].value;

              // Ignore npm packages
              if (
                !source.startsWith("./") &&
                !source.startsWith("../")
              ) {
                return;
              }

              const absoluteTarget =
                resolveImportPath(
                  file,
                  source
                );

              if (!absoluteTarget) {
                return;
              }

              const targetFile = path
                .relative(
                  projectPath,
                  absoluteTarget
                )
                .replace(/\\/g, "/");

              // const helper = require("./helper")
              if (
                decl.id.type === "Identifier"
              ) {
                importMap[relativeFile][
                  decl.id.name
                ] = targetFile;
              }

              // const { helper } = require("./helper")
              if (
                decl.id.type ===
                "ObjectPattern"
              ) {
                decl.id.properties.forEach(
                  (prop) => {
                    if (
                      prop.key &&
                      prop.key.name
                    ) {
                      importMap[
                        relativeFile
                      ][prop.key.name] =
                        targetFile;
                    }
                  }
                );
              }
            }
          );
        },
      });
    } catch (err) {
      console.log(
        `Failed parsing ${relativeFile}`
      );
    }
  });

  return importMap;
}

module.exports = buildImportMap;