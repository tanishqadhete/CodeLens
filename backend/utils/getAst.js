const fs = require("fs");
const { parse } = require("@babel/parser");

// Cache parsed ASTs by file path
const astCache = new Map();

function getAst(filePath) {
  // Return cached AST if this file was already parsed
  if (astCache.has(filePath)) {
    return astCache.get(filePath);
  }

  const code = fs.readFileSync(filePath, "utf-8");

  const ast = parse(code, {
    sourceType: "unambiguous",
    plugins: ["jsx", "typescript"],
  });

  // Store AST for reuse by other services
  astCache.set(filePath, ast);

  return ast;
}

function clearAstCache() {
  astCache.clear();
}

module.exports = {
  getAst,
  clearAstCache,
};