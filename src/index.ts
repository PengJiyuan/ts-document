import { Project, PropertySignature } from "ts-morph";

type SchemaType = {
  name?: string;
  type?: string;
  description?: string;
} | undefined;

const project = new Project();

function generate(file: string): Record<string, SchemaType[]> {
  project.addSourceFilesAtPaths(['**/*.ts', '**/*.tsx']);

  const sourceFile = project.getSourceFile(file);

  const interfaces = sourceFile?.getInterfaces() || [];

  const schemas = {};

  interfaces.forEach((node) => {
    const properties = node.getProperties();
    const jsDoc = node.getJsDocs()[0];
    const name = String(jsDoc.getCommentText() || node.getName());

    const schema = getSchema(properties);

    schemas[name] = schema;
  });

  return schemas;
}

function getSchema(properties: PropertySignature[]): SchemaType[] {
  return properties.map((p) => {
    const name = p.getName();
    const type = p.getTypeNode();
    const typeString = type?.print();
    const jsDoc = p.getJsDocs()[0];

    if (!jsDoc) {
      return;
    }

    const tags = jsDoc.getTags();
    const processedTags = tags.map((tag) => {
      return {
        name: tag.getTagName(),
        value: tag.getCommentText(),
      };
    });

    return {
      name,
      type: typeString,
      description: jsDoc.getDescription(),
      tags: processedTags,
    }
  }).filter((a) => a);
}

export default generate;
