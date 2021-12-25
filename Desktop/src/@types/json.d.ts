interface JSON {
  parse<T = any>(data: string, reviver?: (this: T, key: string, value: any) => any): T;
}