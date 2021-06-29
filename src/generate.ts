import { Project, PropertySignature } from "ts-morph";
import { SchemaType, GenerateConfig, defaultTypeMapT } from './interface';
import { defaultTypeMap } from './default';

const project = new Project();

function generate(file: string, config?: GenerateConfig): Record<string, SchemaType[]> {
  project.addSourceFilesAtPaths(['**/*.ts', '**/*.tsx']);

  const sourceFile = project.getSourceFile(file);

  const interfaces = sourceFile?.getInterfaces() || [];

  const schemas = {};

  const defaultT =  config?.defaultTypeMap || defaultTypeMap;

  interfaces.forEach((node) => {
    const properties = node.getProperties();
    const jsDoc = node.getJsDocs()[0];
    const name = String(jsDoc?.getCommentText() || node.getName());

    const schema = getSchema(properties, defaultT);

    schemas[name] = schema;
  });

  return schemas;
}

function getSchema(properties: PropertySignature[], defaultTypeMap: defaultTypeMapT): SchemaType[] {
  return properties.map((p) => {
    const name = p.getName();
    const type = p.getTypeNode();
    const typeString = type?.print();
    const jsDoc = p.getJsDocs()[0];

    if (!jsDoc) {
      if (defaultTypeMap[name]) {
        return {
          name,
          ...defaultTypeMap[name],
        };
      }
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
