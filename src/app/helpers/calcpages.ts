export default function calcpages(a: number, b: number) {
  let xa = [];
  for (let i = a - 2 === 0 ? 1 : a - 2; i <= a; i++) {
    xa.push(`${b}-${i}`);
  }
  return xa;
}

export function calcY(a: number, b: number) {
  let arr: any[] = [];
  for (let i = a - 2 == 0 ? 1 : a - 2; i <= a; i++) {
    arr.push(`${i}-${b - 2}`);
  }
  return arr;
}
export function calcFetchY(a: number, b: number) {
  let arr: any[] = [];
  for (let i = a - 2 == 0 ? 1 : a - 2; i <= a; i++) {
    arr.push(`${i}-${b}`);
  }
  return arr;
}
