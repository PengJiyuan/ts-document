export type TagType = {
  name?: string;
  value?: string;
};

export type SchemaType = {
  name?: string;
  type?: string;
  isOptional?: boolean;
  tags?: TagType[];
} | undefined;

export type defaultTypeMapT = Record<string, { type: string, tags?: TagType[] }>;

export type GenerateConfig = {
  defaultTypeMap?: defaultTypeMapT;
  sourceFilesPaths: string | string[];
  /**
   * Whether to skip parsing documentation comment as property description
   */
  strictComment?: boolean;
}

export type GenerateMarkdownConfig = GenerateConfig & {
  lang?: string;
};
