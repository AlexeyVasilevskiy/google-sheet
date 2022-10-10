export function getPage(lastCell: number, totalCells: number): number {
  return Math.ceil(lastCell / totalCells);
}
