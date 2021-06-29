# ts-document

Auto generate ts document schema by ts interface.

## Usage

```bash
npm i ts-document -D
```

```js
const { generate, generateMarkdown } = require("ts-document");

generate(xxxx, config);

generateMarkdown(xxx, config);
```

### Demo ts

```ts
// interface.ts
/**
 * A
 */
export interface AProps {
  /**
   * @zh 自定义操作项
   * @en this is action
   * @version 2.15.0
   */
  action?: ReactNode;
  /**
   * @zh 是否可以关闭
   * @en Whether Alert can be closed
   * @defaultValue false
   */
  closable?: boolean;
}

export interface BProps {
  /**
   * @zh 方向
   * @en direction
   * @defaultValue 'horizontal'
   */
  direction?: "horizontal" | "vertical";
  /**
   * @zh 尺寸
   * @en Size
   * @defaultValue small
   */
  size?: "small" | "large";
}
```

## Generate jsDoc schema

```js
const { generate } = require("ts-document");

generate("interface.ts");
```

output

```json
{
  "A": [
    {
      "name": "action",
      "type": "ReactNode",
      "description": "",
      "tags": [
        {
          "name": "zh",
          "value": "自定义操作项"
        },
        {
          "name": "en",
          "value": "this is action"
        },
        {
          "name": "version",
          "value": "2.15.0"
        }
      ]
    },
    {
      "name": "closable",
      "type": "boolean",
      "description": "",
      "tags": [
        {
          "name": "zh",
          "value": "是否可以关闭"
        },
        {
          "name": "en",
          "value": "Whether Alert can be closed"
        },
        {
          "name": "defaultValue",
          "value": "false"
        }
      ]
    }
  ],
  "BProps": [
    {
      "name": "direction",
      "type": "\"horizontal\" | \"vertical\"",
      "description": "",
      "tags": [
        {
          "name": "zh",
          "value": "方向"
        },
        {
          "name": "en",
          "value": "direction"
        },
        {
          "name": "defaultValue",
          "value": "'horizontal'"
        }
      ]
    },
    {
      "name": "size",
      "type": "\"small\" | \"large\"",
      "description": "",
      "tags": [
        {
          "name": "zh",
          "value": "尺寸"
        },
        {
          "name": "en",
          "value": "Size"
        },
        {
          "name": "defaultValue",
          "value": "small"
        }
      ]
    }
  ]
}
```

## Generate markdown document

```js
const { generateMarkdown } = require("ts-document");

generateMarkdown("interface.ts");
```

output

```json
{
  "A": "|Property|Description|Type|DefaultValue|Version|\n|---|---|---|---|---|\n|action|this is action|ReactNode|-|2.15.0|\n|closable|Whether Alert can be closed|boolean|false|-|",
  "BProps": "|Property|Description|Type|DefaultValue|Version|\n|---|---|---|---|---|\n|direction|direction|\"horizontal\" | \"vertical\"|'horizontal'|-|\n|size|Size|\"small\" | \"large\"|small|-|"
}
```

## Config

## LICENSE

[MIT](./LICENSE) © [PengJiyuan](https://github.com/PengJiyuan)
