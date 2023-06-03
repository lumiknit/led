import Parser from 'web-tree-sitter';
import detectIndent from './detect-indent';

class EditContext {
  // Metadata
  filename = '';
  type = 'txt';
  indent = '\t';

  // Contents
  lineID = 0;
  lineIDs = [0];
  lines = [''];
  rendered: any[] = [null];

  // Cursor
  selectionStart: [number, number] = [0, 0];
  selectionEnd: [number, number] = [0, 0];

  // Parser
  parser: Parser | null = null;

  constructor() {
    Parser.init({
      locateFile(scriptName: string, _scriptDirectory: string) {
        return `/wasm/${scriptName}`;
      },
    }).then(async () => {
      this.parser = new Parser;
      const Lua = await Parser.Language.load("/wasm/tree-sitter-lua.wasm");
      this.parser.setLanguage(Lua);
    });
  }

  loadContent(filename: string, content: string) {
    this.filename = filename;
    this.lines = content.split('\n');
    this.rendered = new Array(this.lines.length).fill(null);
    this.indent = detectIndent(content);
    // Reset cursor
    this.selectionStart = [0, 0];
    this.selectionEnd = [0, 0];
  }

  setType(type: string) {
    this.type = type;
  }

  // Position operations
  getMovedCursor(cursor: [number, number], n: number): [number, number] {
    const [line, col] = cursor;
    let newLine = line;
    let newCol = col;
    while (n > 0) {
      // Move forward
      const lineLen = this.lines[newLine].length;
      if (newCol + n <= lineLen) {
        newCol += n;
        n = 0;
      } else if (newLine >= this.lines.length - 1) {
        newCol = lineLen;
        n = 0;
      } else {
        n -= lineLen - newCol + 1;
        newCol = 0;
        newLine += 1;
      }
    }
    while (n < 0) {
      // Move backward
      if (newCol + n >= 0) {
        newCol += n;
        n = 0;
      } else if (newLine <= 0) {
        newCol = 0;
        n = 0;
      } else {
        n += newCol + 1;
        newLine -= 1;
        newCol = this.lines[newLine].length;
      }
    }
    return [newLine, newCol];
  }

  // Line operations
  dirtyLine(index: number) {
    this.rendered[index] = null;
  }

  parse() {
    // Run parser
    if (this.parser !== null) {
      const tree = this.parser.parse((_index, position) => {
        let line = this.lines[position.row];
        if(line) return line.slice(position.column);
      });
      console.log(tree.childCount);
      console.log(tree.rootNode.child(0).toString());
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
      line = this.selectionStart[0];
    }
    this.lines[line] = this.indent + this.lines[line];
    if (this.selectionStart[0] === line) {
      this.selectionStart[1] += this.indent.length;
    }
    if (this.selectionEnd[0] === line) {
      this.selectionEnd[1] += this.indent.length;
    }
    this.dirtyLine(line);
  }

  // Selection operations
  isSelectionEmpty() {
    const lineEq = this.selectionStart[0] === this.selectionEnd[0];
    const colEq = this.selectionStart[1] === this.selectionEnd[1];
    return lineEq && colEq;
  }

  deleteSelection() {
    const [startLine, startCol] = this.selectionStart;
    const [endLine, endCol] = this.selectionEnd;
    if (startLine === endLine) {
      // Delete within line
      const line = this.lines[startLine];
      this.lines[startLine] =
        line.substring(0, startCol) + line.substring(endCol);
      this.dirtyLine(startLine);
    } else {
      // Delete across lines
      const line = this.lines[startLine];
      this.lines[startLine] = line.substring(0, startCol);
      this.lines[startLine] += this.lines[endLine].substring(endCol);
      this.deleteLines(startLine + 1, endLine + 1);
      this.dirtyLine(startLine);
    }
    this.selectionStart = [startLine, startCol];
    this.selectionEnd = [startLine, startCol];
  }

  // Cursor operations
  insert(str: string) {
    // If selection is not empty, delete selection first
    if (!this.isSelectionEmpty()) {
      this.deleteSelection();
    }
    // Split string into lines
    const lines = str.split('\n');
    // Insert first line
    const [startLine, startCol] = this.selectionStart;
    const line = this.lines[startLine];
    this.lines[startLine] = line.substring(0, startCol) + lines[0];
    this.dirtyLine(startLine);
    // Insert rest lines
    for (let i = 1; i < lines.length; i++) {
      this.insertLine(startLine + i, lines[i]);
    }
    // Put cursor at the end of the last line
    const endLine = startLine + lines.length - 1;
    const endCol = this.lines[endLine].length;
    this.selectionStart = [endLine, endCol];
    this.selectionEnd = [endLine, endCol];
    this.lines[endLine] += line.substring(startCol);
  }

  delete(n: number) {
    // If selection is not empty, delete selection first
    if (this.isSelectionEmpty()) {
      const cur = this.getMovedCursor(this.selectionStart, -n);
      if (n > 0) {
        this.selectionStart = cur;
      } else {
        this.selectionEnd = cur;
      }
    }
    this.deleteSelection();
  }

  // Stringify
  toRawString() {
    return this.lines.join('\n');
  }

  // Rendering
  renderLine(index: number) {
    const line = this.lines[index];
    // Remove indentation
    let indent = 0;
    let p = 0;
    for (;;) {
      if (line[p] === ' ') {
        let i = 0;
        while (i < this.indent.length && line[p] === ' ') {
          p++;
          i++;
        }
        indent++;
      } else if (line[p] === '\t') {
        indent++;
        p++;
      } else break;
    }
    const chunks = line.substring(p).trim().split(' ');
    const r = (
      <div key={this.lineIDs[index]} className="code-line">
        <span className="code-indent">{'-'.repeat(indent)}</span>
        {
          chunks.map((word, i) => {
            let chunk_shape = "code-chunk-c";
            if(chunks.length === 1) {
              chunk_shape = "code-chunk-1";
            } else {
              if(i === 0) {
                chunk_shape = "code-chunk-l";
              } else if(i === chunks.length - 1) {
                chunk_shape = "code-chunk-r";
              }
            }
            return <span key={i} className={chunk_shape}>{word}</span>;
          })
        }
      </div>
    );
    this.rendered[index] = r;
  }

  renderAll() {
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
