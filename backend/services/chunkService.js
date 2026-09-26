const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const MAX_CHUNK_SIZE = 6000;

function chunkCode(code, filePath) {
  const chunks = [];

  try {
    const ast = parse(code, {
      sourceType: "unambiguous",
      plugins: ["jsx", "typescript"],
    });

    traverse(ast, {
      FunctionDeclaration(path) {
        addChunk(
          path.node,
          "function",
          path.node.id?.name
        );
      },

      FunctionExpression(path) {
        addChunk(
          path.node,
          "function",
          path.parent?.id?.name || "anonymous"
        );
      },

      ArrowFunctionExpression(path) {
        // Skip trivial one-line arrow functions
        if (isTrivialArrowFunction(path.node)) {
          return;
        }

        addChunk(
          path.node,
          "function",
          path.parent?.id?.name || "anonymous"
        );
      },

      ClassDeclaration(path) {
        addChunk(
          path.node,
          "class",
          path.node.id?.name
        );
      },

      // Class methods:
      // class User {
      //   getUser() { ... }
      // }
      ClassMethod(path) {
        addChunk(
          path.node,
          "method",
          path.node.key?.name || "anonymous"
        );
      },

      // TypeScript / Babel can represent private methods separately
      ClassPrivateMethod(path) {
        addChunk(
          path.node,
          "method",
          path.node.key?.id?.name || "private"
        );
      },

      // Class properties containing functions:
      // class User {
      //   getUser = () => { ... }
      // }
      ClassProperty(path) {
        const value = path.node.value;

        if (
          value &&
          (
            value.type === "ArrowFunctionExpression" ||
            value.type === "FunctionExpression"
          )
        ) {
          if (isTrivialArrowFunction(value)) {
            return;
          }

          addChunk(
            path.node,
            "method",
            path.node.key?.name || "anonymous"
          );
        }
      },

      // Mongoose model:
      // const User = mongoose.model(...)
      VariableDeclarator(path) {
        const node = path.node;

        if (
          node.init &&
          node.init.type === "CallExpression" &&
          node.init.callee.type === "MemberExpression" &&
          node.init.callee.object.name === "mongoose" &&
          node.init.callee.property.name === "model"
        ) {
          addChunk(
            node,
            "model",
            node.id?.name
          );
        }
      },

      // Mongoose model:
      // module.exports = mongoose.model(...)
      ExpressionStatement(path) {
        const expression =
          path.node.expression;

        if (
          expression.type ===
            "AssignmentExpression" &&
          expression.right.type ===
            "CallExpression" &&
          expression.right.callee.type ===
            "MemberExpression" &&
          expression.right.callee.object.name ===
            "mongoose" &&
          expression.right.callee.property.name ===
            "model"
        ) {
          const modelCall =
            expression.right;

          const modelName =
            modelCall.arguments[0]?.value;

          if (modelName) {
            addChunk(
              modelCall,
              "model",
              modelName
            );
          }
        }
      },
    });

    function addChunk(
      node,
      chunkType,
      symbolName
    ) {
      if (!node.loc) return;

      const text = code.slice(
        node.start,
        node.end
      );

      if (!text.trim()) return;

      // Normal-sized node
      if (text.length <= MAX_CHUNK_SIZE) {
        chunks.push({
          chunk: text,
          chunkType,
          symbolName:
            symbolName || "anonymous",
          startLine: node.loc.start.line,
          endLine: node.loc.end.line,
          filePath,
        });

        return;
      }

      // Large node:
      // split instead of silently allowing
      // the embedding layer to truncate it.
      const lines = text.split("\n");

      let currentChunk = "";
      let currentStartLine =
        node.loc.start.line;

      let currentEndLine =
        currentStartLine;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const nextChunk =
          currentChunk.length === 0
            ? line
            : `${currentChunk}\n${line}`;

        if (
          nextChunk.length > MAX_CHUNK_SIZE &&
          currentChunk.length > 0
        ) {
          chunks.push({
            chunk: currentChunk,
            chunkType,
            symbolName:
              symbolName || "anonymous",
            startLine: currentStartLine,
            endLine: currentEndLine,
            filePath,
          });

          currentChunk = line;
          currentStartLine =
            node.loc.start.line + i;
          currentEndLine =
            currentStartLine;
        } else {
          currentChunk = nextChunk;
          currentEndLine =
            node.loc.start.line + i;
        }
      }

      if (currentChunk.trim()) {
        chunks.push({
          chunk: currentChunk,
          chunkType,
          symbolName:
            symbolName || "anonymous",
          startLine: currentStartLine,
          endLine: currentEndLine,
          filePath,
        });
      }
    }
  } catch (err) {
    console.error(
      `Failed to parse ${filePath}:`,
      err.message
    );
  }

  return chunks;
}

function isTrivialArrowFunction(node) {
  if (
    node.type !== "ArrowFunctionExpression"
  ) {
    return false;
  }

  // Only consider short expression-bodied arrows
  // as candidates for skipping.
  if (
    node.body.type === "BlockStatement"
  ) {
    return (
      node.body.body.length === 0 &&
      node.end - node.start <= 100
    );
  }

  const body = node.body;

  // Examples:
  // x => x
  // x => 10
  // x => "hello"
  // x => true
  // x => null
  //
  // These generally don't provide useful
  // codebase-level retrieval context.
  const trivialExpressionTypes = new Set([
    "Identifier",
    "StringLiteral",
    "NumericLiteral",
    "BooleanLiteral",
    "NullLiteral",
  ]);

  return (
    trivialExpressionTypes.has(body.type) &&
    node.end - node.start <= 100
  );
}

module.exports = chunkCode;