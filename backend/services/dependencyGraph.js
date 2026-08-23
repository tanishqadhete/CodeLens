import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const supportedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx"
];

function getShortLabel(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  }
  return parts[0];
}

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      const ext = path.extname(fullPath);
      if (supportedExtensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

export const generateDependencyGraph = (projectPath) => {
  const files = getAllFiles(projectPath);
  const edges = [];
  files.forEach((file) => {
    const code = fs.readFileSync(file, "utf-8"); //string
    const relativeFile = path
      .relative(projectPath, file)
      .replace(/\\/g, "/");
    try {
      const ast = parse(code, {
        sourceType: "unambiguous",
        plugins: ["jsx", "typescript"],
      });
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

          edges.push({
            source: relativeFile,
            target: resolvedPath,
          });
        },

        CallExpression({ node }) {
          if (
            node.callee.name === "require" &&
            node.arguments.length > 0 &&
            node.arguments[0].type === "StringLiteral"
          ) {
            const target = node.arguments[0].value;

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

            edges.push({
              source: relativeFile,
              target: resolvedPath,
            });
          }
        },
      });
    } catch (err) {
      console.log(`Failed parsing ${relativeFile}`);
    }
  });

  // Remove duplicates
  const uniqueEdges = [
    ...new Map(
      edges.map((edge) => [
        `${edge.source}-${edge.target}`,
        edge,
      ])
    ).values(),
  ];
  console.log("Raw edges:", edges.length);
  console.log("Total edges:", uniqueEdges.length);
  const nodeSet = new Set();

  uniqueEdges.forEach((edge) => {
    nodeSet.add(edge.source);
    nodeSet.add(edge.target);
  });

  const nodes = Array.from(nodeSet).map((node, index) => ({
  id: node, // Keep full path for graph connections
  data: {
    label: getShortLabel(node), // Display name
    fullPath: node,             // Store original path
  },
  position: {
    x: (index % 5) * 250,
    y: Math.floor(index / 5) * 150,
  },
}));

  const flowEdges = uniqueEdges.map((edge, index) => ({
    id: `e${index}`,
    source: edge.source,
    target: edge.target,
  }));

  return {
    nodes,
    edges: flowEdges,
  };
};