import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, mergeMap, tap } from 'rxjs';
import calcpages, { calcFetchY } from '../helpers/calcpages';
import calculateSheetIndexes from '../helpers/calculateIndexes';
import { fillArray } from '../helpers/fillArray';
import { Cell } from '../models/cell.model';
import { Direction } from '../models/direction.model';
import { SheetService } from '../services/sheet.service';

const scrollAmountPx = 50;

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.css'],
})
export class SheetComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  constructor(private sheet: SheetService) {}
  rows: number[] = [];
  cols: number[] = [];
  calculatedRowIndexes: number[] = [];
  calculatedColIndexes: number[] = [];
  sheetData: any = {};

  rowHeight = 28;
  colWidth = 120;
  showRows = 26;
  showCols = 15;

  rowCount = 10000;
  columnCount = 10000;

  fakeContainerWidth = this.colWidth * (this.columnCount + 1);
  fakeContainerHeight = this.rowHeight * (this.rowCount + 1) + 8;

  initSheet() {
    this.calculatedRowIndexes = fillArray(26);
    this.rows = fillArray(26);
    this.calculatedColIndexes = fillArray(15);
    this.cols = fillArray(15);
  }

  onTableWheel(e: WheelEvent) {
    const { deltaY, shiftKey } = e;
    const { nativeElement } = this.container;
    if (deltaY > 0) {
      nativeElement[shiftKey ? 'scrollLeft' : 'scrollTop'] += scrollAmountPx;
    } else {
      nativeElement[shiftKey ? 'scrollLeft' : 'scrollTop'] -= scrollAmountPx;
    }
  }

  fetchSource = new BehaviorSubject(['1-1', '1-2', '2-1', '2-2']);

  ngOnInit() {
    this.initSheet();
    this.fetchSource
      .asObservable()
      .pipe(
        // throttleTime(100),
        mergeMap((pages: string[]) => this.sheet.getPage(pages)),
        tap((result) => {
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
          // console.log('pages arrived!', this.sheetData);
        })
      )
      .subscribe();
  }

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

    if (lastRow > this.endIndexY) {
      this.direction = Direction.BOTTOM;
    } else if (firstRow < this.startIndexY) {
      this.direction = Direction.TOP;
    }

    this.endIndexY = lastRow;
    this.startIndexY = firstRow;
    this.calculatedRowIndexes = rowIdx;

    if (
      this.direction === Direction.BOTTOM ||
      this.direction === Direction.TOP
    ) {
      let enteredpagey = Math.ceil(lastRow / this.pageRows);
      if (enteredpagey !== this.enteredpagey) {
        this.enteredpagey = enteredpagey;
        if (this.direction === Direction.BOTTOM) {
          console.log(
            'fetch next y',
            calcFetchY(this.enteredpagex + 1, this.enteredpagey + 1)
          );
          this.fetchPage(
            calcFetchY(this.enteredpagex + 1, this.enteredpagey + 1)
          );
        }
      }
      if (enteredpagey > 2) {
        if (this.direction === Direction.TOP) {
          const c1 =
            firstRow - 1 ===
            (enteredpagey - 1) * this.pageRows - this.pageRows + 1;
          const c2 = lastRow - 1 === (enteredpagey - 1) * this.pageRows;
          if (c1 && c2) {
            console.log(
              'delete next',
              calcFetchY(this.enteredpagex + 1, enteredpagey + 1)
            );
            this.deletePages(
              calcFetchY(this.enteredpagex + 1, enteredpagey + 1)
            );
          }
        }

        if (
          firstRow === (this.enteredpagey - 1) * this.pageRows &&
          this.direction === Direction.TOP
        ) {
          console.log(
            'fetch prev',
            calcFetchY(this.enteredpagex + 1, this.enteredpagey - 2)
          );
          this.fetchPage(
            calcFetchY(this.enteredpagex + 1, this.enteredpagey + 1)
          );
        }

        if (this.direction === Direction.BOTTOM) {
          const c1 =
            firstRow === enteredpagey * this.pageRows - this.pageRows + 1;
          const c2 = lastRow === enteredpagey * this.pageRows;
          if (c1 && c2) {
            console.log(
              'delete prev',
              calcFetchY(this.enteredpagex + 1, enteredpagey - 2)
            );
            this.deletePages(
              calcFetchY(this.enteredpagex + 1, enteredpagey - 2)
            );
          }
        }
      }

      if (this.direction == Direction.TOP && firstRow === 1) {
        console.log('delete next', calcFetchY(this.enteredpagex + 1, 3));
        this.deletePages(calcFetchY(this.enteredpagex + 1, 3));
      }
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

    if (lastCol > this.endIndexX) {
      this.direction = Direction.RIGHT;
    } else if (firstCol < this.startIndexX) {
      this.direction = Direction.LEFT;
    }

    this.endIndexX = lastCol;
    this.startIndexX = firstCol;
    this.calculatedColIndexes = colIdx;

    if (
      this.direction === Direction.RIGHT ||
      this.direction === Direction.LEFT
    ) {
      let enteredpagex = Math.ceil(lastCol / this.pageCols);
      if (enteredpagex !== this.enteredpagex) {
        this.enteredpagex = enteredpagex;
        if (this.direction === Direction.RIGHT) {
          console.log(
            'fetch next x',
            calcpages(this.enteredpagey + 1, this.enteredpagex + 1)
          );
          this.fetchPage(
            calcpages(this.enteredpagey + 1, this.enteredpagex + 1)
          );
        }
      }

      if (enteredpagex > 2) {
        if (this.direction === Direction.LEFT) {
          const c1 =
            firstCol - 1 ===
            (enteredpagex - 1) * this.pageCols - this.pageCols + 1;
          const c2 = lastCol - 1 === (enteredpagex - 1) * this.pageCols;
          if (c1 && c2) {
            console.log(
              'delete next',
              calcpages(this.enteredpagey + 1, enteredpagex + 1)
            );
            this.deletePages(
              calcpages(this.enteredpagey + 1, enteredpagex + 1)
            );
          }
        }

        if (this.direction === Direction.RIGHT) {
          const c1 =
            firstCol === enteredpagex * this.pageCols - this.pageCols + 1;
          const c2 = lastCol === enteredpagex * this.pageCols;
          if (c1 && c2) {
            console.log(
              'delete prev',
              calcpages(this.enteredpagey + 1, enteredpagex - 2)
            );
            this.deletePages(
              calcpages(this.enteredpagey + 1, enteredpagex - 2)
            );
          }
        }

        if (
          firstCol === (this.enteredpagex - 1) * this.pageCols &&
          this.direction === Direction.LEFT
        ) {
          console.log(
            'fetch prev',
            calcpages(this.enteredpagey + 1, enteredpagex - 2)
          );
          this.fetchPage(calcpages(this.enteredpagey + 1, enteredpagex - 2));
        }
      }

      if (this.direction == Direction.LEFT && firstCol === 1) {
        console.log('delete next x', calcpages(this.enteredpagey + 1, 3));
        this.deletePages(calcpages(this.enteredpagey + 1, 3));
      }
    }
  }

  onSheetContainerScroll(e: Event) {
    this.handleYScroll(e);
    this.handleXScroll(e);
  }

  isEdit = false;
  selectedEl: any = null;

  @HostListener('dblclick', ['$event'])
  onDoubleClick(e: any) {
    if (e.target.dataset.cell) {
      this.selectedEl = e.target;
      this.isEdit = true;
    }
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    if (this.selectedEl && e.target !== this.selectedEl) {
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
      console.log(page, cell.key);

      this.sheetData[page][cell.key] = cell.value;
    }
  }

  getPage(col: number, row: number): string {
    return Math.ceil(col / 14) + '-' + Math.ceil(row / 25);
  }

  getCellData(page: any, c: any) {
    const r = this.sheetData[page];
    if (r) {
      return r[c] || '';
    }
    return '';
  }

  fetchPage(pages: string[]) {
    this.fetchSource.next(pages);
  }

  deletePages(pages: string[]) {
    pages.forEach((p) => {
      delete this.sheetData[p];
    });
  }
}
