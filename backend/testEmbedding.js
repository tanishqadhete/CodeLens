const createEmbedding = require("./services/embeddingService");

async function test() {
  const embedding = await createEmbedding(
    "This is a login function"
  );

  console.log(embedding.length);
}

test();