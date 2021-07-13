# ts-document

Auto generate ts document schema by ts interface conform to the [TSDoc](https://tsdoc.org/).

## Highlight

- Controllable parameter extraction, only the specified interface is extracted.
- Automatically analyze extends relationships.
- Support extract English and Chinese in one ts file.
- Support generate markdown string directly.

## Usage

```bash
npm i ts-document -D
```

```js
const { generate, generateMarkdown } = require("ts-document");

generate("interface.ts", config);

generateMarkdown("interface.ts", config);
```

### interface.ts

ts-document will only extract interface and type with jsDoc tag `title`。

```ts
import { ReactNode } from "react";

/**
 * @title Alert
 *
 * @zh
 *
 * 向用户显示警告的信息时，通过警告提示，展现需要关注的信息。
 *
 * @en
 *
 * Display warning information to the user. the Alert is used to display the information that needs attention.
 */
export interface AlertProps {
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
  closable?: InnerProps;
}

interface InnerProps {
  /**
   * @zh 位置
   * @en position
   */
  position?: string;
  /**
   * @zh 尺寸
   * @en Size
   */
  size?: string;
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
  "Alert": {
    "data": [
      {
        "name": "action",
        "type": "ReactNode",
        "isOptional": true,
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
        "type": "InnerProps",
        "isOptional": true,
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
    "tags": [
      {
        "name": "title",
        "value": "Alert"
      },
      {
        "name": "zh",
        "value": "向用户显示警告的信息时，通过警告提示，展现需要关注的信息。"
      },
      {
        "name": "en",
        "value": "Display warning information to the user. the Alert is used to display the information that needs attention."
      }
    ]
  }
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
  "Alert": "### Alert\n\nDisplay warning information to the user. the Alert is used to display the information that needs attention.\n\n|Property|Description|Type|DefaultValue|Version|\n|---|---|---|---|---|\n|action|this is action|`ReactNode`|`-`|2.15.0|\n|closable|Whether Alert can be closed|`InnerProps`|`false`|-|"
}
```

## Config

### defaultTypeMap

`Record<string, { type: string, tags?: TagType[] }>`

If no comments are extracted, will extracted from the `defaultTypeMap` automatically.

### sourceFilesPaths

`string | string[]`

See [ts-morph](https://ts-morph.com/setup/adding-source-files)。

### lang

`string`

only work in `generateMarkdown`, specify output language.

## LICENSE

[MIT](./LICENSE) © [PengJiyuan](https://github.com/PengJiyuan)
