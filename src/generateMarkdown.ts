import generate from './generate';
import { defaultMarkdownSchema, defaultLang } from './default';
import { GenerateMarkdownConfig } from './interface';

function toSingleLine(str: string): string {
  return str.replace(/[\r\n\t]+/g, '').replace(/[\x20]{2,}/g, '').replace(/\|/g, '\\|');
}

function generateMarkdown(file: string, config?: GenerateMarkdownConfig): Record<string, string> | undefined {
  const lang = config?.lang || defaultLang;
  const markdownSchema = defaultMarkdownSchema[lang];

  if (!markdownSchema) {
    return;
  }

  let markdownHeader: string = `|${markdownSchema.map((md) => md.title).join('|')}|`;

  markdownHeader += `\n|${markdownSchema.map((_) => '---').join('|')}|\n`;

  const schemas = generate(file, config);

  if (!schemas) {
    return;
  }

  const markdownOutput: Record<string, string> = {};

  for (let name in schemas) {
    markdownOutput[name] = getOutputMarkdown(name);
  }

  function getOutputMarkdown(name: string) {
    const markdownContent = schemas?.[name].data.map((schema) => {
      return getSingleLineMarkdown(schema);
    }).join('\n');

    const tags = schemas?.[name].tags;

    const langTag = tags?.find((tag) => tag.name === lang);

    let mh = markdownHeader;

    if (tags?.length && langTag) {
      mh = `${langTag.value}\n\n${mh}`;
    }

    mh = `### ${name}\n\n${mh}`;

    return `${mh}${markdownContent}`;
  }

  function getSingleLineMarkdown(schema) {
    const requiredTextWord = lang === 'zh' ? '必填' : 'Required';
    const requiredText = !schema.hasQuestionToken ? ` **(${requiredTextWord})**` : '';
    const singleLineMarkdown = markdownSchema.map((ms) => {
      let field = ms.value;
      const execResult = /tag\.(\w+)/.exec(field);
      // tags
      if (execResult) {
        field = execResult[1];
        const obj = schema.tags.find((tag) => tag.name === field);
        const value = obj ? toSingleLine(obj.value) : '-';

        return field === 'defaultValue' ? `\`${value}\`` : value;
      }

      const value = toSingleLine(schema[field]);

      return field === 'type' ? `\`${value}\`${requiredText}` : value;
    }).join('|');

    return `|${singleLineMarkdown}|`;
  }

  return markdownOutput;
}

export default generateMarkdown;
