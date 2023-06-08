import { forwardRef, useEffect } from 'react';

import './RawText.css';

type RawTextProps = {
  defaultValue?: string;
};

const RawText = forwardRef((props: RawTextProps, ref: any) => {
  const defaultValue = props.defaultValue || '';

  const adjustHeight = () => {
    const textarea = ref.current;
    if (textarea !== null) {
      textarea.style.height = 'auto';
      textarea.style.height = 10 + textarea.scrollHeight + 'px';
    }
  };

  const onKeyDown = (e: any) => {
    // Check tab
    switch (e.keyCode) {
      case 9:
        {
          e.preventDefault();
          const oldVal = e.target.value;
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          e.target.value =
            oldVal.substring(0, start) + '\t' + oldVal.substring(end);
          e.target.selectionStart = e.target.selectionEnd = start + 1;
        }
        break;
      case 13:
        {
          // Autoindent
          e.preventDefault();
          const oldVal = e.target.value;
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          // Find current line start
          let p = start;
          while (p > 0 && oldVal[p - 1] !== '\n') p--;
          // Get indent
          let q = p;
          while (q < start && (oldVal[q] === ' ' || oldVal[q] === '\t')) q++;
          const indent = oldVal.substring(p, q);
          // Insert newline with indent
          e.target.value =
            oldVal.substring(0, start) + '\n' + indent + oldVal.substring(end);
          adjustHeight();
        }
        break;
    }
  };

  const onInput = (_e: any) => {
    // Automatically resize its height
    adjustHeight();
  };

  useEffect(() => {
    adjustHeight();
  });

  return (
    <textarea
      ref={ref}
      className="raw-text"
      onKeyDown={onKeyDown}
      onInput={onInput}
      defaultValue={defaultValue}
    />
  );
});

export default RawText;
