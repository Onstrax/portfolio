// The only source file where type assertions are allowed (TSC-R07): `Object.keys` and
// `Object.entries` are typed with `string` keys, and narrowing them back needs an assertion.

type KeyOf<T extends object> = keyof T & string;

/** `Object.keys` typed with the keys of the object. */
export function typedKeys<T extends object>(value: T): readonly KeyOf<T>[] {
  return Object.keys(value) as KeyOf<T>[];
}

/** `Object.entries` typed with the keys and values of the object. */
export function typedEntries<T extends object>(
  value: T,
): readonly (readonly [KeyOf<T>, T[KeyOf<T>]])[] {
  return Object.entries(value) as [KeyOf<T>, T[KeyOf<T>]][];
}
