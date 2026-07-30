export const pickDefined = <T extends object, K extends keyof T>(
  source: Partial<T>,
  keys: readonly K[]
): Partial<Pick<T, K>> => {
  const result: Partial<Pick<T, K>> = {};

  for (const key of keys) {
    const value = source[key];

    if (value !== undefined) {
      Reflect.set(result, key, value);
    }
  }

  return result;
};