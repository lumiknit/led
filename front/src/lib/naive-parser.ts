import { Pos, TextRange } from './text-range';

const SYMBOL_TABLE = {
  '>=': '≥',
  '<=': '≤',
  '!=': '≠',
  '<-': '←',
  '->': '→',
  '=>': '⇒',
  '<=>': '⇔',
  '<--': '⟵',
  '-->': '⟶',
  '<->': '⟷',
  '<==': '⟸',
  '==>': '⟹',
  '<==>': '⟺',
  '<<-': '↞',
  '->>': '↠',
  '<-<': '↢',
  '>->': '↣',
  '<-|': '↤',
  '|->': '↦',
  '-<': '⤙',
  '>-': '⤚',
  '||': '∥',
  '<|': '⊲',
  '|>': '⊳',
  '~=': '≈',
  '<+>': '⊕',
  '<*>': '⊗',
  '/\\': '∧',
  '\\/': '∨',
  '++': '⧺',
  '|=': '⊨',
  '|-': '⊢',
  '-|': '⊣',
  '=|': '⫤',
  '||-': '⊩',
  '||=': '⊫',
  '-||': '⫣',
  '=||': '⫥',
  '_|_': '⊥',
  '...': '…',
  '===': '≡',
  '!==': '≢',
  '[|': '⟦',
  '|]': '⟧',
  '{|': '⦃',
  '|}': '⦄',
  '(|': '⦇',
  '|)': '⦈',
  ':=': '≔',
  '=:': '≕',
  '::=': '⩴',
  '::': '∷',
};

class Parser {
  // Characters used for separating tokens
  CH_SEP = '()[]{}\'"`,';
  // Characters which cannot be used for identifier
  CH_SPECIAL = '~!@#%^&:;<>?\\|';
  // Characters which may be used for id
  CH_NEUTRAL = '$_-+=/*';

  C_WHITE = -1;
  C_SEP = 0;
  C_SPECIAL = 1;
  C_NEUTRAL = 2;

  chMap: Map<string, number> = new Map();

  symbolMap: Map<string, string> = new Map();

  constructor() {
    this.generateChMap();
    this.generateSymbolMap();
  }

  generateChMap() {
    this.chMap = new Map();
    for (let i = 0; i <= 32; i++) {
      this.chMap.set(String.fromCharCode(i), this.C_WHITE);
    }
    for (let i = 0; i < this.CH_SEP.length; i++) {
      this.chMap.set(this.CH_SEP[i], this.C_SEP);
    }
    for (let i = 0; i < this.CH_SPECIAL.length; i++) {
      this.chMap.set(this.CH_SPECIAL[i], this.C_SPECIAL);
    }
    for (let i = 0; i < this.CH_NEUTRAL.length; i++) {
      this.chMap.set(this.CH_NEUTRAL[i], this.C_NEUTRAL);
    }
  }

  generateSymbolMap() {
    this.symbolMap = new Map(Object.entries(SYMBOL_TABLE));
  }

  indentStringToTabWidth(s: string): number {
    if (s === '\t') {
      return 2;
    } else {
      return s.length;
    }
  }

  getIndentLevel(s: string, tabWidth: string | number): number {
    if (typeof tabWidth === 'string') {
      tabWidth = this.indentStringToTabWidth(tabWidth);
    }
    let p = 0;
    let level = 0;
    while (p < s.length) {
      if (s[p] === '\t') {
        p++;
        level++;
      } else if (s[p] === ' ') {
        let q = p;
        while (q < s.length && q - p < tabWidth && s[q] === ' ') {
          q++;
        }
        p = q;
        level++;
      } else {
        break;
      }
    }
    return level;
  }

  splitLine(line: number, s: string): TextRange[] {
    // If chmap is not generated, generate it
    let p = 0;
    const ranges = [];
    while (p < s.length) {
      // Skip first whitespaces
      while (p < s.length && this.chMap.get(s[p]) === this.C_WHITE) {
        p++;
      }
      // If p is out of range, break
      if (p >= s.length) {
        break;
      }
      // If p is a separator, add it to ranges
      if (this.chMap.get(s[p]) === this.C_SEP) {
        ranges.push(new TextRange(new Pos(line, p), new Pos(line, p + 1)));
        p++;
        continue;
      }
      // Otherwise, we need detect type first
      // Pass neutral characters
      let q = p;
      while (q < s.length && this.chMap.get(s[q]) === this.C_NEUTRAL) {
        q++;
      }
      const c = this.chMap.get(s[q]);
      if (c === this.C_SPECIAL || c === undefined) {
        // Gather more special characters / id
        while (
          q < s.length &&
          (this.chMap.get(s[q]) === c ||
            this.chMap.get(s[q]) === this.C_NEUTRAL)
        ) {
          q++;
        }
      }
      // Add range
      ranges.push(new TextRange(new Pos(line, p), new Pos(line, q)));
      p = q;
    }
    return ranges;
  }
}

export default Parser;
