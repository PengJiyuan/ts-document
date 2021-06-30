import { Project, PropertySignature } from "ts-morph";
import { SchemaType, GenerateConfig, defaultTypeMapT, TagType } from './interface';
import { defaultTypeMap, defaultSourceFilesPaths } from './default';

const project = new Project();

type generateReturnType = Record<string, { data: SchemaType[], tags: TagType[] }>;

function generate(file: string, config?: GenerateConfig): generateReturnType {
  project.addSourceFilesAtPaths(config?.sourceFilesPaths || defaultSourceFilesPaths);

  const sourceFile = project.getSourceFile(file);

  const interfaces = sourceFile?.getInterfaces() || [];

  const schemas = {};

  const defaultT =  config?.defaultTypeMap || defaultTypeMap;

  interfaces.forEach((node) => {
    const properties = node.getProperties() || [];

    if (!properties.length) {
      return;
    }

    const jsDoc = node.getJsDocs()[0];
    const tags = jsDoc?.getTags() || [];

    const name = tags.find((tag) => tag.getTagName() === 'title')?.getComment() as string;

    if (!name) {
      return;
    }

    const schema = getSchema(properties, defaultT);

    schemas[name] = {
      data: schema,
      tags: tags.map((tag) => {
        return {
          name: tag.getTagName(),
          value: tag.getCommentText(),
        };
      }),
    };
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
