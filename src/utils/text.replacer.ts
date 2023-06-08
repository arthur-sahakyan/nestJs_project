export function textReplacer(string: string, values: { [key: string]: any }): string {
  let changedValue = '';

  for (const value in values) {
    changedValue = '{' + value + '}';
    string = string.replace(changedValue, values[value]);
  }
  return string;
}
