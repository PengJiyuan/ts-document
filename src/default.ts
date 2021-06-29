export const defaultTypeMap = {
  className: {
    type: 'string | string[]',
    tags: [{
      name: 'zh',
      value: '节点类名',
    }, {
      name: 'en',
      value: 'Additional css class',
    }]
  },
  style: {
    type: 'CSSProperties',
    tags: [{
      name: 'zh',
      value: '节点样式',
    }, {
      name: 'en',
      value: 'Additional style',
    }]
  },
};

export const defaultMarkdownSchema = {
  zh: [{
    title: '参数名',
    value: 'name',
  }, {
    title: '描述',
    value: 'tag.zh'
  }, {
    title: '类型',
    value: 'type'
  }, {
    title: '默认值',
    value: 'tag.defaultValue'
  }, {
    title: '版本',
    value: 'tag.version'
  }],
  en: [{
    title: 'Property',
    value: 'name',
  }, {
    title: 'Description',
    value: 'tag.en'
  }, {
    title: 'Type',
    value: 'type'
  }, {
    title: 'DefaultValue',
    value: 'tag.defaultValue'
  }, {
    title: 'Version',
    value: 'tag.version'
  }],
};

export const defaultLang = 'en';
