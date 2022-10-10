import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, switchMap, tap } from 'rxjs';
import calcpages, { calcFetchY } from '../helpers/calcpages';
import calculateSheetIndexes from '../helpers/calculateIndexes';
import {
  canDeleteNextX,
  canDeletePrevX,
  canDeleteNextY,
  canDeletePrevY,
} from '../helpers/canDeletePage';
import { fillArray } from '../helpers/fillArray';
import {
  getDirection,
  isXDirection,
  isYDirection,
} from '../helpers/getDirection';
import { getPage } from '../helpers/getPage';
import { Cell } from '../models/cell.model';
import { Direction } from '../models/direction.model';
import { SheetService } from '../services/sheet.service';

const scrollAmountPx = 50;
const initPages = ['1-1', '1-2', '2-1', '2-2'];

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.css'],
})
export class SheetComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  constructor(private sheet: SheetService) {}
  rowHeight = 28;
  colWidth = 120;
  showRows = 26;
  showCols = 15;
  rows: number[] = fillArray(this.showRows);
  cols: number[] = fillArray(this.showCols);
  calculatedRowIndexes: number[] = fillArray(this.showRows);
  calculatedColIndexes: number[] = fillArray(this.showCols);
  sheetData: any = {};

  rowCount = 10000;
  columnCount = 10000;

  fakeContainerWidth = this.colWidth * (this.columnCount + 1);
  fakeContainerHeight = this.rowHeight * (this.rowCount + 1) + 8;

  direction = Direction.RIGHT;

  enteredpagex = 1;
  pageCols = 14;
  startIndexX = 1;
  endIndexX = 14;
  lastX = 0;

  enteredpagey = 1;
  pageRows = 25;
  startIndexY = 1;
  endIndexY = 25;
  lastY = 0;

  isEdit = false;
  selectedEl: any = null;

  fetchSource = new BehaviorSubject(initPages);

  onTableWheel(e: WheelEvent) {
    const { deltaY, shiftKey } = e;
    const { nativeElement } = this.container;
    const scrollDirection = shiftKey ? 'scrollLeft' : 'scrollTop';
    if (deltaY > 0) {
      nativeElement[scrollDirection] += scrollAmountPx;
    } else {
      nativeElement[scrollDirection] -= scrollAmountPx;
    }
  }

  ngOnInit() {
    this.fetchSource
      .asObservable()
      .pipe(
        switchMap((pages: string[]) => this.sheet.getPage(pages)),
        tap((result) => {
          console.log('data arrived!');
          let isClear = true;
          Object.values(result).forEach((k: any) => {
            if (Object.keys(k).length) {
              isClear = false;
            }
          });
          if (isClear) {
            result = {};
          }
          this.sheetData = { ...this.sheetData, ...result };
        })
      )
      .subscribe();
  }

  handleYScroll(e: Event) {
    const {
      indexes: rowIdx,
      startIndex: firstRow,
      endIndex: lastRow,
    } = calculateSheetIndexes(
      e,
      this.rowCount,
      this.showRows,
      this.rowHeight,
      false
    );

    if (this.lastY === firstRow) {
      return;
    }

    this.lastY = firstRow;

    this.direction = getDirection(
      firstRow,
      lastRow,
      this.startIndexY,
      this.endIndexY
    );

    this.endIndexY = lastRow;
    this.startIndexY = firstRow;
    this.calculatedRowIndexes = rowIdx;

    if (!isYDirection(this.direction)) return;

    let enteredpagey = getPage(lastRow, this.pageRows);

    if (
      enteredpagey !== this.enteredpagey &&
      this.direction === Direction.BOTTOM
    ) {
      this.enteredpagey = enteredpagey;
      // console.log(
      //   'fetch next y',
      //   calcFetchY(this.enteredpagex + 1, this.enteredpagey + 1)
      // );
      this.fetchPage(calcFetchY(this.enteredpagex + 1, this.enteredpagey + 1));
    }

    if (this.direction == Direction.TOP && firstRow === 1) {
      // console.log('delete next', calcFetchY(this.enteredpagex + 1, 3));
      this.deletePages(calcFetchY(this.enteredpagex + 1, 3));
    }

    if (enteredpagey < 2) return;

    if (
      this.direction === Direction.TOP &&
      canDeleteNextX(firstRow, lastRow, enteredpagey, this.pageRows)
    ) {
      // console.log(
      //   'delete next',
      //   calcFetchY(this.enteredpagex + 1, enteredpagey + 1)
      // );
      this.deletePages(calcFetchY(this.enteredpagex + 1, enteredpagey + 1));
    } else if (canDeletePrevX(firstRow, lastRow, enteredpagey, this.pageRows)) {
      // console.log(
      //   'delete prev',
      //   calcFetchY(this.enteredpagex + 1, enteredpagey - 2)
      // );
      this.deletePages(calcFetchY(this.enteredpagex + 1, enteredpagey - 2));
    }

    if (
      firstRow === (this.enteredpagey - 1) * this.pageRows &&
      this.direction === Direction.TOP
    ) {
      // console.log(
      //   'fetch prev',
      //   calcFetchY(this.enteredpagex + 1, this.enteredpagey - 2)
      // );
      this.fetchPage(calcFetchY(this.enteredpagex + 1, this.enteredpagey + 1));
    }
  }

  handleXScroll(e: Event) {
    const {
      indexes: colIdx,
      startIndex: firstCol,
      endIndex: lastCol,
    } = calculateSheetIndexes(
      e,
      this.columnCount,
      this.showCols,
      this.colWidth,
      true
    );
    if (this.lastX === firstCol) {
      return;
    }

    this.lastX = firstCol;

    this.direction = getDirection(
      firstCol,
      lastCol,
      this.startIndexX,
      this.endIndexX,
      true
    );

    this.endIndexX = lastCol;
    this.startIndexX = firstCol;
    this.calculatedColIndexes = colIdx;

    if (!isXDirection(this.direction)) return;

    const enteredpagex = getPage(lastCol, this.pageCols);

    if (
      enteredpagex !== this.enteredpagex &&
      this.direction === Direction.RIGHT
    ) {
      this.enteredpagex = enteredpagex;
      // console.log(
      //   'fetch next x',
      //   calcpages(this.enteredpagey + 1, this.enteredpagex + 1)
      // );
      this.fetchPage(calcpages(this.enteredpagey + 1, this.enteredpagex + 1));
    }

    if (this.direction == Direction.LEFT && firstCol === 1) {
      // console.log('delete next x', calcpages(this.enteredpagey + 1, 3));
      this.deletePages(calcpages(this.enteredpagey + 1, 3));
    }

    if (enteredpagex < 2) return;

    if (
      this.direction === Direction.LEFT &&
      canDeleteNextY(firstCol, lastCol, enteredpagex, this.pageCols)
    ) {
      // console.log(
      //   'delete next',
      //   calcpages(this.enteredpagey + 1, enteredpagex + 1)
      // );
      this.deletePages(calcpages(this.enteredpagey + 1, enteredpagex + 1));
    } else if (canDeletePrevY(firstCol, lastCol, enteredpagex, this.pageCols)) {
      // console.log(
      //   'delete prev',
      //   calcpages(this.enteredpagey + 1, enteredpagex - 2)
      // );
      this.deletePages(calcpages(this.enteredpagey + 1, enteredpagex - 2));
    }

    if (
      firstCol === (this.enteredpagex - 1) * this.pageCols &&
      this.direction === Direction.LEFT
    ) {
      // console.log(
      //   'fetch prev',
      //   calcpages(this.enteredpagey + 1, enteredpagex - 2)
      // );
      this.fetchPage(calcpages(this.enteredpagey + 1, enteredpagex - 2));
    }
  }

  onSheetContainerScroll(e: Event) {
    this.handleYScroll(e);
    this.handleXScroll(e);
  }

  @HostListener('dblclick', ['$event'])
  onDoubleClick(e: any) {
    if (!e.target.dataset.cell) return;
    this.selectedEl = e.target;
    this.isEdit = true;
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    if (!this.selectedEl || e.target === this.selectedEl) return;
    const location = this.selectedEl.dataset.location;
    const page = this.selectedEl.dataset.page;

    const cell: Cell = {
      key: location,
      value: this.selectedEl.value,
    };

    this.sheet.addCell(cell, page).subscribe();

    this.isEdit = false;
    this.selectedEl = null;

    if (!this.sheetData[page]) {
      this.sheetData[page] = {};
    }

    this.sheetData[page][cell.key] = cell.value;
  }

  getPage(col: number, row: number): string {
    return Math.ceil(col / 14) + '-' + Math.ceil(row / 25);
  }

  getCellValue(col: number, row: number) {
    const page = this.getPage(
      this.calculatedColIndexes[col],
      this.calculatedRowIndexes[row]
    );
    const cell = `${this.calculatedColIndexes[col]}-${this.calculatedRowIndexes[row]}`;
    const pageData = this.sheetData[page];
    if (pageData) {
      return pageData[cell] || '';
    }
    return '';
  }

  getCellLocation(col: number, row: number) {
    return `${this.calculatedColIndexes[col]}-${this.calculatedRowIndexes[row]}`;
  }

  fetchPage(pages: string[]) {
    this.fetchSource.next(pages);
  }

  deletePages(pages: string[]) {
    pages.forEach((p) => delete this.sheetData[p]);
  }

  getHeaderRow(row: number) {
    return this.calculatedRowIndexes[row];
  }

  getHeaderCol(col: number) {
    return this.calculatedColIndexes[col];
  }

  toPx(value: number): string {
    return `${value}px`;
  }
}
