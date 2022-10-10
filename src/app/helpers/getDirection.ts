import { Direction } from '../models/direction.model';

export function getDirection(
  firstCell: number,
  lastCell: number,
  startIdx: number,
  endIdx: number,
  isX: boolean = false
): Direction {
  let direction = Direction.RIGHT;
  if (isX) {
    if (lastCell > endIdx) {
      direction = Direction.RIGHT;
    } else if (firstCell < startIdx) {
      direction = Direction.LEFT;
    }
  } else {
    if (lastCell > endIdx) {
      direction = Direction.BOTTOM;
    } else if (firstCell < startIdx) {
      direction = Direction.TOP;
    }
  }
  return direction;
}

export function isXDirection(direction: Direction): boolean {
  return direction === Direction.RIGHT || direction === Direction.LEFT;
}

export function isYDirection(direction: Direction): boolean {
  return direction === Direction.TOP || direction === Direction.BOTTOM;
}
