import {
  Project, SourceFile, TypeChecker, Symbol,
} from 'ts-morph';
import {
  SchemaType, GenerateConfig, defaultTypeMapT, TagType,
} from './interface';
import { defaultTypeMap } from './default';

type generateReturnType = Record<string, { data: SchemaType[], tags: TagType[] }>;

const project = new Project({
  compilerOptions: {
    jsx: 'react' as any,
  },
});

function getSchemaFromSymbol(sym: Symbol, defaultT: defaultTypeMapT): SchemaType {
  const name = sym.getName();
  const declarations = sym.getDeclarations();
  const typeString = declarations[0].getType().getText(sym.getDeclarations()[0]);
  const jsDocTags = sym.compilerSymbol.getJsDocTags();

  if (!jsDocTags.length || !jsDocTags.find((t) => t.name === 'zh' || t.name === 'en')) {
    if (defaultT[name]) {
      return {
        name,
        ...defaultT[name],
      };
    }
    return;
  }

  const tags = jsDocTags.map((tag) => ({ name: tag.name, value: tag.text?.[0].text }));

  return {
    name,
    type: typeString,
    tags,
  };
}

function generateSchema(sourceFile: SourceFile, typeChecker: TypeChecker, config?: GenerateConfig) {
  const interfaces = sourceFile?.getInterfaces() || [];
  const schemas = {};

  const defaultT = config?.defaultTypeMap || defaultTypeMap;

  interfaces.forEach((node) => {
    const type = node.getType();

    const schema = typeChecker.getPropertiesOfType(type).map((a) => getSchemaFromSymbol(a, defaultT)).filter((a) => a);

    const tags = node.getJsDocs()[0]?.getTags() || [];

    const name = tags.find((tag) => tag.getTagName() === 'title')?.getComment() as string;

    if (!name) {
      return;
    }

    schemas[name] = {
      data: schema,
      tags: tags.map((tag) => ({
        name: tag.getTagName(),
        value: tag.getCommentText(),
      })),
    };
  });

  return schemas;
}

function generate(file: string, config?: GenerateConfig): generateReturnType | undefined {
  if (config?.sourceFilesPaths) {
    project.addSourceFilesAtPaths(config?.sourceFilesPaths);
  }

  const typeChecker = project.getTypeChecker();

  const sourceFile = project.getSourceFile(file);

  if (!sourceFile) {
    return;
  }

  return generateSchema(sourceFile, typeChecker, config);
}

export default generate;
