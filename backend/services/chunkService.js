const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function chunkCode(code, filePath) {
  const chunks = [];

  try {
    const ast = parse(code, {
      sourceType: "unambiguous",
      plugins: ["jsx", "typescript"],
    });

    traverse(ast, {
  FunctionDeclaration(path) {
    addChunk(path.node, "function", path.node.id?.name);
  },

  FunctionExpression(path) {
    addChunk(
      path.node,
      "function",
      path.parent?.id?.name || "anonymous"
    );
  },

  ArrowFunctionExpression(path) {
    addChunk(
      path.node,
      "function",
      path.parent?.id?.name || "anonymous"
    );
  },

  ClassDeclaration(path) {
    addChunk(path.node, "class", path.node.id?.name);
  },

  // NEW
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
  ExpressionStatement(path) { 
  const expression = path.node.expression; 
 
  if ( 
    expression.type === "AssignmentExpression" && 
    expression.right.type === "CallExpression" && 
    expression.right.callee.type === "MemberExpression" && 
    expression.right.callee.object.name === "mongoose" && 
    expression.right.callee.property.name === "model" 
  ) { 
    const modelCall = expression.right; 
 
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

    function addChunk(node, chunkType, symbolName) {
      if (!node.loc) return;

      chunks.push({
        chunk: code.slice(node.start, node.end),
        chunkType,
        symbolName: symbolName || "anonymous",
        startLine: node.loc.start.line,
        endLine: node.loc.end.line,
        filePath,
      });
    }

  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err.message);
  }

  return chunks;
}

module.exports = chunkCode;