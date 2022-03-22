import {
  Project, SourceFile, TypeChecker, Symbol, InterfaceDeclaration, TypeAliasDeclaration,
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

const TAG_NAMES_FOR_DESCRIPTION = ['zh', 'en'];

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

function getSchemaFromSymbol(sym: Symbol, defaultT: defaultTypeMapT, strictComment: boolean): SchemaType {
  const name = sym.getName();
  const typeText = sym.getDeclarations()[0].getText();
  const extract = extractFromPropertyText(typeText);

  if (!extract) {
    return;
  }

  const jsDocTags = sym.compilerSymbol.getJsDocTags();
  const tags: TagType[] = jsDocTags.map((tag) => ({ name: tag.name, value: tag.text?.[0].text }));

  // Try to extend property description from common comment
  if (!strictComment) {
    const [ commonComment ] = sym.compilerSymbol.getDocumentationComment(undefined);
    if (commonComment && commonComment.kind === 'text' && commonComment.text) {
      TAG_NAMES_FOR_DESCRIPTION.forEach((tagNameForDescription) => {
        if (!tags.find(({ name }) => name === tagNameForDescription)) {
          tags.push({ name: tagNameForDescription, value: commonComment.text })
        }
      });
    }
  }

  if (tags.find(({ name }) => name && TAG_NAMES_FOR_DESCRIPTION.indexOf(name) > -1)) {
    return {
      name,
      type: extract.type,
      isOptional: extract.isOptional,
      tags,
    };
  }

  return defaultT[name] ? {
    name,
    isOptional: extract.isOptional,
    ...defaultT[name],
  } : undefined;
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
    const tags = node.getJsDocs()[0]?.getTags() || [];
    const name = tags.find((tag) => tag.getTagName() === 'title')?.getComment() as string;
    const notExtends = !!tags.find((tag) => tag.getTagName() === 'notExtends');
    const strictComment = !!config?.strictComment;

    const type = node.getType();

    let schema: SchemaType[];

    // only interface support notExtends
    if (notExtends && (node as InterfaceDeclaration).getProperties) {
      schema = (node as InterfaceDeclaration).getProperties().map(
        (a) => getSchemaFromSymbol(a.getSymbol() as Symbol, defaultT, strictComment)
      ).filter((a) => a);
    } else {
      schema = typeChecker.getPropertiesOfType(type).map(
        (a) => getSchemaFromSymbol(a, defaultT, strictComment)
      ).filter((a) => a);
    }

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
