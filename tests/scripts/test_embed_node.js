const { DefaultEmbeddingFunction } = require("@chroma-core/default-embed");

async function test() {
  try {
    const rawEmbedder = new DefaultEmbeddingFunction();
    const result = await rawEmbedder.generate(["test"]);
    console.log("Success! Result length:", result[0].length);
    console.log("First 5 values:", result[0].slice(0, 5));
  } catch (error) {
    console.error("Failed!", error);
  }
}

test();
