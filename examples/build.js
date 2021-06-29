const path = require("path");
const docgen = require("../lib").default;

const schema = docgen(path.resolve(__dirname, "demo.tsx"));

console.log(schema);
