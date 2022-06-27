export function toSingleLine(str = ''): string {
  if (!str) {
    return '';
  }
  return str
    .trim()
    .replace(/[\r\n\t]+/g, '')
    .replace(/[\x20]{2,}/g, '')
    .replace(/\|/g, '\\|');
}

/**
 * Markdown will treat html tag like text as real tag when converted to html so we need to escape them
 * `<void >` => should be escaped
 * `< void >` => don't need to be escaped
 * `() => void` => don't need to be escaped
 */
export function escape(str: string): string {
  if (!str || !/<[a-zA-Z]+[^>]*>/.test(str)) {
    return str;
  }
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
