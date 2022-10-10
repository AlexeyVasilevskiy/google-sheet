export function canDeleteNextY(
  firstCol: number,
  lastCol: number,
  enteredpagex: number,
  pageCols: number
) {
  const c1 = firstCol - 1 === (enteredpagex - 1) * pageCols - pageCols + 1;
  const c2 = lastCol - 1 === (enteredpagex - 1) * pageCols;
  return !!(c1 && c2);
}
export function canDeleteNextX(
  firstRow: number,
  lastRow: number,
  enteredpagey: number,
  pageRows: number
) {
  const c1 = firstRow - 1 === (enteredpagey - 1) * pageRows - pageRows + 1;
  const c2 = lastRow - 1 === (enteredpagey - 1) * pageRows;
  return !!(c1 && c2);
}

export function canDeletePrevY(
  firstCol: number,
  lastCol: number,
  enteredpagex: number,
  pageCols: number
) {
  const c1 = firstCol === enteredpagex * pageCols - pageCols + 1;
  const c2 = lastCol === enteredpagex * pageCols;
  return !!(c1 && c2);
}
export function canDeletePrevX(
  firstRow: number,
  lastRow: number,
  enteredpagey: number,
  pageRows: number
) {
  const c1 = firstRow === enteredpagey * pageRows - pageRows + 1;
  const c2 = lastRow === enteredpagey * pageRows;
  return !!(c1 && c2);
}
