import path from "path";
import traverse from "@babel/traverse";

import getAllFiles from "../utils/getAllFiles.js";
import { getAst } from "../utils/getAst.js";

const supportedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
];

function resolveToRealFile(
  basePath,
  projectPath,
  allFiles
) {
  const candidates = [
    basePath,

    // Example:
    // ./utils/helper -> ./utils/helper.js
    ...supportedExtensions.map(
      (ext) => basePath + ext
    ),

    // Example:
    // ./utils -> ./utils/index.js
    ...supportedExtensions.map(
      (ext) =>
        path.join(basePath, `index${ext}`)
    ),
  ];

  for (const candidate of candidates) {
    const absoluteCandidate = path.resolve(
      projectPath,
      candidate
    );

    const match = allFiles.find(
      (file) =>
        path.resolve(file) ===
        absoluteCandidate
    );

    if (match) {
      return candidate.replace(
        /\\/g,
        "/"
      );
    }
  }

  return null;
}

function getShortLabel(filePath) {
  const normalized =
    filePath.replace(/\\/g, "/");

  const parts = normalized.split("/");

  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  }

  return parts[0];
}

export const generateDependencyGraph = (
  projectPath
) => {
  // Use the shared file walker
  const files = getAllFiles(projectPath);

  const edges = [];

  files.forEach((file) => {
    const relativeFile = path
      .relative(projectPath, file)
      .replace(/\\/g, "/");

    try {
      // Use the shared AST cache
      const ast = getAst(file);

      traverse.default(ast, {
        ImportDeclaration({ node }) {
          const target = node.source.value;

          // Ignore npm packages
          if (
            !target.startsWith("./") &&
            !target.startsWith("../")
          ) {
            return;
          }

          const resolvedPath = path
            .normalize(
              path.join(
                path.dirname(relativeFile),
                target
              )
            )
            .replace(/\\/g, "/");

          // Resolve to an actual file
          const realTarget =
            resolveToRealFile(
              resolvedPath,
              projectPath,
              files
            );

          // Don't create dangling edges
          if (!realTarget) {
            return;
          }

          edges.push({
            source: relativeFile,
            target: realTarget,
          });
        },

        CallExpression({ node }) {
          if (
            node.callee.name !== "require" ||
            node.arguments.length === 0 ||
            node.arguments[0].type !==
              "StringLiteral"
          ) {
            return;
          }

          const target =
            node.arguments[0].value;

          // Ignore npm packages
          if (
            !target.startsWith("./") &&
            !target.startsWith("../")
          ) {
            return;
          }

          const resolvedPath = path
            .normalize(
              path.join(
                path.dirname(relativeFile),
                target
              )
            )
            .replace(/\\/g, "/");

          // Resolve to an actual file
          const realTarget =
            resolveToRealFile(
              resolvedPath,
              projectPath,
              files
            );

          // Don't create dangling edges
          if (!realTarget) {
            return;
          }

          edges.push({
            source: relativeFile,
            target: realTarget,
          });
        },
      });
    } catch (err) {
      console.log(
        `Failed parsing ${relativeFile}`
      );
    }
  });

  // Remove duplicate edges
  const uniqueEdges = [
    ...new Map(
      edges.map((edge) => [
        `${edge.source}-${edge.target}`,
        edge,
      ])
    ).values(),
  ];

  console.log(
    "Raw edges:",
    edges.length
  );

  console.log(
    "Total edges:",
    uniqueEdges.length
  );

  // Create nodes from connected files
  const nodeSet = new Set();

  uniqueEdges.forEach((edge) => {
    nodeSet.add(edge.source);
    nodeSet.add(edge.target);
  });

  const nodes = Array.from(nodeSet).map(
    (node, index) => ({
      id: node,

      data: {
        // Short name shown in the UI
        label: getShortLabel(node),

        // Original relative path
        fullPath: node,
      },

      position: {
        x: (index % 5) * 250,
        y: Math.floor(index / 5) * 150,
      },
    })
  );

  const flowEdges = uniqueEdges.map(
    (edge, index) => ({
      id: `e${index}`,
      source: edge.source,
      target: edge.target,
    })
  );

  return {
    nodes,
    edges: flowEdges,
  };
};