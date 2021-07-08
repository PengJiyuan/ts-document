import generate from './generate';
import { defaultMarkdownSchema, defaultLang } from './default';
import { GenerateMarkdownConfig } from './interface';
import { toSingleLine } from './util';

function generateMarkdown(file: string, config?: GenerateMarkdownConfig): Record<string, string> | undefined {
  const lang = config?.lang || defaultLang;
  const markdownSchema = defaultMarkdownSchema[lang];

  if (!markdownSchema) {
    return;
  }

  const schemas = generate(file, config);

  if (!schemas) {
    return;
  }

  const markdownOutput: Record<string, string> = {};

  for (const name in schemas) {
    markdownOutput[name] = getOutputMarkdown(name);
  }

  function getOutputMarkdown(name: string) {
    const hasVersion = !!schemas?.[name].data.find((schema) => schema?.tags?.find((t) => t.name === 'version'));
    const markSchema = hasVersion ? markdownSchema : markdownSchema.filter(m => m.value !== 'tag.version');
    const markdownContent = schemas?.[name].data.map((schema) => {
      return getSingleLineMarkdown(schema, markSchema);
    }).join('\n');

    let markdownHeader = `|${markSchema.map((md) => md.title).join('|')}|`;
    markdownHeader += `\n|${markSchema.map(() => '---').join('|')}|\n`;

    const tags = schemas?.[name].tags;

    const langTag = tags?.find((tag) => tag.name === lang);

    let mh = markdownHeader;

    if (tags?.length && langTag) {
      mh = `${langTag.value}\n\n${mh}`;
    }

    mh = `### ${name}\n\n${mh}`;

    return `${mh}${markdownContent}`;
  }

  function getSingleLineMarkdown(schema, markSchema) {
    const requiredTextWord = lang === 'zh' ? '必填' : 'Required';
    const requiredText = !schema.isOptional ? ` **(${requiredTextWord})**` : '';
    const singleLineMarkdown = markSchema.map((ms) => {
      let field = ms.value;
      const execResult = /tag\.(\w+)/.exec(field);
      // tags
      if (execResult) {
        field = execResult[1];
        const obj = schema.tags.find((tag) => tag.name === field);
        const value = obj ? toSingleLine(obj.value) : '-';

        return field === 'defaultValue' ? `\`${value}\`` : value;
      }

      const value = schema[field];

      return field === 'type' ? `\`${value}\`${requiredText}` : value;
    }).join('|');

    return `|${singleLineMarkdown}|`;
  }

  return markdownOutput;
}

export default generateMarkdown;
