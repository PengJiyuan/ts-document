import * as path from 'path';
import * as fs from 'fs';
import { generate, generateMarkdown } from '../src/index';

const basicPath = path.resolve(__dirname, 'basic');
const extendsPath = path.resolve(__dirname, 'extends');
const defaultTypeMapPath = path.resolve(__dirname, 'defaultTypeMap');

const basicSchema = fs.readFileSync(path.resolve(basicPath, 'schema.json'), 'utf8');
const basicMarkdownZh = fs.readFileSync(path.resolve(basicPath, 'markdown_zh.json'), 'utf8');
const basicMarkdownEn = fs.readFileSync(path.resolve(basicPath, 'markdown_en.json'), 'utf8');

const extendsSchema = fs.readFileSync(path.resolve(extendsPath, 'schema.json'), 'utf8');
const extendsMarkdownZh = fs.readFileSync(path.resolve(extendsPath, 'markdown_zh.json'), 'utf8');
const extendsMarkdownEn = fs.readFileSync(path.resolve(extendsPath, 'markdown_en.json'), 'utf8');

const defaultTypeMapSchema = fs.readFileSync(path.resolve(defaultTypeMapPath, 'schema.json'), 'utf8');

describe('generate', () => {
  it('basic', () => {
    const schema = generate(path.resolve(basicPath, 'interface.ts'), { sourceFilesPaths: './**/*.ts' });
    expect(schema).toEqual(JSON.parse(basicSchema));
  });

  it('extends', () => {
    const schema = generate(path.resolve(extendsPath, 'interface.ts'), { sourceFilesPaths: './**/*.ts' });
    expect(schema).toEqual(JSON.parse(extendsSchema));
  });

  it('defaultTypeMap', () => {
    const schema = generate(path.resolve(defaultTypeMapPath, 'interface.ts'), { sourceFilesPaths: './**/*.ts' });
    expect(schema).toEqual(JSON.parse(defaultTypeMapSchema));
  });
});

describe('generateMarkdown', () => {
  it('basic', () => {
    const markdownZh = generateMarkdown(path.resolve(basicPath, 'interface.ts'), { sourceFilesPaths: './**/*.ts', lang: 'zh' });
    const markdownEn = generateMarkdown(path.resolve(basicPath, 'interface.ts'), { sourceFilesPaths: './**/*.ts', lang: 'en' });

    expect(markdownZh).toEqual(JSON.parse(basicMarkdownZh));
    expect(markdownEn).toEqual(JSON.parse(basicMarkdownEn));
  });

  it('extends', () => {
    const markdownZh = generateMarkdown(path.resolve(extendsPath, 'interface.ts'), { sourceFilesPaths: './**/*.ts', lang: 'zh' });
    const markdownEn = generateMarkdown(path.resolve(extendsPath, 'interface.ts'), { sourceFilesPaths: './**/*.ts', lang: 'en' });

    expect(markdownZh).toEqual(JSON.parse(extendsMarkdownZh));
    expect(markdownEn).toEqual(JSON.parse(extendsMarkdownEn));
  });
});
