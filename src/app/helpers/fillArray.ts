export function fillArray(length: number) {
  return Array(length)
    .fill(length)
    .map((_, i) => i);
}
