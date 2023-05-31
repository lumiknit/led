import React, { useRef } from "react";

const Edit = () => {
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const onReturnKey = (e) => {
    const val = inputRef.current.value;
    inputRef.current.value = "";

    listRef.current.innerHTML += val + "<br>";
  };

  const onTextKeyDown = (e) => {
    switch(e.keyCode) {
    case 13:
      e.preventDefault();
      return onReturnKey(e);
    case 9: {
      e.preventDefault();
      const oldVal = inputRef.current.value;
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      inputRef.current.value = oldVal.substring(0, start) + "\t" + oldVal.substring(end);
      inputRef.current.selectionStart = inputRef.current.selectionEnd = start + 1;
    } break;
    }
  };

  return (
    <>
      <div ref={listRef}>
      </div>
      <div className="fixed-bottom">
        <div className="w-auto m-2">
          <span className="badge bg-primary"> Test </span>
        </div>
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
