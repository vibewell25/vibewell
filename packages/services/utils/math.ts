export function sumInts(...values: Array<number | bigint>): bigint {
  return values.reduce<bigint>((acc, v) => acc + BigInt(v), BigInt(0));
