import * as path from 'path';
import { generate, generateMarkdown } from '../src/index';

const pathFixtures = path.resolve(__dirname, 'fixtures');
const pathBasic = path.resolve(pathFixtures, 'basic.ts');
const pathExtends = path.resolve(pathFixtures, 'extends/interface.ts');
const pathDefaultMap = path.resolve(pathFixtures, 'defaultTypeMap.ts');
const pathFunction = path.resolve(pathFixtures, 'function.ts');
const pathPropertySorter = path.resolve(pathFixtures, 'propertySorter.ts');

describe('generate', () => {
  it('basic', () => {
    const schema = generate(pathBasic, {
      sourceFilesPaths: './**/*.ts',
    });
    expect(schema).toMatchSnapshot();
  });

  it('extends', () => {
    const schema = generate(pathExtends, {
      sourceFilesPaths: './**/*.ts',
    });
    expect(schema).toMatchSnapshot();
  });

  it('defaultTypeMap', () => {
    const schema = generate(pathDefaultMap, {
      sourceFilesPaths: './**/*.ts',
    });
    expect(schema).toMatchSnapshot();
  });

  it('function type', () => {
    const schema = generate(pathFunction, {
      sourceFilesPaths: './**/*.ts',
    });
    expect(schema).toMatchSnapshot();
  });

  it('sort property', () => {
    const schema = generate(pathPropertySorter, {
      sourceFilesPaths: './**/*.ts',
      propertySorter: ({ type: typeA }, { type: typeB }) => {
        const getLevel = (type) =>
          type === 'boolean'
            ? 0
            : type === 'number'
            ? 1
            : type === 'string'
            ? 2
            : /([^)]*)\s*=>/.test(type)
            ? 3
            : -1;
        return getLevel(typeA) - getLevel(typeB);
      },
    });
    expect(schema).toMatchSnapshot();
  });
});

describe('generateMarkdown', () => {
  it('basic', () => {
    const markdownZh = generateMarkdown(pathBasic, {
      sourceFilesPaths: './**/*.ts',
      lang: 'zh',
    });
    const markdownEn = generateMarkdown(pathBasic, {
      sourceFilesPaths: './**/*.ts',
      lang: 'en',
    });

    expect(markdownZh).toMatchSnapshot();
    expect(markdownEn).toMatchSnapshot();
  });

  it('extends', () => {
    const markdownZh = generateMarkdown(pathExtends, {
      sourceFilesPaths: './**/*.ts',
      lang: 'zh',
    });
    const markdownEn = generateMarkdown(pathExtends, {
      sourceFilesPaths: './**/*.ts',
      lang: 'en',
    });

    expect(markdownZh).toMatchSnapshot();
    expect(markdownEn).toMatchSnapshot();
  });

  it('function type', () => {
    const markdownZh = generateMarkdown(pathFunction, {
      sourceFilesPaths: './**/*.ts',
      lang: 'zh',
    });
    const markdownEn = generateMarkdown(pathFunction, {
      sourceFilesPaths: './**/*.ts',
      lang: 'en',
      strictDeclarationOrder: true,
    });

    expect(markdownZh).toMatchSnapshot();
    expect(markdownEn).toMatchSnapshot();
  });
});
