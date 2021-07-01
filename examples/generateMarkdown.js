const path = require("path");
const { generateMarkdown } = require("../lib");

const md = generateMarkdown(path.resolve(__dirname, "demo.tsx"), {
  sourceFilesPaths: ["**/*.ts", "**/*.tsx"],
});

console.log(JSON.stringify(md, null, 2));
