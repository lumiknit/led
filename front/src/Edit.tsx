import { useRef, useState } from "react";

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

  const onTextKeyDown = (e: any) => {
    switch(e.keyCode) {
    case 13:
      e.preventDefault();
      return onReturnKey();
    case 9: {
      e.preventDefault();
      const input = inputRef.current;
      if(input !== null) {
        const oldVal = input.value;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = oldVal.substring(0, start) + "\t" + oldVal.substring(end);
        input.selectionStart = input.selectionEnd = start + 1;
      }
    } break;
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

  return (
    <>
      <div className="blocks" ref={listRef}>
        <div className="w-auto m-2">
          {codeList.map((val) => (
            <span className="blk blk-blue">{val}</span>
          ))}
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
