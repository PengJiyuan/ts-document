export function toSingleLine(str: string): string {
  return str.trim().replace(/[\r\n\t]+/g, '').replace(/[\x20]{2,}/g, '').replace(/\|/g, '\\|');
}
