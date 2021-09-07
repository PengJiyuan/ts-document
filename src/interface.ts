// K-V pair parsed from jsDoc
export type TagType = {
  name: string;
  value: string;
};

// Schema parsed from Symbol
export type PropertyType = {
  name: string;
  type: string;
  isOptional: boolean;
  tags: TagType[];
};

// Schema parsed from function declaration
export type FunctionSchema = {
  tags: TagType[];
  params: Array<PropertyType & { initializerText: string | null }>;
  returns: string;
};

// Schema parsed from interface declaration
export type InterfaceSchema = {
  tags: TagType[];
  data: PropertyType[];
};

// Collect of all schema type generated
export type Schema = FunctionSchema | InterfaceSchema;

// Table type in markdown generated
export type MarkdownTableType = 'interface' | 'parameter';

export type DefaultTypeMapT = Record<string, { type: string; tags: TagType[] }>;

export type GenerateConfig = {
  defaultTypeMap?: DefaultTypeMapT;
  sourceFilesPaths: string | string[];
  /**
   * Whether to skip parsing documentation comment as property description
   */
  strictComment?: boolean;
  /**
   * Generate schema in the order they appear in the document
   * When it's true, generate function will return Array<{ title: string; schema: Schema }>
   */
  strictDeclarationOrder?: boolean;
};

export type GenerateMarkdownConfig = GenerateConfig & {
  lang?: string;
};
