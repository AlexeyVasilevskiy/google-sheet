import { Injectable } from '@angular/core';
import { of, delay } from 'rxjs';
import { Cell } from '../models/cell.model';

const delayTime = 500;
const key = 'sheet';
@Injectable({
  providedIn: 'root',
})
export class SheetService {
  constructor() {}

  getPage(pages: string[]) {
    let data: any = localStorage.getItem(key);
    const result: any = {};

    if (data !== null) {
      data = JSON.parse(data);

      pages.forEach((p) => {
        if (data[p]) {
          result[p] = data[p];
        } else {
          result[p] = {};
        }
      });
    }

    return of(result).pipe(delay(delayTime));
  }

  addCell(cell: Cell, page: string) {
    let data: any = localStorage.getItem(key);
    console.log(cell.key, page);

    if (data !== null) {
      data = JSON.parse(data);
    } else {
      data = {};
    }

    if (cell.value) {
      if (!data[page]) {
        data[page] = {};
      }
      data[page][cell.key] = cell.value;
    } else {
      delete data[page][cell.key];
    }

    localStorage.setItem(key, JSON.stringify(data));

    return of().pipe(delay(delayTime));
  }
}
