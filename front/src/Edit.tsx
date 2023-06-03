import { useRef, useState, useEffect } from 'react';

import EditContext from './lib/edit-context';
import './Edit.css';

import RawText from './RawText';

enum SpecialAction {
  NONE,
  RETURN,
  DOUBLE_SPACE,
  EMPTY_RETURN,
  EMPTY_SPACE,
  EMPTY_BACKSPACE,
}

const Edit = () => {
  const inputGroupRef = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const rawTextRef = useRef<any>(null);

  const [rawMode, setRawMode] = useState<boolean>(false);

  const [ctx, setCtx] = useState<{ edit: EditContext }>({
    edit: new EditContext(),
  });
  const ectx = ctx.edit;
  const rerenderEdit = () => setCtx({ edit: ectx });

  const cleanInput = () => {
    const input = inputRef.current;
    if (input !== null) {
      input.value = '';
      const hiddenInp = document.createElement('input');
      hiddenInp.setAttribute('type', 'text');
      document.body.appendChild(hiddenInp);
      hiddenInp.focus();
      window.setTimeout(() => {
        input.focus();
        hiddenInp.remove();
      }, 0);
    }
  };

  const onReturnKey = () => {
    const input = inputRef.current;
    if (input !== null) {
      const val = input.value;
      cleanInput();
      ectx.insert(val + ' ');
      rerenderEdit();
    }
  };

  const onDoubleSpace = () => {};
  const onEmptyReturn = () => {
    ectx.insert('\n');
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
    switch (action) {
      case SpecialAction.RETURN:
        onReturnKey();
        break;
      case SpecialAction.DOUBLE_SPACE:
        onDoubleSpace();
        break;
      case SpecialAction.EMPTY_RETURN:
        onEmptyReturn();
        break;
      case SpecialAction.EMPTY_SPACE:
        onEmptySpace();
        break;
      case SpecialAction.EMPTY_BACKSPACE:
        onEmptyBackspace();
        break;
      default:
        return;
    }
    // Focus to input
    const input = inputRef.current;
    if (input !== null) {
      input.focus();
    }
  };

  const onTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (input === null) {
      // Nothing to do
      return;
    }

    switch (e.keyCode) {
      case 8:
        {
          // Backspace
          if (input.value.length === 0) {
            return handleSpecialAction(e, SpecialAction.EMPTY_BACKSPACE);
          }
        }
        break;
      case 9:
        {
          // Tab key
          e.preventDefault();
          const oldVal = input.value;
          const start = input.selectionStart;
          const end = input.selectionEnd;
          input.value =
            oldVal.substring(0, start) + '\t' + oldVal.substring(end);
          input.selectionStart = input.selectionEnd = start + 1;
        }
        break;
      case 13: // Return key
        if (input.value.length === 0) {
          return handleSpecialAction(e, SpecialAction.EMPTY_RETURN);
        } else {
          return handleSpecialAction(e, SpecialAction.RETURN);
        }
      case 32: {
        // Space key
        if (input.value.length === 0) {
          return handleSpecialAction(e, SpecialAction.EMPTY_SPACE);
        }
      }
    }
    // Move scroll to bottom of input
    if (window.visualViewport !== null) {
      const box = input.getBoundingClientRect();
      const y = window.pageYOffset + box.top + box.height;
      const scrollY = 8 + y - window.visualViewport.height;
      // Scroll to y to fit at bottom
      window.scrollTo(0, scrollY);
    }
  };

  const onTextKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (input === null) {
      // Nothing to do
      return;
    }
    if (input.value.endsWith('  ')) {
      return handleSpecialAction(e, SpecialAction.DOUBLE_SPACE);
    }
  };

  const onReturnButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    const input = inputRef.current;
    if (input !== null) {
      if (input.value.length === 0) {
        return handleSpecialAction(e, SpecialAction.EMPTY_RETURN);
      } else {
        return handleSpecialAction(e, SpecialAction.RETURN);
      }
    }
  };

  const toggleRawMode = () => {
    if (rawMode) {
      let text = undefined;
      if (rawTextRef.current !== null) {
        text = rawTextRef.current.value;
      }
      setRawMode(false);
      if (text !== undefined) {
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
          <button
            className="btn btn-primary dropdown-toggle"
            type="button"
            id="dropdownMenuButton1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            ☰
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li>
              <a className="dropdown-item" href="#" onClick={toggleRawMode}>
                {rawMode ? 'Block Mode' : 'Raw Mode'}
              </a>
            </li>
          </ul>
        </div>
      </div>
      {rawMode ? (
        <RawText ref={rawTextRef} defaultValue={ectx.toRawString()} />
      ) : (
        <>
          <div className="code-area">
            {ectx.renderAll()}
          </div>
          <div className="input-group-bottom" ref={inputGroupRef}>
            <div className="input-group w-auto m-2">
              <button className="btn btn-secondary" type="button">
                ⌘
              </button>
              <input
                ref={inputRef}
                type="text"
                className="form-control input-code"
                placeholder="code"
                onKeyDown={onTextKeyDown}
                onKeyUp={onTextKeyUp}
              />
              <button
                className="btn btn-primary"
                type="button"
                onClick={onReturnButton}
              >
                ⏎
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Edit;
