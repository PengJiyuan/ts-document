import { Project, PropertySignatureStructure, OptionalKind } from "ts-morph";
import { SchemaType, GenerateConfig, defaultTypeMapT, TagType } from './interface';
import { defaultTypeMap } from './default';

type generateReturnType = Record<string, { data: SchemaType[], tags: TagType[] }>;

function generate(file: string, config?: GenerateConfig): generateReturnType {
  const project = new Project({
    tsConfigFilePath: config?.tsConfigFilePath,
  });

  if (config?.sourceFilesPaths) {
    project.addSourceFilesAtPaths(config?.sourceFilesPaths);
  }

  const sourceFile = project.getSourceFile(file);

  const interfaces = sourceFile?.getInterfaces() || [];

  const schemas = {};

  const defaultT =  config?.defaultTypeMap || defaultTypeMap;

  interfaces.forEach((node) => {
    const structure = node.getStructure();
    const properties = structure.properties;

    if (!properties?.length) {
      return;
    }

    const tags = node.getJsDocs()[0]?.getTags() || [];

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

function getSchema(properties: OptionalKind<PropertySignatureStructure>[], defaultTypeMap: defaultTypeMapT): SchemaType[] {
  return properties.map((p) => {
    const jsDoc = p.docs?.[0];
    if (!jsDoc) {
      if (defaultTypeMap[p.name]) {
        return {
          name: p.name,
          hasQuestionToken: p.hasQuestionToken,
          ...defaultTypeMap[p.name],
        };
      }
      return;
    }

    const tags = (jsDoc as any).tags;
    const processedTags = tags.map((tag) => {
      return {
        name: tag.tagName,
        value: tag.text,
      };
    });

    return {
      name: p.name,
      type: p.type as string,
      hasQuestionToken: p.hasQuestionToken,
      tags: processedTags,
    }
  }).filter((a) => a);
}

export default generate;
