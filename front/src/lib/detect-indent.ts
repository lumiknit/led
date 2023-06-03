const scanLine = (src: string, pos: number) => {
  let tab = false;
  let indent = 0;
  // Scan tabs
  while (src[pos] === '\t') {
    tab = true;
    pos++;
  }
  // Scan spaces
  while (src[pos] === ' ') {
    indent++;
    pos++;
  }
  // Pass until line ends
  while (pos < src.length && src[pos] !== '\n' && src[pos] !== '\r') {
    pos++;
  }
  // Pass newlines
  while (pos < src.length && (src[pos] === '\n' || src[pos] === '\r')) {
    pos++;
  }
  return { pos, tab, indent };
};

const detectIndent = (src: string, MAX_LINES: number = 1024) => {
  let pos = 0;
  let indent = undefined;
  for(let i = 0; i < MAX_LINES && pos < src.length; i++) {
    const { pos: newPos, tab, indent: newIndent } = scanLine(src, pos);
    if (tab) {
      return '\t';
    } else if (newIndent > 0 && (indent === undefined || newIndent < indent)) {
      indent = newIndent;
    }
    pos = newPos;
  }
  if(indent === undefined) {
    return '\t';
  }
  return ' '.repeat(indent);
};

export default detectIndent;

