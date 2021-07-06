import { Project, SourceFile, TypeChecker, Symbol } from "ts-morph";
import { SchemaType, GenerateConfig, defaultTypeMapT, TagType } from './interface';
import { defaultTypeMap } from './default';

type generateReturnType = Record<string, { data: SchemaType[], tags: TagType[] }>;

const project = new Project({
  compilerOptions: {
    jsx: 'react' as any,
  },
});

function getSchemaFromSymbol(sym: Symbol, defaultT: defaultTypeMapT) {
  const name = sym.getName();
  const declarations = sym.getDeclarations();
  const typeString = declarations[0].getType().getText();
  const jsDocTags = sym.getJsDocTags();

  if (!jsDocTags.length) {
    if (defaultT[name]) {
      return {
        name,
        ...defaultT[name],
      };
    }
  }

  const tags = jsDocTags.map((t) => {
    return {
      name: t.getName(),
      value: t.getText()[0].text,
    }
  });
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

    const schema = typeChecker.getPropertiesOfType(type).map((a) => getSchemaFromSymbol(a, defaultT));

    const tags = node.getJsDocs()[0]?.getTags() || [];

    let name = tags.find((tag) => tag.getTagName() === 'title')?.getComment() as string;

    if (!name) {
      return;
    }

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
