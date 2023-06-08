import Parser from 'web-tree-sitter';
import detectIndent from './detect-indent';
import NaiveParser from './naive-parser';

import { Pos, TextRange } from './text-range';

class EditContext {
  // Metadata
  filename = '';
  type = 'txt';
  indent = '\t';

  lineID = 0;

  // Contents
  lineIDs = [0];
  lines = [''];

  // Cursor
  selection = new TextRange(new Pos(0, 0), new Pos(0, 0));

  // Rendering
  renderedSelection = new TextRange(new Pos(0, 0), new Pos(0, 0));
  rendered: any[] = [null];

  // Parser
  parser: Parser | null = null;

  naiveParser: NaiveParser = new NaiveParser();

  constructor() {
    Parser.init({
      locateFile(scriptName: string, _scriptDirectory: string) {
        return `/wasm/${scriptName}`;
      },
    }).then(async () => {
      this.parser = new Parser();
      const Lua = await Parser.Language.load('/wasm/tree-sitter-lua.wasm');
      this.parser.setLanguage(Lua);
    });
  }

  loadContent(filename: string, content: string) {
    this.filename = filename;
    this.lines = content.split('\n');
    this.rendered = new Array(this.lines.length).fill(null);
    this.indent = detectIndent(content);
    // Reset cursor
    this.selection = new TextRange(new Pos(0, 0), new Pos(0, 0));
  }

  setType(type: string) {
    this.type = type;
  }

  // Position operations
  getMovedCursor(cursor: Pos, n: number): Pos {
    const c = cursor.clone();
    while (n > 0) {
      // Move forward
      const lineLen = this.lines[c.line].length;
      if (c.col + n <= lineLen) {
        c.col += n;
        n = 0;
      } else if (c.line >= this.lines.length - 1) {
        c.col = lineLen;
        n = 0;
      } else {
        n -= lineLen - c.col + 1;
        c.col = 0;
        c.line += 1;
      }
    }
    while (n < 0) {
      // Move backward
      if (c.col + n >= 0) {
        c.col += n;
        n = 0;
      } else if (c.line <= 0) {
        c.col = 0;
        n = 0;
      } else {
        n += c.col + 1;
        c.line -= 1;
        c.col = this.lines[c.line].length;
      }
    }
    return c;
  }

  // Line operations
  dirtyLine(index: number) {
    this.rendered[index] = null;
  }

  parse() {
    // Run parser
    if (this.parser !== null) {
      /*
      const tree = this.parser.parse((_index, position: any) => {
        let line = this.lines[position.row];
        if(line) return line.slice(position.column);
      });
      console.log(tree.childCount);
      let rc = tree.rootNode.child(0);
      if(rc !== null) {
        console.log(rc.toString());
      }
      */
      console.log('TODO');
    }
  }

  insertLine(index: number, line = '') {
    this.lineIDs.splice(index, 0, ++this.lineID);
    this.lines.splice(index, 0, line);
    this.rendered.splice(index, 0, null);
    this.dirtyLine(index);
  }

  deleteLines(start: number, end: number) {
    this.lineIDs.splice(start, end - start);
    this.lines.splice(start, end - start);
    this.rendered.splice(start, end - start);
  }

  indentLine(line: number | null = null) {
    if (line === null) {
      line = this.selection.start.line;
    }
    this.lines[line] = this.indent + this.lines[line];
    if (this.selection.start.line === line) {
      this.selection.start.col += this.indent.length;
    }
    if (this.selection.end.line === line) {
      this.selection.end.col += this.indent.length;
    }
    this.dirtyLine(line);
  }

  outdentLine(line: number | null = null) {
    if (line === null) {
      line = this.selection.start.line;
    }
    let outdented = 0;
    if (this.lines[line].startsWith(this.indent)) {
      this.lines[line] = this.lines[line].substring(this.indent.length);
      outdented = this.indent.length;
    } else if (
      this.lines[line].startsWith('\t') ||
      this.lines[line].startsWith(' ')
    ) {
      this.lines[line] = this.lines[line].substring(1);
      outdented = 1;
    }
    if (this.selection.start.line === line) {
      this.selection.start.col -= outdented;
    }
    if (this.selection.end.line === line) {
      this.selection.end.col -= outdented;
    }
    this.dirtyLine(line);
  }

  // Selection operations
  deleteSelection() {
    if (this.selection.start.line === this.selection.end.line) {
      // Delete within line
      const line = this.lines[this.selection.start.line];
      this.lines[this.selection.start.line] =
        line.substring(0, this.selection.start.col) +
        line.substring(this.selection.end.col);
      this.dirtyLine(this.selection.start.line);
    } else {
      // Delete across lines
      const line = this.lines[this.selection.start.line];
      this.lines[this.selection.start.line] = line.substring(
        0,
        this.selection.start.col,
      );
      this.lines[this.selection.start.line] += this.lines[
        this.selection.end.line
      ].substring(this.selection.end.col);
      this.deleteLines(
        this.selection.start.line + 1,
        this.selection.end.line + 1,
      );
      this.dirtyLine(this.selection.start.line);
    }
    this.selection = new TextRange(this.selection.start, this.selection.start);
  }

  // Cursor operations
  insert(str: string) {
    // If selection is not empty, delete selection first
    if (!this.selection.empty()) {
      this.deleteSelection();
    }
    // Split string into lines
    const lines = str.split('\n');
    // Insert first line
    const line = this.lines[this.selection.start.line];
    this.lines[this.selection.start.line] =
      line.substring(0, this.selection.start.col) + lines[0];
    this.dirtyLine(this.selection.start.line);
    // Insert rest lines
    for (let i = 1; i < lines.length; i++) {
      this.insertLine(this.selection.start.line + i, lines[i]);
    }
    // Put cursor at the end of the last line
    const endLine = this.selection.start.line + lines.length - 1;
    const endCol = this.lines[endLine].length;
    const endPos = new Pos(endLine, endCol);
    this.selection = new TextRange(endPos, endPos);
    this.lines[endLine] += line.substring(this.selection.start.col);
  }

  delete(n: number) {
    // If selection is not empty, delete selection first
    if (this.selection.empty()) {
      const cur = this.getMovedCursor(this.selection.start, -n);
      if (n > 0) {
        this.selection.start = cur;
      } else {
        this.selection.end = cur;
      }
    }
    this.deleteSelection();
  }

  // Stringify
  toRawString() {
    return this.lines.join('\n');
  }

  moveCursor(line: number, col: number) {
    const newPos = new Pos(line, col);
    this.selection = new TextRange(newPos, newPos);
  }

  chunkOnClick = (_word: string, range: TextRange) => {
    return (e: any) => {
      console.log(range.toString());
      e.stopPropagation();
      this.moveCursor(range.end.line, range.end.col);
    };
  };

  // Rendering
  renderLine(index: number) {
    const line = this.lines[index];
    // Guess indent size
    const indent = this.naiveParser.getIndentLevel(line, this.indent);
    const ranges = this.naiveParser.splitLine(index, line);
    // Render
    // Indent element
    const xIndent = <span className="code-indent">{'-'.repeat(indent)}</span>;
    // Other elements
    const xElements = ranges.map((range, i) => {
      const classes = 'code-chunk';
      let word = line.substring(range.start.col, range.end.col);
      const sym = this.naiveParser.symbolMap.get(word);
      if (sym !== undefined) {
        word = sym;
      }
      return (
        <span
          key={i}
          className={classes}
          onClick={this.chunkOnClick(word, range)}
        >
          {word}
        </span>
      );
    });
    this.rendered[index] = (
      <div key={this.lineIDs[index]} className="code-line">
        {xIndent}
        {xElements}
      </div>
    );
  }

  renderAll() {
    // If selection changed, rerender changed selection
    if (!this.renderedSelection.equals(this.selection)) {
      for (
        let i = this.renderedSelection.start.line;
        i <= this.renderedSelection.end.line;
        i++
      ) {
        this.rendered[i] = null;
      }
      for (
        let i = this.selection.start.line;
        i <= this.selection.end.line;
        i++
      ) {
        this.rendered[i] = null;
      }
      this.renderedSelection = this.selection.clone();
    }
    for (let i = 0; i < this.lines.length; i++) {
      if (this.rendered[i] !== null) {
        continue;
      }
      this.renderLine(i);
    }
    return this.rendered;
  }
}

export default EditContext;
