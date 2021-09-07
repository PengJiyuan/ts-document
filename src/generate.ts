import {
  Project,
  SourceFile,
  TypeChecker,
  Symbol,
  FunctionDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
} from 'ts-morph';
import {
  PropertyType,
  GenerateConfig,
  DefaultTypeMapT,
  TagType,
  FunctionSchema,
  Schema,
} from './interface';
import { defaultTypeMap } from './default';
import { toSingleLine } from './util';

type DeclarationCanBeParsed = InterfaceDeclaration | TypeAliasDeclaration | FunctionDeclaration;

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

// Get key-value pairs from jsDoc of Declarations
function getDeclarationTags(declaration: DeclarationCanBeParsed) {
  const tags: Array<TagType> = [];
  const rawTags = declaration.getJsDocs()[0]?.getTags() || [];
  let title;

  for (const tag of rawTags) {
    const name = tag.getTagName();
    const value = tag.getCommentText() || '';

    if (name === 'title') {
      title = value;
    }

    tags.push({ name, value });
  }

  return {
    title,
    tags,
  };
}

// Get key-value pairs from jsDoc of Symbol
function getSymbolTags(sym: Symbol, strictComment = false): TagType[] {
  const jsDocTags = sym.compilerSymbol.getJsDocTags();
  const tags: TagType[] = jsDocTags.map((tag) => ({
    name: tag.name,
    value: tag.text?.[0].text || '',
  }));

  // Try to extend property description from common comment
  if (!strictComment) {
    const [commonComment] = sym.compilerSymbol.getDocumentationComment(undefined);
    if (commonComment && commonComment.kind === 'text' && commonComment.text) {
      TAG_NAMES_FOR_DESCRIPTION.forEach((tagNameForDescription) => {
        if (!tags.find(({ name }) => name === tagNameForDescription)) {
          tags.push({ name: tagNameForDescription, value: commonComment.text });
        }
      });
    }
  }

  return tags;
}

// Get Json schema of interface's property
function getPropertySchema(
  sym: Symbol,
  defaultT: DefaultTypeMapT,
  strictComment = false
): PropertyType | null {
  const name = sym.getName();
  const typeText = sym.getDeclarations()[0].getText();
  const extract = extractFromPropertyText(typeText);

  if (!extract) {
    return null;
  }

  const tags = getSymbolTags(sym, strictComment);
  if (tags.find(({ name }) => name && TAG_NAMES_FOR_DESCRIPTION.indexOf(name) > -1)) {
    return {
      name,
      type: extract.type,
      isOptional: extract.isOptional,
      tags,
    };
  }

  return defaultT[name]
    ? {
        name,
        isOptional: extract.isOptional,
        ...defaultT[name],
      }
    : null;
}

// Get Json schema of Function
function getFunctionSchema(
  declaration: FunctionDeclaration,
  strictComment = false
): Pick<FunctionSchema, 'params' | 'returns'> {
  return {
    params: declaration.getParameters().map((para) => {
      const tags = getSymbolTags(para.getSymbol() as Symbol, strictComment);
      return {
        tags,
        name: para.getName(),
        type: para.getType().getText(),
        isOptional: para.isOptional(),
        initializerText:
          para.getInitializer()?.getText() ||
          tags.find(({ name }) => name === 'default' || name === 'defaultValue')?.value ||
          null,
      };
    }),
    returns: declaration.getReturnType().getText(),
  };
}

function generateSchema(sourceFile: SourceFile, typeChecker: TypeChecker, config?: GenerateConfig) {
  const interfaces = sourceFile?.getInterfaces() || [];
  const typeAliases = sourceFile?.getTypeAliases() || [];
  const functions = sourceFile?.getFunctions() || [];
  const defaultT = config?.defaultTypeMap || defaultTypeMap;
  const strictComment = !!config?.strictComment;

  const schemaMap: Record<string, Schema> = {};
  const schemaList: Array<{ title: string; schema: Schema }> = [];

  [...interfaces, ...typeAliases, ...functions]
    .sort((declarationA, declarationB) => {
      return declarationA.getStartLineNumber() - declarationB.getStartLineNumber();
    })
    .forEach((declaration) => {
      const { title, tags } = getDeclarationTags(declaration);
      const dType = declaration.getKindName() as
        | 'InterfaceDeclaration'
        | 'FunctionDeclaration'
        | 'TypeAliasDeclaration';

      if (!title) {
        return;
      }

      let schema: Schema;
      const typeNode =
        dType === 'FunctionDeclaration'
          ? (declaration as FunctionDeclaration)
          : dType === 'TypeAliasDeclaration'
          ? (declaration as TypeAliasDeclaration).getTypeNode()
          : null;

      // Function declaration
      if (
        typeNode &&
        ['FunctionDeclaration', 'FunctionType'].indexOf(typeNode.getKindName()) > -1
      ) {
        schema = {
          tags,
          ...getFunctionSchema(typeNode as FunctionDeclaration),
        };
      }
      // Interface declaration forbid extends
      else if (
        dType === 'InterfaceDeclaration' &&
        !!tags.find(({ name }) => name === 'notExtends')
      ) {
        const data: PropertyType[] = [];
        (declaration as InterfaceDeclaration).getProperties().forEach((a) => {
          const schema = getPropertySchema(a.getSymbol() as Symbol, defaultT, strictComment);
          schema && data.push(schema);
        });
        schema = { tags, data };
      } else {
        const data: PropertyType[] = [];
        typeChecker.getPropertiesOfType(declaration.getType()).forEach((a) => {
          const schema = getPropertySchema(a, defaultT, strictComment);
          schema && data.push(schema);
        });
        schema = { tags, data };
      }

      schemaList.push({ title, schema });
      schemaMap[title] = schema;
    });

  return config?.strictDeclarationOrder ? schemaList : schemaMap;
}

function generate(
  file: string,
  config?: GenerateConfig
): Record<string, Schema> | Array<{ title: string; schema: Schema }> | undefined {
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
