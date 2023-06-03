import { forwardRef } from 'react';

import './RawText.css';

type RawTextProps = {
  defaultValue?: string;
};

const RawText = forwardRef((props: RawTextProps, ref: any) => {
  const defaultValue = props.defaultValue || '';

  const onKeyDown = (e: any) => {
    // Check tab
    if (e.keyCode === 9) {
      e.preventDefault();
      const oldVal = e.target.value;
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      e.target.value =
        oldVal.substring(0, start) + '\t' + oldVal.substring(end);
      e.target.selectionStart = e.target.selectionEnd = start + 1;
    }
  };

  const onInput = (e: any) => {
    // Automatically resize its height
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

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
