import { SheetPaginationData } from '../models/sheet-pagination-data';

export default function calculateSheetIndexes(
  e: any,
  colRowCount: number,
  showRowsCols: number,
  size: number,
  horizontal: boolean
): SheetPaginationData {
  const countWithPlaceholder = colRowCount + 1;
  const percent =
    (e.target[horizontal ? 'scrollLeft' : 'scrollTop'] /
      (countWithPlaceholder * size)) *
    100;

  const firstIndex = Math.floor((countWithPlaceholder / 100) * percent);
  const lastIndex = firstIndex + showRowsCols;

  const start =
    firstIndex < countWithPlaceholder - showRowsCols
      ? firstIndex
      : countWithPlaceholder - showRowsCols;
  const end =
    lastIndex < countWithPlaceholder ? lastIndex : countWithPlaceholder;

  const calculatedIndexes: number[] = [];

  for (let i = start; i < end; i++) {
    calculatedIndexes.push(i);
  }

  return {
    indexes: calculatedIndexes,
    startIndex: calculatedIndexes[1],
    endIndex: calculatedIndexes[calculatedIndexes.length - 1],
  };
}
