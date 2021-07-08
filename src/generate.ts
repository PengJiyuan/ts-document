import {
  Project, SourceFile, TypeChecker, Symbol, InterfaceDeclaration, TypeAliasDeclaration, Type,
} from 'ts-morph';
import {
  SchemaType, GenerateConfig, defaultTypeMapT, TagType,
} from './interface';
import { defaultTypeMap } from './default';
import { toSingleLine } from './util';

type generateReturnType = Record<string, { data: SchemaType[], tags: TagType[] }>;

type ExtractType = {
  name: string;
  type: string;
  isOptional: boolean;
};

const project = new Project({
  compilerOptions: {
    jsx: 'react' as any,
  },
});

const propertyRegex = /(\w+)\s{0,}([?]?)\s{0,}:(.*?);?$/s;

// extract pure type
function extractFromPropertyText(text: string): ExtractType | undefined {
  const regexResult = propertyRegex.exec(text);
  if (!regexResult) {
    return;
  }
  const name = regexResult[1];
  const isOptional = regexResult[2] === '?';
  const type = toSingleLine(regexResult[3]);

  return {
    name,
    isOptional,
    type,
  };
}

function getSchemaFromSymbol(sym: Symbol, defaultT: defaultTypeMapT): SchemaType {
  const name = sym.getName();
  const typeText = sym.getDeclarations()[0].getText();
  const jsDocTags = sym.compilerSymbol.getJsDocTags();
  const extract = extractFromPropertyText(typeText);

  if (!extract) {
    return;
  }

  if (!jsDocTags.length || !jsDocTags.find((t) => t.name === 'zh' || t.name === 'en')) {
    if (defaultT[name]) {
      return {
        name,
        isOptional: extract.isOptional,
        ...defaultT[name],
      };
    }
    return;
  }

  const tags = jsDocTags.map((tag) => ({ name: tag.name, value: tag.text?.[0].text }));

  return {
    name,
    type: extract.type,
    isOptional: extract.isOptional,
    tags,
  };
}

function generateSchema(sourceFile: SourceFile, typeChecker: TypeChecker, config?: GenerateConfig) {
  const interfaces = sourceFile?.getInterfaces() || [];
  const typeAliases = sourceFile.getTypeAliases() || [];
  const schemas = {};

  const defaultT = config?.defaultTypeMap || defaultTypeMap;

  interfaces.forEach((node) => {
    fillSchemaFromNode(node)
  });

  typeAliases.forEach((node) => {
    fillSchemaFromNode(node)
  });

  function fillSchemaFromNode(node: InterfaceDeclaration | TypeAliasDeclaration) {
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
  }

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
