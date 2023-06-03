import { useRef, useState, useCallback } from "react";

import EditContext from './lib/edit-context';
import './Edit.css';

enum SpecialAction {
  NONE,
  RETURN,
  DOUBLE_SPACE,
  EMPTY_RETURN,
  EMPTY_SPACE,
  EMPTY_BACKSPACE,
};

const Edit = () => {
  const listRef = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const rawTARef = useRef<any>(null);

  const [rawMode, setRawMode] = useState<boolean>(false);

  const [ctx, setCtx] = useState<{edit: EditContext}>({edit: new EditContext()});
  const ectx = ctx.edit;
  const rerenderEdit = () => setCtx({edit: ectx});

  const onReturnKey = () => {
    const input = inputRef.current;
    if(input !== null) {
      const val = input.value;
      input.value = "";
      ectx.insert(val);
      rerenderEdit();
      console.log(ctx.edit);
    }
  };

  const onDoubleSpace = () => {};
  const onEmptyReturn = () => {
    ectx.insert("\n");
    rerenderEdit();
  };
  const onEmptySpace = () => {
    ectx.indentLine();
    rerenderEdit();
  };
  const onEmptyBackspace = () => {
    ectx.delete(1);
    rerenderEdit();
  };

  const handleSpecialAction = (e: any, action: SpecialAction) => {
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
    // Focus to input
    const input = inputRef.current;
    if(input !== null) {
      input.focus();
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
        return handleSpecialAction(e, SpecialAction.EMPTY_BACKSPACE);
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
        return handleSpecialAction(e, SpecialAction.EMPTY_RETURN);
      } else {
        return handleSpecialAction(e, SpecialAction.RETURN);
      }
    case 32: { // Space key
      if(input.value.length === 0) {
        return handleSpecialAction(e, SpecialAction.EMPTY_SPACE);
      }
    }
    }
    // Move scroll to bottom of input
    if(window.visualViewport !== null) {
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
      return handleSpecialAction(e, SpecialAction.DOUBLE_SPACE);
    }
  };

  const onReturnButton = (e: any) => {
    let input = inputRef.current;
    if(input !== null) {
      if(input.value.length === 0) {
        return handleSpecialAction(e, SpecialAction.EMPTY_RETURN);
      } else {
        return handleSpecialAction(e, SpecialAction.RETURN);
      }
    }
  };

  const onRawTAKeyDown = (e: any) => {
    // Check tab
    if(e.keyCode === 9) {
      e.preventDefault();
      const oldVal = e.target.value;
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      e.target.value = oldVal.substring(0, start) + "\t" + oldVal.substring(end);
      e.target.selectionStart = e.target.selectionEnd = start + 1;
    }
  };

  const toggleRawMode = () => {
    if(rawMode) {
      let text = undefined;
      if(rawTARef.current !== null) {
        text = rawTARef.current.value;
      }
      setRawMode(false);
      if(text !== undefined) {
        ectx.loadContent('<raw>', text);
      }
    } else {
      setRawMode(true);
    }
  };

  return (
    <>
      <div className="float-btn">
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
           ☰ 
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li><a className="dropdown-item" href="#" onClick={toggleRawMode}>
              {rawMode ? "Block Mode" : "Raw Mode"}
            </a></li>
          </ul>
        </div>
      </div>
      {
        rawMode ? (
          <>
            <textarea ref={rawTARef}
              className="form-control code-raw"
              onKeyDown={onRawTAKeyDown}
              defaultValue={ctx.edit.toRawString()} />
          </>
        ) : (
          <>
            <div className="blocks" ref={listRef}>
              <div className="w-auto m-2">
                {ctx.edit.renderAll()}
              </div>
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
                  onKeyDown={onTextKeyDown}
                  onKeyUp={onTextKeyUp}
                />
                <button className="btn btn-primary"
                    type="button"
                    onClick={onReturnButton}>
                  ⏎
                </button>
              </div>
            </div>
          </>
        )
      }
    </>
  );
};

export default Edit;
