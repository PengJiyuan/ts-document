import generate from './generate';
import { defaultMarkdownSchema, defaultLang } from './default';
import { GenerateMarkdownConfig } from './interface';

function generateMarkdown(file: string, config?: GenerateMarkdownConfig): Record<string, string> | undefined {
  const markdownSchema = defaultMarkdownSchema[config?.lang || defaultLang];

  if (!markdownSchema) {
    return;
  }

  const length = markdownSchema.length;

  let markdownHeader: string = `|${markdownSchema.map((md) => md.title).join('|')}|`;

  markdownHeader += `\n|${markdownSchema.map((_) => '---').join('|')}|\n`;

  const schemas = generate(file, config);

  const markdownOutput: Record<string, string> = {};

  for (let name in schemas) {
    markdownOutput[name] = getOutputMarkdown(name);
  }

  function getOutputMarkdown(name: string) {
    const markdownContent = schemas[name].map((schema) => {
      return getSingleLineMarkdown(schema);
    }).join('\n');

    return `${markdownHeader}${markdownContent}`;
  }

  function getSingleLineMarkdown(schema) {
    const singleLineMarkdown =  markdownSchema.map((ms) => {
      let field = ms.value;
      const execResult = /tag\.(\w+)/.exec(field);
      // tags
      if (execResult) {
        field = execResult[1];
        const obj = schema.tags.find((tag) => tag.name === field);
        return obj ? obj.value : '-';
      }
      return schema[field];
    }).join('|');

    return `|${singleLineMarkdown}|`;
  }

  return markdownOutput;
}

export default generateMarkdown;
