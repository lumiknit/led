import { useRef, useState } from "react";

import './Edit.css';

enum SpecialAction {
  NONE,
  RETURN,
  DOUBLE_SPACE,
  EMPTY_RETURN,
  EMPTY_SPACE,
  EMPTY_BACKSPACE,
};


class Chunk {
  parent: Chunk | null = null;
  name: string;
  args: Chunk[];
  sub: Chunk[];

  constructor(name: string, parent: Chunk | null = null) {
    this.parent = parent;
    this.name = name;
    this.args = [];
    this.sub = [];
  }

  isRoot() {
    return this.parent === null;
  }

  argIndex() {
    if(this.parent === null) {
      return -1;
    }
    return this.parent.args.indexOf(this);
  }

  subIndex() {
    if(this.parent === null) {
      return -1;
    }
    return this.parent.sub.indexOf(this);
  }

  toString(indent: number = 0) {
    let hd = `${this.name}(${this.args.map((x) => x.toString(indent + 1)).join(", ")})`;
    if(this.sub.length > 0) {
      hd += " {";
      for(const sub of this.sub) {
        hd += '\n' + ' '.repeat((indent + 1) * 2) + sub.toString(indent + 1) + ",";
      }
      hd += '\n' + ' '.repeat(indent * 2) + "}";
    }
    return hd;
  }
}

class EditContext {
  constructor() {
  }

  insertText() {
  }
}

const Edit = () => {
  const listRef = useRef<any>(null);
  const inputRef = useRef<any>(null);

  const [codeList, setCodeList] = useState<any[]>([]);

  const onReturnKey = () => {
    const input = inputRef.current;
    if(input !== null) {
      const val = input.value;
      input.value = "";

      setCodeList(codeList.concat([val]));
    }
  };

  const handleSpecialAction = (action: SpecialAction) => {
    e.preventDefault();
    switch(action) {
    case SpecialAction.RETURN:
      return onReturnKey();
    case SpecialAction.DOUBLE_SPACE:
      return onDoubleSpace();
    case SpecialAction.EMPTY_RETURN:
      return onEmptyReturn();
    case SpecialAction.EMPTY_SPACE:
      return onEmptySpace();
    case SpecialAction.EMPTY_BACKSPACE:
      return onEmptyBackspace();
    }
  };

  const onTextKeyDown = (e: any) => {
    const input = inputRef.current;
    if(input === null) {
      // Nothing to do
      return;
    }

    switch(e.keyCode) {
    case 8: { // Backspace
      if(input.value.length === 0) {
        return handleSpecialAction(SpecialAction.EMPTY_BACKSPACE);
      }
    } break;
    case 9: { // Tab key
      e.preventDefault();
      const oldVal = input.value;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = oldVal.substring(0, start) + "\t" + oldVal.substring(end);
      input.selectionStart = input.selectionEnd = start + 1;
    } break;
    case 13: // Return key
      if(input.value.length === 0) {
        return handleSpecialAction(SpecialAction.EMPTY_RETURN);
      } else {
        return handleSpecialAction(SpecialAction.RETURN);}
      }
    case 32: { // Space key
      if(input.value.length === 0) {
        return handleSpecialAction(SpecialAction.EMPTY_SPACE);
      }
    }
    // Move scroll to bottom of input
    const input = inputRef.current;
    if(input !== null && window.visualViewport !== null) {
      const box = input.getBoundingClientRect();
      const y = window.pageYOffset + box.top + box.height;
      const scrollY = 8 + y - window.visualViewport.height;
      // Scroll to y to fit at bottom
      window.scrollTo(0, scrollY);
    }
  };

  const onTextKeyUp = (e: any) => {
    const input = inputRef.current;
    if(input === null) {
      // Nothing to do
      return;
    }
    if(input.value.endsWith("  ")) {
      return handleSpecialAction(SpecialAction.DOUBLE_SPACE);
    }
  };


  let chunk = new Chunk("root");
  chunk.args.push(new Chunk("print"));
  chunk.sub.push(new Chunk("test"));
  console.log(chunk.toString());

  return (
    <>
      <div className="blocks" ref={listRef}>
        <div className="w-auto m-2">
          {codeList.map((val) => (
            <span className="blk blk-blue">{val}</span>
          ))}
        </div>
        <span className="blk blk-l blk-blue"> if </span><span className="blk blk-c blk-outline-black"> f </span><span className="blk blk-c blk-outline-red"> == </span><span className="blk blk-r blk-outline-black"> 20 </span>
      </div>
      <div className="input-group-bottom">
        <div className="input-group w-auto m-2">
          <button className="btn btn-secondary" type="button">
            ⌘
          </button>
          <input ref={inputRef}
            type="text"
            className="form-control input-code"
            placeholder="code"
            onKeyDown={onTextKeyDown} />
          <button className="btn btn-primary" type="button" onClick={onReturnKey}>
            ⏎
          </button>
        </div>
      </div>
    </>
  );
};

export default Edit;
