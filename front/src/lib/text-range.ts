class Pos {
  line: number;
  col: number;

  constructor(line: number, col: number) {
    this.line = line;
    this.col = col;
  }

  clone(): Pos {
    return new Pos(this.line, this.col);
  }

  equals(other: Pos): boolean {
    return this.line === other.line && this.col === other.col;
  }

  compare(other: Pos): number {
    if (this.line === other.line) {
      if (this.col === other.col) {
        return 0;
      } else if (this.col < other.col) {
        return -1;
      } else {
        return 1;
      }
    } else if (this.line < other.line) {
      return -1;
    } else {
      return 1;
    }
  }

  toString(): string {
    return `${this.line}:${this.col}`;
  }
}

class TextRange {
  start: Pos;
  end: Pos;

  constructor(start: Pos, end: Pos) {
    this.start = start;
    this.end = end;
  }

  clone(): TextRange {
    return new TextRange(this.start.clone(), this.end.clone());
  }

  equals(other: TextRange): boolean {
    return this.start.equals(other.start) && this.end.equals(other.end);
  }

  empty(): boolean {
    return this.start.equals(this.end);
  }

  includePos(pos: Pos): boolean {
    const s0 = this.start.compare(pos);
    const s1 = this.end.compare(pos);
    return s0 <= 0 && 0 < s1;
  }

  isOverlapped(sub: TextRange): boolean {
    const startIn = this.includePos(sub.start);
    const endIn = this.includePos(sub.end);
    return startIn || endIn;
  }

  toString(): string {
    return `${this.start.toString()} - ${this.end.toString()}`;
  }
}

export { Pos, TextRange };
