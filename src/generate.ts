import * as path from 'path';
import * as fs from 'fs';
import * as glob from "glob";
import { ts, Project, PropertySignatureStructure, OptionalKind, SourceFile, InterfaceDeclaration, TypeChecker, ExpressionWithTypeArguments } from "ts-morph";
import * as TJS from "typescript-json-schema";
import { SchemaType, GenerateConfig, defaultTypeMapT, TagType } from './interface';
import { defaultTypeMap } from './default';

type generateReturnType = Record<string, { data: SchemaType[], tags: TagType[] }>;

const project = new Project();

function getUserFiles(sourceFiles?: string | string[]): string[] {
  if (Array.isArray(sourceFiles)) {
    return sourceFiles.reduce((prev: string[], next) => prev.concat(glob.sync(next, { realpath: true })), []);
  } else if (typeof sourceFiles === 'string') {
    return glob.sync(sourceFiles, { realpath: true });
  }
  return [];
}

// function getInheritTypes(sourceFiles: SourceFile[]) {
//   sourceFiles.forEach((sf, index) => {
//     console.log(sf.getBaseTypes())
//   });
// }

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

function getSourceFileFromFileName(sourceFiles: SourceFile[], fileName: string): SourceFile | undefined {
  if (/\.ts[x]?$/.test(fileName)) {
    return sourceFiles.find((sf) => sf.getFilePath() === fileName);
  }
  const tsSuffixFileName = `${fileName}.ts`;
  const tsxSuffixFileName = `${fileName}.tsx`;
  const tsMatch = sourceFiles.find((sf) => sf.getFilePath() === tsSuffixFileName);
  if (tsMatch) {
    return tsMatch;
  }
  const tsxMatch = sourceFiles.find((sf) => sf.getFilePath() === tsxSuffixFileName);
  if (tsxMatch) {
    return tsxMatch;
  }
}

function generateExtendsSchema(sourceFile: SourceFile, project: Project, typeChecker: TypeChecker, config?: GenerateConfig) {
  const userFiles = getUserFiles(config?.sourceFilesPaths);

  const sourceFiles = project.getSourceFiles();

  const usedSourceFiles = sourceFiles.filter((sf) => userFiles.indexOf(sf.getFilePath()) > -1);

  const basePath = sourceFile?.getDirectoryPath();

  // const inheritTypes = getInheritTypes(usedSourceFiles);
  const importSpecifiers = sourceFile?.getImportDeclarations().map((decl) => {
    const importPath = decl.getModuleSpecifierValue();
    const isUserFile = /^[\.\/]+/.test(importPath);
    const isRelativeFile = /^[\.]+/.test(importPath);

    if (!isUserFile) {
      return;
    }

    return {
      modules: decl.getNamedImports().map((a) => {
        const propertyName = a.compilerNode.propertyName?.getText();
        const name = a.compilerNode.propertyName?.getText();
        return {
          propertyName: propertyName || name,
          name: name,
        }
      }),
      value: isRelativeFile ? path.resolve(basePath as string, importPath) : importPath
    }
  }).filter(a => a);

  importSpecifiers?.forEach((importSpecifier) => {
    const fileName = importSpecifier?.value!;
    const sourceFile = getSourceFileFromFileName(usedSourceFiles, fileName);
    if (sourceFile) {
      const extSchema = generateSchema(sourceFile, project, typeChecker, { sourceFilesPaths: config?.sourceFilesPaths!, privateUse: true });

    }
  });
}

function getPickAndOmit(extendType) {
  if (!extendType) {
    return {};
  }
  const map = {};

  function loop(extendType: ExpressionWithTypeArguments) {
    const expression = extendType.getExpression();
    // if (expression.getText() === 'Pick' || expression.getText() === 'Omit') {
    //   loop(expression);
    // }
    // console.log(extendType.getExpression().getText());
  }

  loop(extendType);
}

function generateSchema(sourceFile: SourceFile, project: Project, typeChecker: TypeChecker, config?: GenerateConfig & { privateUse?: boolean }) {
  const interfaces = sourceFile?.getInterfaces() || [];
  const schemas = {};

  const defaultT = config?.defaultTypeMap || defaultTypeMap;

  interfaces.forEach((node) => {
    // console.log(extendType?.getType().getSymbol()?.getEscapedName())
    // console.log(extendType?.getType().getProperties()[0]?.getExportSymbol().getEscapedName()); // animation
    const structure = node.getStructure();
    const properties = structure.properties;

    if (!properties?.length) {
      return;
    }

    const tags = node.getJsDocs()[0]?.getTags() || [];

    let name = tags.find((tag) => tag.getTagName() === 'title')?.getComment() as string;

    if (!name && !config?.privateUse) {
      return;
    }

    if (config?.privateUse) {
      name = node.getName();
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

  const extendsSchema = generateExtendsSchema(sourceFile, project, typeChecker, config);

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

  return generateSchema(sourceFile, project, typeChecker, config);
}

export default generate;
