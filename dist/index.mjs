#!/usr/bin/env node
import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/sisteransi@1.0.5/node_modules/sisteransi/src/index.js
var require_src = __commonJS({
  "node_modules/.pnpm/sisteransi@1.0.5/node_modules/sisteransi/src/index.js"(exports, module) {
    "use strict";
    var ESC2 = "\x1B";
    var CSI2 = `${ESC2}[`;
    var beep = "\x07";
    var cursor3 = {
      to(x, y2) {
        if (!y2) return `${CSI2}${x + 1}G`;
        return `${CSI2}${y2 + 1};${x + 1}H`;
      },
      move(x, y2) {
        let ret = "";
        if (x < 0) ret += `${CSI2}${-x}D`;
        else if (x > 0) ret += `${CSI2}${x}C`;
        if (y2 < 0) ret += `${CSI2}${-y2}A`;
        else if (y2 > 0) ret += `${CSI2}${y2}B`;
        return ret;
      },
      up: (count = 1) => `${CSI2}${count}A`,
      down: (count = 1) => `${CSI2}${count}B`,
      forward: (count = 1) => `${CSI2}${count}C`,
      backward: (count = 1) => `${CSI2}${count}D`,
      nextLine: (count = 1) => `${CSI2}E`.repeat(count),
      prevLine: (count = 1) => `${CSI2}F`.repeat(count),
      left: `${CSI2}G`,
      hide: `${CSI2}?25l`,
      show: `${CSI2}?25h`,
      save: `${ESC2}7`,
      restore: `${ESC2}8`
    };
    var scroll = {
      up: (count = 1) => `${CSI2}S`.repeat(count),
      down: (count = 1) => `${CSI2}T`.repeat(count)
    };
    var erase3 = {
      screen: `${CSI2}2J`,
      up: (count = 1) => `${CSI2}1J`.repeat(count),
      down: (count = 1) => `${CSI2}J`.repeat(count),
      line: `${CSI2}2K`,
      lineEnd: `${CSI2}K`,
      lineStart: `${CSI2}1K`,
      lines(count) {
        let clear = "";
        for (let i2 = 0; i2 < count; i2++)
          clear += this.line + (i2 < count - 1 ? cursor3.up() : "");
        if (count)
          clear += cursor3.left;
        return clear;
      }
    };
    module.exports = { cursor: cursor3, scroll, erase: erase3, beep };
  }
});

// src/index.ts
import { copyFileSync, existsSync, readdirSync as readdirSync2, rmSync } from "node:fs";
import { basename as basename2, join as join4, relative, resolve } from "node:path";

// node_modules/.pnpm/@clack+core@1.5.1/node_modules/@clack/core/dist/index.mjs
import { styleText } from "node:util";
import { stdout, stdin } from "node:process";
import * as l from "node:readline";
import l__default from "node:readline";

// node_modules/.pnpm/fast-string-truncated-width@3.0.3/node_modules/fast-string-truncated-width/dist/utils.js
var getCodePointsLength = /* @__PURE__ */ (() => {
  const SURROGATE_PAIR_RE = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return (input) => {
    let surrogatePairsNr = 0;
    SURROGATE_PAIR_RE.lastIndex = 0;
    while (SURROGATE_PAIR_RE.test(input)) {
      surrogatePairsNr += 1;
    }
    return input.length - surrogatePairsNr;
  };
})();
var isFullWidth = (x) => {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
};
var isWideNotCJKTNotEmoji = (x) => {
  return x === 8987 || x === 9001 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12771 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 19903 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
};

// node_modules/.pnpm/fast-string-truncated-width@3.0.3/node_modules/fast-string-truncated-width/dist/index.js
var ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]|\u001b\]8;[^;]*;.*?(?:\u0007|\u001b\u005c)/y;
var CONTROL_RE = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y;
var CJKT_WIDE_RE = /(?:(?![\uFF61-\uFF9F\uFF00-\uFFEF])[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Tangut}]){1,1000}/yu;
var TAB_RE = /\t{1,1000}/y;
var EMOJI_RE = new RegExp("[\\u{1F1E6}-\\u{1F1FF}]{2}|\\u{1F3F4}[\\u{E0061}-\\u{E007A}]{2}[\\u{E0030}-\\u{E0039}\\u{E0061}-\\u{E007A}]{1,3}\\u{E007F}|(?:\\p{Emoji}\\uFE0F\\u20E3?|\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|\\p{Emoji_Presentation})(?:\\u200D(?:\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|\\p{Emoji_Presentation}|\\p{Emoji}\\uFE0F\\u20E3?))*", "yu");
var LATIN_RE = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y;
var MODIFIER_RE = new RegExp("\\p{M}+", "gu");
var NO_TRUNCATION = { limit: Infinity, ellipsis: "" };
var getStringTruncatedWidth = (input, truncationOptions = {}, widthOptions = {}) => {
  const LIMIT = truncationOptions.limit ?? Infinity;
  const ELLIPSIS = truncationOptions.ellipsis ?? "";
  const ELLIPSIS_WIDTH = truncationOptions?.ellipsisWidth ?? (ELLIPSIS ? getStringTruncatedWidth(ELLIPSIS, NO_TRUNCATION, widthOptions).width : 0);
  const ANSI_WIDTH = 0;
  const CONTROL_WIDTH = widthOptions.controlWidth ?? 0;
  const TAB_WIDTH = widthOptions.tabWidth ?? 8;
  const EMOJI_WIDTH = widthOptions.emojiWidth ?? 2;
  const FULL_WIDTH_WIDTH = 2;
  const REGULAR_WIDTH = widthOptions.regularWidth ?? 1;
  const WIDE_WIDTH = widthOptions.wideWidth ?? FULL_WIDTH_WIDTH;
  const PARSE_BLOCKS = [
    [LATIN_RE, REGULAR_WIDTH],
    [ANSI_RE, ANSI_WIDTH],
    [CONTROL_RE, CONTROL_WIDTH],
    [TAB_RE, TAB_WIDTH],
    [EMOJI_RE, EMOJI_WIDTH],
    [CJKT_WIDE_RE, WIDE_WIDTH]
  ];
  let indexPrev = 0;
  let index = 0;
  let length = input.length;
  let lengthExtra = 0;
  let truncationEnabled = false;
  let truncationIndex = length;
  let truncationLimit = Math.max(0, LIMIT - ELLIPSIS_WIDTH);
  let unmatchedStart = 0;
  let unmatchedEnd = 0;
  let width = 0;
  let widthExtra = 0;
  outer: while (true) {
    if (unmatchedEnd > unmatchedStart || index >= length && index > indexPrev) {
      const unmatched = input.slice(unmatchedStart, unmatchedEnd) || input.slice(indexPrev, index);
      lengthExtra = 0;
      for (const char of unmatched.replaceAll(MODIFIER_RE, "")) {
        const codePoint = char.codePointAt(0) || 0;
        if (isFullWidth(codePoint)) {
          widthExtra = FULL_WIDTH_WIDTH;
        } else if (isWideNotCJKTNotEmoji(codePoint)) {
          widthExtra = WIDE_WIDTH;
        } else {
          widthExtra = REGULAR_WIDTH;
        }
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, Math.max(unmatchedStart, indexPrev) + lengthExtra);
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break outer;
        }
        lengthExtra += char.length;
        width += widthExtra;
      }
      unmatchedStart = unmatchedEnd = 0;
    }
    if (index >= length) {
      break outer;
    }
    for (let i2 = 0, l2 = PARSE_BLOCKS.length; i2 < l2; i2++) {
      const [BLOCK_RE, BLOCK_WIDTH] = PARSE_BLOCKS[i2];
      BLOCK_RE.lastIndex = index;
      if (BLOCK_RE.test(input)) {
        lengthExtra = BLOCK_RE === CJKT_WIDE_RE ? getCodePointsLength(input.slice(index, BLOCK_RE.lastIndex)) : BLOCK_RE === EMOJI_RE ? 1 : BLOCK_RE.lastIndex - index;
        widthExtra = lengthExtra * BLOCK_WIDTH;
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / BLOCK_WIDTH));
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break outer;
        }
        width += widthExtra;
        unmatchedStart = indexPrev;
        unmatchedEnd = index;
        index = indexPrev = BLOCK_RE.lastIndex;
        continue outer;
      }
    }
    index += 1;
  }
  return {
    width: truncationEnabled ? truncationLimit : width,
    index: truncationEnabled ? truncationIndex : length,
    truncated: truncationEnabled,
    ellipsed: truncationEnabled && LIMIT >= ELLIPSIS_WIDTH
  };
};
var dist_default = getStringTruncatedWidth;

// node_modules/.pnpm/fast-string-width@3.0.2/node_modules/fast-string-width/dist/index.js
var NO_TRUNCATION2 = {
  limit: Infinity,
  ellipsis: "",
  ellipsisWidth: 0
};
var fastStringWidth = (input, options = {}) => {
  return dist_default(input, NO_TRUNCATION2, options).width;
};
var dist_default2 = fastStringWidth;

// node_modules/.pnpm/fast-wrap-ansi@0.2.2/node_modules/fast-wrap-ansi/lib/main.js
var ESC = "\x1B";
var CSI = "\x9B";
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var GROUP_REGEX = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`, "y");
var getClosingCode = (openingCode) => {
  if (openingCode >= 30 && openingCode <= 37)
    return 39;
  if (openingCode >= 90 && openingCode <= 97)
    return 39;
  if (openingCode >= 40 && openingCode <= 47)
    return 49;
  if (openingCode >= 100 && openingCode <= 107)
    return 49;
  if (openingCode === 1 || openingCode === 2)
    return 22;
  if (openingCode === 3)
    return 23;
  if (openingCode === 4)
    return 24;
  if (openingCode === 7)
    return 27;
  if (openingCode === 8)
    return 28;
  if (openingCode === 9)
    return 29;
  if (openingCode === 0)
    return 0;
  return void 0;
};
var wrapAnsiCode = (code) => `${ESC}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url) => `${ESC}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
var wrapWord = (rows, word, columns) => {
  const characters = word[Symbol.iterator]();
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let lastRow = rows.at(-1);
  let visible = lastRow === void 0 ? 0 : dist_default2(lastRow);
  let currentCharacter = characters.next();
  let nextCharacter = characters.next();
  let rawCharacterIndex = 0;
  while (!currentCharacter.done) {
    const character = currentCharacter.value;
    const characterLength = dist_default2(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (character === ESC || character === CSI) {
      isInsideEscape = true;
      isInsideLinkEscape = word.startsWith(ANSI_ESCAPE_LINK, rawCharacterIndex + 1);
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
    } else {
      visible += characterLength;
      if (visible === columns && !nextCharacter.done) {
        rows.push("");
        visible = 0;
      }
    }
    currentCharacter = nextCharacter;
    nextCharacter = characters.next();
    rawCharacterIndex += character.length;
  }
  lastRow = rows.at(-1);
  if (!visible && lastRow !== void 0 && lastRow.length && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last) {
    if (dist_default2(words[last - 1])) {
      break;
    }
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
var exec = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const words = string.split(" ");
  let rows = [""];
  let rowLength = 0;
  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    if (options.trim !== false) {
      const row = rows.at(-1) ?? "";
      const trimmed = row.trimStart();
      if (row.length !== trimmed.length) {
        rows[rows.length - 1] = trimmed;
        rowLength = dist_default2(trimmed);
      }
    }
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    const wordLength = dist_default2(word);
    if (options.hard && wordLength > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((wordLength - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((wordLength - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    if (rowLength + wordLength > columns && rowLength && wordLength) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        rowLength = dist_default2(rows.at(-1) ?? "");
        continue;
      }
      rows.push("");
      rowLength = 0;
    }
    if (rowLength + wordLength > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    rows[rows.length - 1] += word;
    rowLength += wordLength;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join("\n");
  let inSurrogate = false;
  for (let i2 = 0; i2 < preString.length; i2++) {
    const character = preString[i2];
    returnValue += character;
    if (!inSurrogate) {
      inSurrogate = character >= "\uD800" && character <= "\uDBFF";
      if (inSurrogate) {
        continue;
      }
    } else {
      inSurrogate = false;
    }
    if (character === ESC || character === CSI) {
      GROUP_REGEX.lastIndex = i2 + 1;
      const groupsResult = GROUP_REGEX.exec(preString);
      const groups = groupsResult?.groups;
      if (groups?.code !== void 0) {
        const code = Number.parseFloat(groups.code);
        escapeCode = code === END_CODE ? void 0 : code;
      } else if (groups?.uri !== void 0) {
        escapeUrl = groups.uri.length === 0 ? void 0 : groups.uri;
      }
    }
    if (preString[i2 + 1] === "\n") {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      const closingCode = escapeCode ? getClosingCode(escapeCode) : void 0;
      if (escapeCode && closingCode) {
        returnValue += wrapAnsiCode(closingCode);
      }
    } else if (character === "\n") {
      if (escapeCode && getClosingCode(escapeCode)) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
  }
  return returnValue;
};
var CRLF_OR_LF = /\r?\n/;
function wrapAnsi(string, columns, options) {
  return String(string).normalize().split(CRLF_OR_LF).map((line) => exec(line, columns, options)).join("\n");
}

// node_modules/.pnpm/@clack+core@1.5.1/node_modules/@clack/core/dist/index.mjs
var import_sisteransi = __toESM(require_src(), 1);
import { ReadStream } from "node:tty";
function findCursor(s, o, l2) {
  if (!l2.some((r2) => !r2.disabled))
    return s;
  const t2 = s + o, n3 = Math.max(l2.length - 1, 0), e = t2 < 0 ? n3 : t2 > n3 ? 0 : t2;
  return l2[e]?.disabled ? findCursor(e, o < 0 ? -1 : 1, l2) : e;
}
var a$1 = ["up", "down", "left", "right", "space", "enter", "cancel"];
var t = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var settings = {
  actions: new Set(a$1),
  aliases: /* @__PURE__ */ new Map([
    // vim support
    ["k", "up"],
    ["j", "down"],
    ["h", "left"],
    ["l", "right"],
    ["", "cancel"],
    // opinionated defaults!
    ["escape", "cancel"]
  ]),
  messages: {
    cancel: "Canceled",
    error: "Something went wrong"
  },
  withGuide: true,
  accessible: void 0,
  date: {
    monthNames: [...t],
    messages: {
      required: "Please enter a valid date",
      invalidMonth: "There are only 12 months in a year",
      invalidDay: (n3, e) => `There are only ${n3} days in ${e}`,
      afterMin: (n3) => `Date must be on or after ${n3.toISOString().slice(0, 10)}`,
      beforeMax: (n3) => `Date must be on or before ${n3.toISOString().slice(0, 10)}`
    }
  }
};
function isAccessible(n3) {
  if (n3 !== void 0) return n3;
  if (settings.accessible !== void 0) return settings.accessible;
  const e = process.env.ACCESSIBLE;
  return e !== void 0 && e !== "" && e !== "0" && e !== "false";
}
function isActionKey(n3, e) {
  if (typeof n3 == "string")
    return settings.aliases.get(n3) === e;
  for (const s of n3)
    if (s !== void 0 && isActionKey(s, e))
      return true;
  return false;
}
function diffLines(i2, s) {
  if (i2 === s) return;
  const e = i2.split(`
`), t2 = s.split(`
`), r2 = Math.max(e.length, t2.length), f = [];
  for (let n3 = 0; n3 < r2; n3++)
    e[n3] !== t2[n3] && f.push(n3);
  return {
    lines: f,
    numLinesBefore: e.length,
    numLinesAfter: t2.length,
    numLines: r2
  };
}
var R = globalThis.process.platform.startsWith("win");
var CANCEL_SYMBOL = /* @__PURE__ */ Symbol("clack:cancel");
function isCancel(e) {
  return e === CANCEL_SYMBOL;
}
function setRawMode(e, r2) {
  const o = e;
  o.isTTY && o.setRawMode(r2);
}
function block({
  input: e = stdin,
  output: r2 = stdout,
  overwrite: o = true,
  hideCursor: n3 = true
} = {}) {
  const s = l.createInterface({
    input: e,
    output: r2,
    prompt: "",
    tabSize: 1
  });
  l.emitKeypressEvents(e, s), e instanceof ReadStream && e.isTTY && e.setRawMode(true);
  const t2 = (f, { name: a2, sequence: w }) => {
    const c2 = String(f);
    if (isActionKey([c2, a2, w], "cancel")) {
      n3 && r2.write(import_sisteransi.cursor.show), process.exit(0);
      return;
    }
    if (!o) return;
    const i2 = a2 === "return" ? 0 : -1, m2 = a2 === "return" ? -1 : 0;
    l.moveCursor(r2, i2, m2, () => {
      l.clearLine(r2, 1, () => {
        e.once("keypress", t2);
      });
    });
  };
  return n3 && r2.write(import_sisteransi.cursor.hide), e.once("keypress", t2), () => {
    e.off("keypress", t2), n3 && r2.write(import_sisteransi.cursor.show), e instanceof ReadStream && e.isTTY && !R && e.setRawMode(false), s.terminal = false, s.close();
  };
}
var getColumns = (e) => "columns" in e && typeof e.columns == "number" ? e.columns : 80;
var getRows = (e) => "rows" in e && typeof e.rows == "number" ? e.rows : 20;
function wrapTextWithPrefix(e, r2, o, n3 = o, s = o, t2) {
  const f = getColumns(e ?? stdout);
  return wrapAnsi(r2, f - o.length, {
    hard: true,
    trim: false
  }).split(`
`).map((c2, i2, m2) => {
    const d = t2 ? t2(c2, i2) : c2;
    return i2 === 0 ? `${n3}${d}` : i2 === m2.length - 1 ? `${s}${d}` : `${o}${d}`;
  }).join(`
`);
}
function runValidation(e, a2) {
  if ("~standard" in e) {
    const n3 = e["~standard"].validate(a2);
    return n3 instanceof Promise ? n3.then((r2) => r2.issues?.at(0)?.message) : n3.issues?.at(0)?.message;
  }
  return e(a2);
}
var y = class {
  input;
  output;
  _abortSignal;
  rl;
  opts;
  _render;
  _track = false;
  _prevFrame = "";
  _subscribers = /* @__PURE__ */ new Map();
  _cursor = 0;
  state = "initial";
  error = "";
  value;
  userInput = "";
  /**
   * Whether accessible (static, screen-reader friendly) output is enabled for
   * this prompt, resolved from the `accessible` option, the global setting,
   * and the `ACCESSIBLE` env var.
   */
  get accessible() {
    return isAccessible(this.opts.accessible);
  }
  constructor(t2, e = true) {
    const { input: i2 = stdin, output: s = stdout, render: r2, signal: n3, ...o } = t2;
    this.opts = o, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = r2.bind(this), this._track = e, this._abortSignal = n3, this.input = i2, this.output = s;
  }
  /**
   * Unsubscribe all listeners
   */
  unsubscribe() {
    this._subscribers.clear();
  }
  /**
   * Set a subscriber with opts
   * @param event - The event name
   */
  setSubscriber(t2, e) {
    const i2 = this._subscribers.get(t2) ?? [];
    i2.push(e), this._subscribers.set(t2, i2);
  }
  /**
   * Subscribe to an event
   * @param event - The event name
   * @param cb - The callback
   */
  on(t2, e) {
    this.setSubscriber(t2, { cb: e });
  }
  /**
   * Subscribe to an event once
   * @param event - The event name
   * @param cb - The callback
   */
  once(t2, e) {
    this.setSubscriber(t2, { cb: e, once: true });
  }
  /**
   * Emit an event with data
   * @param event - The event name
   * @param data - The data to pass to the callback
   */
  emit(t2, ...e) {
    const i2 = this._subscribers.get(t2) ?? [], s = [];
    for (const r2 of i2)
      r2.cb(...e), r2.once && s.push(() => i2.splice(i2.indexOf(r2), 1));
    for (const r2 of s)
      r2();
  }
  prompt() {
    return new Promise((t2) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted)
          return this.state = "cancel", this.close(), t2(CANCEL_SYMBOL);
        this._abortSignal.addEventListener(
          "abort",
          () => {
            this.state = "cancel", this.close();
          },
          { once: true }
        );
      }
      this.rl = l__default.createInterface({
        input: this.input,
        tabSize: 2,
        prompt: "",
        escapeCodeTimeout: 50,
        terminal: true
      }), this.rl.prompt(), this.opts.initialUserInput !== void 0 && this._setUserInput(this.opts.initialUserInput, true), this.input.on("keypress", this.onKeypress), setRawMode(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), setRawMode(this.input, false), t2(this.value);
      }), this.once("cancel", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), setRawMode(this.input, false), t2(CANCEL_SYMBOL);
      });
    });
  }
  _isActionKey(t2, e) {
    return t2 === "	";
  }
  _shouldSubmit(t2, e) {
    return true;
  }
  _setValue(t2) {
    this.value = t2, this.emit("value", this.value);
  }
  _setUserInput(t2, e) {
    this.userInput = t2 ?? "", this.emit("userInput", this.userInput), e && this._track && this.rl && (this.rl.write(this.userInput), this._cursor = this.rl.cursor);
  }
  _clearUserInput() {
    this.rl?.write(null, { ctrl: true, name: "u" }), this._setUserInput("");
  }
  async onKeypress(t2, e) {
    if (this.state !== "validating") {
      if (this._track && e.name !== "return" && (e.name && this._isActionKey(t2, e) && this.rl?.write(null, { ctrl: true, name: "h" }), this._cursor = this.rl?.cursor ?? 0, this._setUserInput(this.rl?.line)), this.state === "error" && (this.state = "active"), e?.name && (!this._track && settings.aliases.has(e.name) && this.emit("cursor", settings.aliases.get(e.name)), settings.actions.has(e.name) && this.emit("cursor", e.name)), t2 && (t2.toLowerCase() === "y" || t2.toLowerCase() === "n") && this.emit("confirm", t2.toLowerCase() === "y"), this.emit("key", t2, e), e?.name === "return" && this._shouldSubmit(t2, e)) {
        if (this.opts.validate) {
          const i2 = runValidation(this.opts.validate, this.value);
          let s;
          i2 instanceof Promise ? (this.state = "validating", this.render(), s = await i2) : s = i2, s && (this.error = s instanceof Error ? s.message : s, this.state = "error", this.rl?.write(this.userInput));
        }
        this.state !== "error" && (this.state = "submit");
      }
      isActionKey([t2, e?.name, e?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
    }
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), setRawMode(this.input, false), this.rl?.close(), this.rl = void 0, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const t2 = wrapAnsi(this._prevFrame, process.stdout.columns, { hard: true, trim: false }).split(`
`).length - 1;
    this.output.write(import_sisteransi.cursor.move(-999, t2 * -1));
  }
  render() {
    const t2 = wrapAnsi(this._render(this) ?? "", process.stdout.columns, {
      hard: true,
      trim: false
    });
    if (t2 !== this._prevFrame) {
      if (this.state === "initial")
        this.output.write(import_sisteransi.cursor.hide);
      else {
        const e = diffLines(this._prevFrame, t2), i2 = getRows(this.output);
        if (this.restoreCursor(), e) {
          const s = Math.max(0, e.numLinesAfter - i2), r2 = Math.max(0, e.numLinesBefore - i2);
          let n3 = e.lines.find((o) => o >= s);
          if (n3 === void 0) {
            this._prevFrame = t2;
            return;
          }
          if (e.lines.length === 1) {
            this.output.write(import_sisteransi.cursor.move(0, n3 - r2)), this.output.write(import_sisteransi.erase.lines(1));
            const o = t2.split(`
`);
            this.output.write(o[n3]), this._prevFrame = t2, this.output.write(import_sisteransi.cursor.move(0, o.length - n3 - 1));
            return;
          } else if (e.lines.length > 1) {
            if (s < r2)
              n3 = s;
            else {
              const h2 = n3 - r2;
              h2 > 0 && this.output.write(import_sisteransi.cursor.move(0, h2));
            }
            this.output.write(import_sisteransi.erase.down());
            const f = t2.split(`
`).slice(n3);
            this.output.write(f.join(`
`)), this._prevFrame = t2;
            return;
          }
        }
        this.output.write(import_sisteransi.erase.down());
      }
      this.output.write(t2), this.state === "initial" && (this.state = "active"), this._prevFrame = t2;
    }
  }
};
var r = class extends y {
  get cursor() {
    return this.value ? 0 : 1;
  }
  get _value() {
    return this.cursor === 0;
  }
  constructor(t2) {
    super(t2, false), this.value = !!t2.initialValue, this.on("userInput", () => {
      this.value = this._value;
    }), this.on("confirm", (i2) => {
      this.output.write(import_sisteransi.cursor.move(0, -1)), this.value = i2, this.state = "submit", this.close();
    }), this.on("cursor", () => {
      this.value = !this.value;
    });
  }
};
var a = class extends y {
  options;
  cursor = 0;
  get _value() {
    return this.options[this.cursor]?.value;
  }
  get _enabledOptions() {
    return this.options.filter((e) => e.disabled !== true);
  }
  toggleAll() {
    const e = this._enabledOptions, i2 = this.value !== void 0 && this.value.length === e.length;
    this.value = i2 ? [] : e.map((t2) => t2.value);
  }
  toggleInvert() {
    const e = this.value;
    if (!e)
      return;
    const i2 = this._enabledOptions.filter((t2) => !e.includes(t2.value));
    this.value = i2.map((t2) => t2.value);
  }
  toggleValue() {
    this.value === void 0 && (this.value = []);
    const e = this.value.includes(this._value);
    this.value = e ? this.value.filter((i2) => i2 !== this._value) : [...this.value, this._value];
  }
  constructor(e) {
    super(e, false), this.options = e.options, this.value = [...e.initialValues ?? []];
    const i2 = Math.max(
      this.options.findIndex(({ value: t2 }) => t2 === e.cursorAt),
      0
    );
    this.cursor = this.options[i2]?.disabled ? findCursor(i2, 1, this.options) : i2, this.on("key", (t2, l2) => {
      l2.name === "a" && this.toggleAll(), l2.name === "i" && this.toggleInvert();
    }), this.on("cursor", (t2) => {
      switch (t2) {
        case "left":
        case "up":
          this.cursor = findCursor(this.cursor, -1, this.options);
          break;
        case "down":
        case "right":
          this.cursor = findCursor(this.cursor, 1, this.options);
          break;
        case "space":
          this.toggleValue();
          break;
      }
    });
  }
};
var n$1 = class n extends y {
  options;
  cursor = 0;
  get _selectedValue() {
    return this.options[this.cursor];
  }
  changeValue() {
    const e = this._selectedValue;
    this.value = e === void 0 ? void 0 : e.value;
  }
  constructor(e) {
    super(e, false), this.options = e.options;
    const o = this.options.findIndex(({ value: s }) => s === e.initialValue), t2 = o === -1 ? 0 : o;
    this.cursor = this.options[t2]?.disabled ? findCursor(t2, 1, this.options) : t2, this.changeValue(), this.on("cursor", (s) => {
      switch (s) {
        case "left":
        case "up":
          this.cursor = findCursor(this.cursor, -1, this.options);
          break;
        case "down":
        case "right":
          this.cursor = findCursor(this.cursor, 1, this.options);
          break;
      }
      this.changeValue();
    });
  }
};
var n2 = class extends y {
  get userInputWithCursor() {
    if (this.state === "submit")
      return this.userInput;
    const t2 = this.userInput;
    if (this.cursor >= t2.length)
      return `${this.userInput}\u2588`;
    const r2 = t2.slice(0, this.cursor), s = t2.slice(this.cursor, this.cursor + 1), e = t2.slice(this.cursor + 1);
    return `${r2}${styleText("inverse", s)}${e}`;
  }
  get cursor() {
    return this._cursor;
  }
  constructor(t2) {
    super({
      ...t2,
      initialUserInput: t2.initialUserInput ?? t2.initialValue
    }), this.on("userInput", (r2) => {
      this._setValue(r2);
    }), this.on("finalize", () => {
      this.value || (this.value = t2.defaultValue), this.value === void 0 && (this.value = "");
    });
  }
};

// node_modules/.pnpm/@clack+prompts@1.8.1/node_modules/@clack/prompts/dist/index.mjs
import { styleText as styleText2, stripVTControlCharacters } from "node:util";
import process$1 from "node:process";
var import_sisteransi2 = __toESM(require_src(), 1);
function isUnicodeSupported() {
  if (process$1.platform !== "win32") {
    return process$1.env.TERM !== "linux";
  }
  return Boolean(process$1.env.CI) || Boolean(process$1.env.WT_SESSION) || Boolean(process$1.env.TERMINUS_SUBLIME) || process$1.env.ConEmuTask === "{cmd::Cmder}" || process$1.env.TERM_PROGRAM === "Terminus-Sublime" || process$1.env.TERM_PROGRAM === "vscode" || process$1.env.TERM === "xterm-256color" || process$1.env.TERM === "alacritty" || process$1.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
var unicode = isUnicodeSupported();
var isCI = () => process.env.CI === "true";
var unicodeOr = (o, e) => unicode ? o : e;
var S_STEP_ACTIVE = unicodeOr("\u25C6", "*");
var S_STEP_CANCEL = unicodeOr("\u25A0", "x");
var S_STEP_ERROR = unicodeOr("\u25B2", "x");
var S_STEP_SUBMIT = unicodeOr("\u25C7", "o");
var S_BAR_START = unicodeOr("\u250C", "T");
var S_BAR = unicodeOr("\u2502", "|");
var S_BAR_END = unicodeOr("\u2514", "\u2014");
var S_BAR_START_RIGHT = unicodeOr("\u2510", "T");
var S_BAR_END_RIGHT = unicodeOr("\u2518", "\u2014");
var S_RADIO_ACTIVE = unicodeOr("\u25CF", ">");
var S_RADIO_INACTIVE = unicodeOr("\u25CB", " ");
var S_CHECKBOX_ACTIVE = unicodeOr("\u25FB", "[\u2022]");
var S_CHECKBOX_SELECTED = unicodeOr("\u25FC", "[+]");
var S_CHECKBOX_INACTIVE = unicodeOr("\u25FB", "[ ]");
var S_PASSWORD_MASK = unicodeOr("\u25AA", "\u2022");
var S_BAR_H = unicodeOr("\u2500", "-");
var S_CORNER_TOP_RIGHT = unicodeOr("\u256E", "+");
var S_CONNECT_LEFT = unicodeOr("\u251C", "+");
var S_CORNER_BOTTOM_RIGHT = unicodeOr("\u256F", "+");
var S_CORNER_BOTTOM_LEFT = unicodeOr("\u2570", "+");
var S_CORNER_TOP_LEFT = unicodeOr("\u256D", "+");
var S_INFO = unicodeOr("\u25CF", "\u2022");
var S_SUCCESS = unicodeOr("\u25C6", "*");
var S_WARN = unicodeOr("\u25B2", "!");
var S_ERROR = unicodeOr("\u25A0", "x");
var symbol = (o) => {
  switch (o) {
    case "initial":
    case "active":
      return styleText2("cyan", S_STEP_ACTIVE);
    case "cancel":
      return styleText2("red", S_STEP_CANCEL);
    case "error":
      return styleText2("yellow", S_STEP_ERROR);
    case "submit":
      return styleText2("green", S_STEP_SUBMIT);
    case "validating":
      return styleText2("dim", S_STEP_ACTIVE);
  }
};
var symbolBar = (o) => {
  switch (o) {
    case "initial":
    case "active":
      return styleText2("cyan", S_BAR);
    case "cancel":
      return styleText2("red", S_BAR);
    case "error":
      return styleText2("yellow", S_BAR);
    case "submit":
      return styleText2("green", S_BAR);
  }
};
function formatInstructionFooter(o, e) {
  const r2 = [`${e ? `${styleText2("cyan", S_BAR)}  ` : ""}${o.join(" \u2022 ")}`];
  return e && r2.push(styleText2("cyan", S_BAR_END)), r2;
}
var I = (l2, e, w, p, b, C2 = false) => {
  let r2 = e, O = 0;
  if (C2)
    for (let i2 = p - 1; i2 >= w; i2--) {
      const m2 = l2[i2];
      if (m2 && (r2 -= m2.length), O++, r2 <= b) break;
    }
  else
    for (let i2 = w; i2 < p; i2++) {
      const m2 = l2[i2];
      if (m2 && (r2 -= m2.length), O++, r2 <= b) break;
    }
  return { lineCount: r2, removals: O };
};
var limitOptions = ({
  cursor: l2,
  options: e,
  style: w,
  output: p = process.stdout,
  maxItems: b = Number.POSITIVE_INFINITY,
  columnPadding: C2 = 0,
  rowPadding: r2 = 4
}) => {
  const i2 = getColumns(p) - C2, m2 = getRows(p), M = styleText2("dim", "..."), v = Math.max(m2 - r2, 0), a2 = Math.max(Math.min(b, v), 5);
  let f = 0;
  l2 >= a2 - 3 && (f = Math.max(
    Math.min(l2 - a2 + 3, e.length - a2),
    0
  ));
  let d = a2 < e.length && f > 0, c2 = a2 < e.length && f + a2 < e.length;
  const W2 = Math.min(
    f + a2,
    e.length
  ), s = [];
  let g = 0;
  d && g++, c2 && g++;
  const T = f + (d ? 1 : 0), y2 = W2 - (c2 ? 1 : 0);
  for (let t2 = T; t2 < y2; t2++) {
    const n3 = e[t2], o = n3 ? w(n3, t2 === l2) : "", h2 = wrapAnsi(o, i2, {
      hard: true,
      trim: false
    }).split(`
`);
    s.push(h2), g += h2.length;
  }
  if (g > v) {
    let t2 = 0, n3 = 0, o = g;
    const h2 = l2 - T;
    let u3 = v;
    const L = () => I(s, o, 0, h2, u3), E = () => I(
      s,
      o,
      h2 + 1,
      s.length,
      u3,
      true
    );
    d ? ({ lineCount: o, removals: t2 } = L(), o > u3 && (c2 || (u3 -= 1), { lineCount: o, removals: n3 } = E())) : (c2 || (u3 -= 1), { lineCount: o, removals: n3 } = E(), o > u3 && (u3 -= 1, { lineCount: o, removals: t2 } = L())), t2 > 0 && (d = true, s.splice(0, t2)), n3 > 0 && (c2 = true, s.splice(s.length - n3, n3));
  }
  const x = [];
  d && x.push(M);
  for (const t2 of s)
    for (const n3 of t2)
      x.push(n3);
  return c2 && x.push(M), x;
};
var confirm = (e) => {
  const a2 = e.active ?? "Yes", o = e.inactive ?? "No";
  return new r({
    active: a2,
    inactive: o,
    signal: e.signal,
    input: e.input,
    output: e.output,
    initialValue: e.initialValue ?? true,
    render() {
      const i2 = e.withGuide ?? settings.withGuide, u3 = `${symbol(this.state)}  `, l2 = i2 ? `${styleText2("gray", S_BAR)}  ` : "", f = wrapTextWithPrefix(
        e.output,
        e.message,
        l2,
        u3
      ), s = `${i2 ? `${styleText2("gray", S_BAR)}
` : ""}${f}
`, c2 = this.value ? a2 : o;
      switch (this.state) {
        case "submit": {
          const r2 = i2 ? `${styleText2("gray", S_BAR)}  ` : "";
          return `${s}${r2}${styleText2("dim", c2)}`;
        }
        case "cancel": {
          const r2 = i2 ? `${styleText2("gray", S_BAR)}  ` : "";
          return `${s}${r2}${styleText2(["strikethrough", "dim"], c2)}${i2 ? `
${styleText2("gray", S_BAR)}` : ""}`;
        }
        default: {
          const r2 = i2 ? `${styleText2("cyan", S_BAR)}  ` : "", g = i2 ? styleText2("cyan", S_BAR_END) : "";
          return `${s}${r2}${this.value ? `${styleText2("green", S_RADIO_ACTIVE)} ${a2}` : `${styleText2("dim", S_RADIO_INACTIVE)} ${styleText2("dim", a2)}`}${e.vertical ? i2 ? `
${styleText2("cyan", S_BAR)}  ` : `
` : ` ${styleText2("dim", "/")} `}${this.value ? `${styleText2("dim", S_RADIO_INACTIVE)} ${styleText2("dim", o)}` : `${styleText2("green", S_RADIO_ACTIVE)} ${o}`}
${g}
`;
        }
      }
    }
  }).prompt();
};
var MULTISELECT_INSTRUCTIONS = [
  `${styleText2("dim", "\u2191/\u2193")} to navigate`,
  `${styleText2("dim", "Space:")} select`,
  `${styleText2("dim", "Enter:")} confirm`
];
var m = (i2, u3) => i2.split(`
`).map((d) => u3(d)).join(`
`);
var multiselect = (i2) => {
  const u3 = (t2, a2) => {
    const r2 = t2.label ?? String(t2.value);
    return a2 === "disabled" ? `${styleText2("gray", S_CHECKBOX_INACTIVE)} ${m(r2, (o) => styleText2(["strikethrough", "gray"], o))}${t2.hint ? ` ${styleText2("dim", `(${t2.hint ?? "disabled"})`)}` : ""}` : a2 === "active" ? `${styleText2("cyan", S_CHECKBOX_ACTIVE)} ${r2}${t2.hint ? ` ${styleText2("dim", `(${t2.hint})`)}` : ""}` : a2 === "selected" ? `${styleText2("green", S_CHECKBOX_SELECTED)} ${m(r2, (o) => styleText2("dim", o))}${t2.hint ? ` ${styleText2("dim", `(${t2.hint})`)}` : ""}` : a2 === "cancelled" ? `${m(r2, (o) => styleText2(["strikethrough", "dim"], o))}` : a2 === "active-selected" ? `${styleText2("green", S_CHECKBOX_SELECTED)} ${r2}${t2.hint ? ` ${styleText2("dim", `(${t2.hint})`)}` : ""}` : a2 === "submitted" ? `${m(r2, (o) => styleText2("dim", o))}` : `${styleText2("dim", S_CHECKBOX_INACTIVE)} ${m(r2, (o) => styleText2("dim", o))}`;
  }, d = i2.required ?? true, x = i2.showInstructions ?? true;
  return new a({
    options: i2.options,
    signal: i2.signal,
    input: i2.input,
    output: i2.output,
    initialValues: i2.initialValues,
    required: d,
    cursorAt: i2.cursorAt,
    validate(t2) {
      if (d && (t2 === void 0 || t2.length === 0))
        return `Please select at least one option.
${styleText2(
          "reset",
          styleText2(
            "dim",
            `Press ${styleText2(["gray", "bgWhite", "inverse"], " space ")} to select, ${styleText2(
              "gray",
              styleText2("bgWhite", styleText2("inverse", " enter "))
            )} to submit`
          )
        )}`;
    },
    render() {
      const t2 = i2.withGuide ?? settings.withGuide, a2 = wrapTextWithPrefix(
        i2.output,
        i2.message,
        t2 ? `${symbolBar(this.state)}  ` : "",
        `${symbol(this.state)}  `
      ), r2 = `${t2 ? `${styleText2("gray", S_BAR)}
` : ""}${a2}
`, o = this.value ?? [], g = (n3, l2) => {
        if (n3.disabled)
          return u3(n3, "disabled");
        const s = o.includes(n3.value);
        return l2 && s ? u3(n3, "active-selected") : s ? u3(n3, "selected") : u3(n3, l2 ? "active" : "inactive");
      };
      switch (this.state) {
        case "submit": {
          const n3 = this.options.filter(({ value: s }) => o.includes(s)).map((s) => u3(s, "submitted")).join(styleText2("dim", ", ")) || styleText2("dim", "none"), l2 = wrapTextWithPrefix(
            i2.output,
            n3,
            t2 ? `${styleText2("gray", S_BAR)}  ` : ""
          );
          return `${r2}${l2}`;
        }
        case "cancel": {
          const n3 = this.options.filter(({ value: s }) => o.includes(s)).map((s) => u3(s, "cancelled")).join(styleText2("dim", ", "));
          if (n3.trim() === "")
            return `${r2}${styleText2("gray", S_BAR)}`;
          const l2 = wrapTextWithPrefix(
            i2.output,
            n3,
            t2 ? `${styleText2("gray", S_BAR)}  ` : ""
          );
          return `${r2}${l2}${t2 ? `
${styleText2("gray", S_BAR)}` : ""}`;
        }
        case "error": {
          const n3 = t2 ? `${styleText2("yellow", S_BAR)}  ` : "", l2 = this.error.split(`
`).map(
            ($, v) => v === 0 ? `${t2 ? `${styleText2("yellow", S_BAR_END)}  ` : ""}${styleText2("yellow", $)}` : `   ${$}`
          ).join(`
`), s = r2.split(`
`).length, h2 = l2.split(`
`).length + 1;
          return `${r2}${n3}${limitOptions({
            output: i2.output,
            options: this.options,
            cursor: this.cursor,
            maxItems: i2.maxItems,
            columnPadding: n3.length,
            rowPadding: s + h2,
            style: g
          }).join(`
${n3}`)}
${l2}
`;
        }
        default: {
          const n3 = t2 ? `${styleText2("cyan", S_BAR)}  ` : "", l2 = r2.split(`
`).length, s = x ? formatInstructionFooter(MULTISELECT_INSTRUCTIONS, t2) : t2 ? [styleText2("cyan", S_BAR_END)] : [], h2 = s.join(`
`), $ = s.length + 1;
          return `${r2}${n3}${limitOptions({
            output: i2.output,
            options: this.options,
            cursor: this.cursor,
            maxItems: i2.maxItems,
            columnPadding: n3.length,
            rowPadding: l2 + $,
            style: g
          }).join(`
${n3}`)}
${h2}
`;
        }
      }
    }
  }).prompt();
};
var log = {
  message: (s = [], {
    symbol: e = styleText2("gray", S_BAR),
    secondarySymbol: r2 = styleText2("gray", S_BAR),
    output: m2 = process.stdout,
    spacing: l2 = 1,
    withGuide: c2
  } = {}) => {
    const t2 = [], o = c2 ?? settings.withGuide, f = o ? r2 : "", O = o ? `${e}  ` : "", u3 = o ? `${r2}  ` : "";
    for (let i2 = 0; i2 < l2; i2++)
      t2.push(f);
    const g = Array.isArray(s) ? s : s.split(`
`);
    if (g.length > 0) {
      const [i2, ...y2] = g;
      i2.length > 0 ? t2.push(`${O}${i2}`) : t2.push(o ? e : "");
      for (const p of y2)
        p.length > 0 ? t2.push(`${u3}${p}`) : t2.push(o ? r2 : "");
    }
    m2.write(`${t2.join(`
`)}
`);
  },
  info: (s, e) => {
    log.message(s, { ...e, symbol: styleText2("blue", S_INFO) });
  },
  success: (s, e) => {
    log.message(s, { ...e, symbol: styleText2("green", S_SUCCESS) });
  },
  step: (s, e) => {
    log.message(s, { ...e, symbol: styleText2("green", S_STEP_SUBMIT) });
  },
  warn: (s, e) => {
    log.message(s, { ...e, symbol: styleText2("yellow", S_WARN) });
  },
  /** alias for `log.warn()`. */
  warning: (s, e) => {
    log.warn(s, e);
  },
  error: (s, e) => {
    log.message(s, { ...e, symbol: styleText2("red", S_ERROR) });
  }
};
var cancel = (o = "", t2) => {
  const i2 = t2?.output ?? process.stdout, e = t2?.withGuide ?? settings.withGuide ? `${styleText2("gray", S_BAR_END)}  ` : "";
  i2.write(`${e}${styleText2("red", o)}

`);
};
var intro = (o = "", t2) => {
  const i2 = t2?.output ?? process.stdout, e = t2?.withGuide ?? settings.withGuide ? `${styleText2("gray", S_BAR_START)}  ` : "";
  i2.write(`${e}${o}
`);
};
var outro = (o = "", t2) => {
  const i2 = t2?.output ?? process.stdout, e = t2?.withGuide ?? settings.withGuide ? `${styleText2("gray", S_BAR)}
${styleText2("gray", S_BAR_END)}  ` : "";
  i2.write(`${e}${o}

`);
};
var W$1 = (o) => o;
var C = (o, e, s) => {
  const a2 = {
    hard: true,
    trim: false
  }, i2 = wrapAnsi(o, e, a2).split(`
`), c2 = i2.reduce((n3, t2) => Math.max(dist_default2(t2), n3), 0), u3 = i2.map(s).reduce((n3, t2) => Math.max(dist_default2(t2), n3), 0), g = e - (u3 - c2);
  return wrapAnsi(o, g, a2);
};
var note = (o = "", e = "", s) => {
  const a2 = s?.output ?? process$1.stdout, i2 = s?.withGuide ?? settings.withGuide, c2 = s?.format ?? W$1, g = ["", ...C(o, getColumns(a2) - 6, c2).split(`
`).map(c2), ""], n3 = dist_default2(e), t2 = Math.max(
    g.reduce((m2, F) => {
      const O = dist_default2(F);
      return O > m2 ? O : m2;
    }, 0),
    n3
  ) + 2, h2 = g.map(
    (m2) => `${styleText2("gray", S_BAR)}  ${m2}${" ".repeat(t2 - dist_default2(m2))}${styleText2("gray", S_BAR)}`
  ).join(`
`), T = i2 ? `${styleText2("gray", S_BAR)}
` : "", l$1 = i2 ? S_CONNECT_LEFT : S_CORNER_BOTTOM_LEFT;
  a2.write(
    `${T}${styleText2("green", S_STEP_SUBMIT)}  ${styleText2("reset", e)} ${styleText2(
      "gray",
      S_BAR_H.repeat(Math.max(t2 - n3 - 1, 1)) + S_CORNER_TOP_RIGHT
    )}
${h2}
${styleText2("gray", l$1 + S_BAR_H.repeat(t2 + 2) + S_CORNER_BOTTOM_RIGHT)}
`
  );
};
var W = (l2) => styleText2("magenta", l2);
var spinner = ({
  indicator: l2 = "dots",
  onCancel: h2,
  output: n3 = process.stdout,
  cancelMessage: G,
  errorMessage: O,
  frames: E = unicode ? ["\u25D2", "\u25D0", "\u25D3", "\u25D1"] : ["\u2022", "o", "O", "0"],
  delay: F = unicode ? 80 : 120,
  signal: m2,
  ...I2
} = {}) => {
  const u3 = isCI();
  let M, T, d = false, S = false, s = "", p, w = performance.now();
  const x = getColumns(n3), k = I2?.styleFrame ?? W, g = (e) => {
    const r2 = e > 1 ? O ?? settings.messages.error : G ?? settings.messages.cancel;
    S = e === 1, d && (a2(r2, e), S && typeof h2 == "function" && h2());
  }, f = () => g(2), i2 = () => g(1), A = () => {
    process.on("uncaughtExceptionMonitor", f), process.on("unhandledRejection", f), process.on("SIGINT", i2), process.on("SIGTERM", i2), process.on("exit", g), m2 && m2.addEventListener("abort", i2);
  }, H = () => {
    process.removeListener("uncaughtExceptionMonitor", f), process.removeListener("unhandledRejection", f), process.removeListener("SIGINT", i2), process.removeListener("SIGTERM", i2), process.removeListener("exit", g), m2 && m2.removeEventListener("abort", i2);
  }, y2 = () => {
    if (p === void 0) return;
    u3 && n3.write(`
`);
    const r2 = wrapAnsi(p, x, {
      hard: true,
      trim: false
    }).split(`
`);
    r2.length > 1 && n3.write(import_sisteransi2.cursor.up(r2.length - 1)), n3.write(import_sisteransi2.cursor.to(0)), n3.write(import_sisteransi2.erase.down());
  }, C2 = (e) => e.replace(/\.+$/, ""), _2 = (e) => {
    const r2 = (performance.now() - e) / 1e3, t2 = Math.floor(r2 / 60), o = Math.floor(r2 % 60);
    return t2 > 0 ? `[${t2}m ${o}s]` : `[${o}s]`;
  }, N = I2.withGuide ?? settings.withGuide, P = (e = "") => {
    d = true, M = block({ output: n3 }), s = C2(e), w = performance.now(), N && n3.write(`${styleText2("gray", S_BAR)}
`);
    let r2 = 0, t2 = 0;
    A(), T = setInterval(() => {
      if (u3 && s === p)
        return;
      y2(), p = s;
      const o = k(E[r2]);
      let v;
      if (u3)
        v = `${o}  ${s}...`;
      else if (l2 === "timer")
        v = `${o}  ${s} ${_2(w)}`;
      else {
        const B = ".".repeat(Math.floor(t2)).slice(0, 3);
        v = `${o}  ${s}${B}`;
      }
      const j = wrapAnsi(v, x, {
        hard: true,
        trim: false
      });
      n3.write(j), r2 = r2 + 1 < E.length ? r2 + 1 : 0, t2 = t2 < 4 ? t2 + 0.125 : 0;
    }, F);
  }, a2 = (e = "", r2 = 0, t2 = false) => {
    if (!d) return;
    d = false, clearInterval(T), y2();
    const o = r2 === 0 ? styleText2("green", S_STEP_SUBMIT) : r2 === 1 ? styleText2("red", S_STEP_CANCEL) : styleText2("red", S_STEP_ERROR);
    s = e ?? s, t2 || (l2 === "timer" ? n3.write(`${o}  ${s} ${_2(w)}
`) : n3.write(`${o}  ${s}
`)), H(), M();
  };
  return {
    start: P,
    stop: (e = "") => a2(e, 0),
    message: (e = "") => {
      s = C2(e ?? s);
    },
    cancel: (e = "") => a2(e, 1),
    error: (e = "") => a2(e, 2),
    clear: () => a2("", 0, true),
    get isCancelled() {
      return S;
    }
  };
};
var u2 = {
  light: unicodeOr("\u2500", "-"),
  heavy: unicodeOr("\u2501", "="),
  block: unicodeOr("\u2588", "#")
};
var SELECT_INSTRUCTIONS = [
  `${styleText2("dim", "\u2191/\u2193")} to navigate`,
  `${styleText2("dim", "Enter:")} confirm`
];
var c = (t2, o) => t2.includes(`
`) ? t2.split(`
`).map((d) => o(d)).join(`
`) : o(t2);
var select = (t2) => {
  const o = (n3, m2) => {
    if (n3 === void 0)
      return "";
    const s = n3.label ?? String(n3.value);
    switch (m2) {
      case "disabled":
        return `${styleText2("gray", S_RADIO_INACTIVE)} ${c(s, (i2) => styleText2("gray", i2))}${n3.hint ? ` ${styleText2("dim", `(${n3.hint ?? "disabled"})`)}` : ""}`;
      case "selected":
        return `${c(s, (i2) => styleText2("dim", i2))}`;
      case "active":
        return `${styleText2("green", S_RADIO_ACTIVE)} ${s}${n3.hint ? ` ${styleText2("dim", `(${n3.hint})`)}` : ""}`;
      case "cancelled":
        return `${c(s, (i2) => styleText2(["strikethrough", "dim"], i2))}`;
      default:
        return `${styleText2("dim", S_RADIO_INACTIVE)} ${c(s, (i2) => styleText2("dim", i2))}`;
    }
  }, d = t2.showInstructions ?? true;
  return new n$1({
    options: t2.options,
    signal: t2.signal,
    input: t2.input,
    output: t2.output,
    initialValue: t2.initialValue,
    render() {
      const n3 = t2.withGuide ?? settings.withGuide, m2 = `${symbol(this.state)}  `, s = `${symbolBar(this.state)}  `, i2 = wrapTextWithPrefix(
        t2.output,
        t2.message,
        s,
        m2
      ), u3 = `${n3 ? `${styleText2("gray", S_BAR)}
` : ""}${i2}
`;
      switch (this.state) {
        case "submit": {
          const r2 = n3 ? `${styleText2("gray", S_BAR)}  ` : "", a2 = wrapTextWithPrefix(
            t2.output,
            o(this.options[this.cursor], "selected"),
            r2
          );
          return `${u3}${a2}`;
        }
        case "cancel": {
          const r2 = n3 ? `${styleText2("gray", S_BAR)}  ` : "", a2 = wrapTextWithPrefix(
            t2.output,
            o(this.options[this.cursor], "cancelled"),
            r2
          );
          return `${u3}${a2}${n3 ? `
${styleText2("gray", S_BAR)}` : ""}`;
        }
        default: {
          const r2 = n3 ? `${styleText2("cyan", S_BAR)}  ` : "", a2 = u3.split(`
`).length, p = d ? formatInstructionFooter(SELECT_INSTRUCTIONS, n3) : n3 ? [styleText2("cyan", S_BAR_END)] : [], f = p.join(`
`), b = p.length + 1;
          return `${u3}${r2}${limitOptions({
            output: t2.output,
            cursor: this.cursor,
            options: this.options,
            maxItems: t2.maxItems,
            columnPadding: r2.length,
            rowPadding: a2 + b,
            style: (g, x) => o(g, g.disabled ? "disabled" : x ? "active" : "inactive")
          }).join(`
${r2}`)}
${f}
`;
        }
      }
    }
  }).prompt();
};
var i = `${styleText2("gray", S_BAR)}  `;
var text = (t2) => new n2({
  validate: t2.validate,
  placeholder: t2.placeholder,
  defaultValue: t2.defaultValue,
  initialValue: t2.initialValue,
  output: t2.output,
  signal: t2.signal,
  input: t2.input,
  render() {
    const r2 = t2?.withGuide ?? settings.withGuide, l2 = `${`${r2 ? `${styleText2("gray", S_BAR)}
` : ""}${symbol(this.state)}  `}${t2.message}
`, d = t2.placeholder && t2.placeholder.length > 0 ? (
      // biome-ignore lint/style/noNonNullAssertion: guarded by placeholder.length > 0
      styleText2("inverse", t2.placeholder[0]) + styleText2("dim", t2.placeholder.slice(1))
    ) : styleText2(["inverse", "hidden"], "_"), o = this.userInput ? this.userInputWithCursor : d, s = this.value ?? "";
    switch (this.state) {
      case "validating": {
        const n3 = r2 ? `${styleText2("cyan", S_BAR)}  ` : "", i2 = r2 ? styleText2("cyan", S_BAR_END) : "", c2 = styleText2("dim", o), $ = styleText2("dim", "Validating...");
        return `${l2}${n3}${c2}
${i2}  ${$}
`;
      }
      case "error": {
        const n3 = this.error ? `  ${styleText2("yellow", this.error)}` : "", i2 = r2 ? `${styleText2("yellow", S_BAR)}  ` : "", c2 = r2 ? styleText2("yellow", S_BAR_END) : "";
        return `${l2.trim()}
${i2}${o}
${c2}${n3}
`;
      }
      case "submit": {
        const n3 = s ? `${r2 ? "  " : ""}${styleText2("dim", s)}` : "", i2 = r2 ? styleText2("gray", S_BAR) : "";
        return `${l2}${i2}${n3}`;
      }
      case "cancel": {
        const n3 = s ? `  ${styleText2(["strikethrough", "dim"], s)}` : "", i2 = r2 ? styleText2("gray", S_BAR) : "";
        return `${l2}${i2}${n3}${s.trim() ? `
${i2}` : ""}`;
      }
      default: {
        const n3 = r2 ? `${styleText2("cyan", S_BAR)}  ` : "", i2 = r2 ? styleText2("cyan", S_BAR_END) : "";
        return `${l2}${n3}${o}
${i2}
`;
      }
    }
  }
}).prompt();

// package.json
var package_default = {
  name: "create-ft-app",
  version: "0.1.1",
  private: true,
  description: "Scaffold a Turborepo project with the team's Node and SPA stack",
  bin: {
    "create-ft-app": "dist/index.mjs"
  },
  files: [
    "dist",
    "templates",
    "catalog.json"
  ],
  type: "module",
  scripts: {
    build: `esbuild src/index.ts --bundle --platform=node --format=esm --target=node22 --outfile=dist/index.mjs --banner:js="#!/usr/bin/env node
import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" --log-level=warning`,
    dev: "tsx src/index.ts",
    "check-types": "tsc --noEmit",
    test: "tsx --test test/*.test.ts",
    "test:scaffold": "tsx --test test/scaffold.e2e.ts",
    format: "oxfmt",
    "format:check": "oxfmt --check"
  },
  devDependencies: {
    "@clack/prompts": "^1.8.1",
    "@types/node": "^24.19.2",
    esbuild: "^0.28.2",
    oxfmt: "^0.75.0",
    tsx: "^4.23.15",
    typescript: "^7.0.2"
  },
  engines: {
    node: ">=22"
  },
  packageManager: "pnpm@12.16.1"
};

// src/args.ts
import { parseArgs } from "node:util";

// src/options.ts
var PARTS = ["web", "api", "contracts", "oxlint-config", "typescript-config"];
var PART_HINTS = {
  web: "React SPA: Rsbuild, TanStack Router + Query, FTDS",
  api: "Fastify API: Valibot, OpenAPI + Scalar, Pino",
  contracts: "Valibot schemas shared by web and api",
  "oxlint-config": "shared Oxlint presets (otherwise inlined per package)",
  "typescript-config": "shared tsconfig presets (otherwise inlined per package)"
};
var STACKS = ["node", "go"];
var AVAILABLE_STACKS = ["node"];
var DATABASES = ["postgres", "none"];
var VERSION_MODES = ["tested", "latest"];
var DEFAULTS = {
  stack: "node",
  database: "postgres",
  versions: "tested",
  docker: true,
  git: true,
  codeReview: false,
  install: true
};
function flagsFor(o) {
  const has = (p) => o.parts.includes(p);
  const api = has("api");
  const web = has("web");
  return {
    web,
    api,
    contracts: has("contracts"),
    oxlint: has("oxlint-config"),
    tsconfig: has("typescript-config"),
    postgres: api && o.database === "postgres",
    fullstack: web && api,
    docker: o.docker && (web || api),
    codeReview: o.codeReview,
    git: o.git
  };
}
var NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
var toKebabCase = (text2) => text2.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^[^a-z]+|-+$/g, "");
function validateName(name) {
  if (!name) return "Enter a project name";
  if (name.length > 214) return "Keep the name under 214 characters";
  if (NAME.test(name)) return void 0;
  const suggestion = toKebabCase(name);
  return `Use kebab-case: lowercase words joined by dashes, starting with a letter${suggestion ? ` (try "${suggestion}")` : ""}`;
}
var SCOPE = /^@[a-z0-9][a-z0-9._-]*$/;
function validateScope(scope) {
  return SCOPE.test(scope) ? void 0 : 'The scope must look like "@my-app"';
}

// src/args.ts
var onOff = (on) => on ? "on" : "off";
var HELP = `create-ft-app [dir] [options]

Scaffold a Turborepo project with the team's Node and SPA stack.

Options
  --stack <${STACKS.join("|")}>      Template stack (default: ${DEFAULTS.stack}; go is planned)
  --name <name>          Project name in kebab-case (defaults to the folder name)
  --include <parts>      Comma-separated: ${PARTS.join(", ")}
  --db <${DATABASES.join("|")}>   Database for the api (default: ${DEFAULTS.database})
  --scope <@scope>       npm scope for workspace packages (default: @<name>)
  --versions <mode>      ${VERSION_MODES.join(" or ")} (default: ${DEFAULTS.versions})
  --latest               Same as --versions latest
  --[no-]docker          Dockerfile (default: ${onOff(DEFAULTS.docker)})
  --[no-]code-review     fiscal-cr code review on pull requests (default: ${onOff(DEFAULTS.codeReview)})
  --[no-]git             git init, pre-commit checks and a first commit (default: ${onOff(DEFAULTS.git)})
  --[no-]install         Install, add FTDS, format and verify (default: ${onOff(DEFAULTS.install)})
  -y, --yes              Accept defaults for anything not given as a flag
  -h, --help             Show this help
  -v, --version          Show the CLI version

Examples
  pnpm --config.dlx-cache-max-age=0 dlx github:mof-malaysia/create-ft-app#semver:^0
  pnpm --config.dlx-cache-max-age=0 dlx github:mof-malaysia/create-ft-app#semver:^0 my-app --include web,api,contracts -y
`;
function oneOf(flag, value, allowed) {
  if (value === void 0 || allowed.includes(value)) return value;
  throw new Error(`--${flag} must be one of ${allowed.join(", ")}, got "${value}"`);
}
function parse(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    allowNegative: true,
    options: {
      stack: { type: "string" },
      name: { type: "string" },
      include: { type: "string" },
      db: { type: "string" },
      scope: { type: "string" },
      versions: { type: "string" },
      latest: { type: "boolean" },
      docker: { type: "boolean" },
      "code-review": { type: "boolean" },
      git: { type: "boolean" },
      install: { type: "boolean" },
      yes: { type: "boolean", short: "y" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" }
    }
  });
  if (positionals.length > 1) throw new Error(`Expected one folder, got: ${positionals.join(" ")}`);
  let include;
  if (values.include !== void 0) {
    const given = values.include.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of given) oneOf("include", part, PARTS);
    include = PARTS.filter((p) => given.includes(p));
  }
  return {
    dir: positionals[0],
    stack: oneOf("stack", values.stack, STACKS) ?? DEFAULTS.stack,
    name: values.name,
    include,
    db: oneOf("db", values.db, DATABASES),
    scope: values.scope,
    versions: values.latest ? "latest" : oneOf("versions", values.versions, VERSION_MODES),
    docker: values.docker,
    codeReview: values["code-review"],
    git: values.git,
    install: values.install,
    yes: values.yes ?? false,
    help: values.help ?? false,
    version: values.version ?? false
  };
}

// src/scaffold.ts
import { mkdirSync, readFileSync as readFileSync2, writeFileSync } from "node:fs";
import { basename, dirname, join as join2 } from "node:path";
import { fileURLToPath } from "node:url";

// src/render.ts
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
var DIRECTIVE = /^\s*(?:\/\/|#|<!--|\/\*|\{\/\*)?\s*@(if|elif|else|endif)\b(.*?)(?:-->|\*\/\}|\*\/)?\s*$/;
function evaluate(expr, flags) {
  const source = expr.trim();
  if (!source) throw new Error("Empty template condition");
  return source.split("||").some(
    (any) => any.split("&&").every((term) => {
      const t2 = term.trim();
      const negate = t2.startsWith("!");
      const name = negate ? t2.slice(1).trim() : t2;
      if (!(name in flags)) throw new Error(`Unknown template flag "${name}"`);
      return negate ? !flags[name] : Boolean(flags[name]);
    })
  );
}
function renderText(text2, flags, vars, file = "template") {
  const out = [];
  const stack = [];
  const on = () => stack.at(-1)?.on ?? true;
  text2.split("\n").forEach((line, i2) => {
    const m2 = DIRECTIVE.exec(line);
    if (!m2) {
      if (on()) out.push(line);
      return;
    }
    const [, kind, rest = ""] = m2;
    const where = `${file}:${i2 + 1}`;
    if (kind === "if") {
      const parentOn = on();
      const value = parentOn && evaluate(rest, flags);
      stack.push({ parentOn, matched: value, on: value });
    } else if (kind === "elif" || kind === "else") {
      const top = stack.at(-1);
      if (!top) throw new Error(`@${kind} without @if at ${where}`);
      const value = top.parentOn && !top.matched && (kind === "else" || evaluate(rest, flags));
      top.on = value;
      top.matched ||= value;
    } else {
      if (!stack.pop()) throw new Error(`@endif without @if at ${where}`);
    }
  });
  if (stack.length) throw new Error(`Unclosed @if in ${file}`);
  return out.join("\n").replace(/(?<!\$)\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = vars[key];
    if (value === void 0) throw new Error(`Unknown template variable ${match} in ${file}`);
    return value;
  });
}
function renderFile(src, dest, flags, vars) {
  const content = renderText(readFileSync(src, "utf8"), flags, vars, src);
  return content.trim() ? { path: dest, content } : void 0;
}
function renderDir(src, dest, flags, vars) {
  const files = [];
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const from = join(src, entry.name);
    if (entry.isDirectory() && entry.name.startsWith("+")) {
      if (evaluate(entry.name.slice(1), flags)) files.push(...renderDir(from, dest, flags, vars));
      continue;
    }
    const name = entry.name.startsWith("_") ? `.${entry.name.slice(1)}` : entry.name;
    const to = dest ? `${dest}/${name}` : name;
    if (entry.isDirectory()) files.push(...renderDir(from, to, flags, vars));
    else {
      const file = renderFile(from, to, flags, vars);
      if (file) files.push(file);
    }
  }
  return files;
}

// catalog.json
var catalog_default = {
  $comment: "The tested version set. `--versions latest` resolves each entry from the registry instead.",
  node: "24",
  pnpm: "12.16.1",
  ftds: "v0.1.1",
  shadcn: "4.23.0",
  postgres: "18",
  packages: {
    "@fastify/cors": "^11.3.1",
    "@fastify/static": "^10.1.8",
    "@fastify/swagger": "^9.9.2",
    "@fontsource-variable/inter": "^5.3.0",
    "@rsbuild/core": "^2.3.0",
    "@rsbuild/plugin-react": "^2.1.1",
    "@rstest/adapter-rsbuild": "^0.12.5",
    "@rstest/core": "^0.12.5",
    "@scalar/fastify-api-reference": "^1.76.2",
    "@tailwindcss/postcss": "^4.3.3",
    "@tanstack/react-query": "^5.105.0",
    "@tanstack/react-router": "^1.170.46",
    "@types/node": "^24.19.2",
    "@types/pg": "^8.23.1",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@valibot/to-json-schema": "^1.8.0",
    fastify: "^5.12.7",
    "happy-dom": "^20.14.6",
    ky: "^2.2.0",
    kysely: "^0.29.7",
    lefthook: "^2.2.2",
    oxfmt: "^0.75.0",
    oxlint: "^1.90.0",
    pg: "^8.23.1",
    "pino-pretty": "^13.2.0",
    react: "^19.3.1",
    "react-dom": "^19.3.1",
    tailwindcss: "^4.3.3",
    tsx: "^4.23.15",
    turbo: "^2.11.10",
    typescript: "^7.0.2",
    valibot: "^1.5.0"
  }
};

// src/versions.ts
var { $comment: _, postgres, packages: testedPackages, ...testedToolchain } = catalog_default;
var tested = testedToolchain;
var POSTGRES_VERSION = postgres;
var major = (version) => version.replace(/^v/, "").split(".")[0];
var TIMEOUT = 1e4;
async function getJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: { accept: "application/json", ...headers },
    signal: AbortSignal.timeout(TIMEOUT)
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return await res.json();
}
var npmLatest = (name) => getJson(
  `https://registry.npmjs.org/${name.replace("/", "%2f")}/latest`
).then((p) => p.version);
var nodeLts = () => getJson("https://nodejs.org/dist/index.json").then(
  (releases) => {
    const lts = releases.find((r2) => r2.lts);
    if (!lts) throw new Error("no LTS release listed");
    return major(lts.version);
  }
);
var ftdsLatest = () => getJson(
  "https://api.github.com/repos/mof-malaysia/ftds/tags?per_page=20",
  process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}
).then((tags) => {
  const tag = tags.find((t2) => /^v\d+\.\d+\.\d+$/.test(t2.name));
  if (!tag) throw new Error("no release tag");
  return tag.name;
});
function fallbackTo(fallbacks) {
  return async (label, run2, fallback) => {
    try {
      return await run2();
    } catch {
      fallbacks.push(label);
      return fallback;
    }
  };
}
async function resolveToolchain(mode) {
  if (mode === "tested") return { value: tested, fallbacks: [] };
  const fallbacks = [];
  const attempt = fallbackTo(fallbacks);
  const [node, pnpm, shadcn, ftds] = await Promise.all([
    attempt("node", nodeLts, tested.node),
    attempt("pnpm", () => npmLatest("pnpm"), tested.pnpm),
    attempt("shadcn", () => npmLatest("shadcn"), tested.shadcn),
    attempt("ftds", ftdsLatest, tested.ftds)
  ]);
  return { value: { node, pnpm, shadcn, ftds }, fallbacks };
}
async function resolvePackages(mode, names, nodeMajor) {
  const known = testedPackages;
  const missing = names.filter((n3) => !(n3 in known));
  if (missing.length) throw new Error(`catalog.json has no version for: ${missing.join(", ")}`);
  if (mode === "tested")
    return {
      value: Object.fromEntries(names.map((n3) => [n3, known[n3]])),
      fallbacks: []
    };
  const fallbacks = [];
  const attempt = fallbackTo(fallbacks);
  const entries = await Promise.all(
    names.map(async (name) => {
      if (name === "@types/node") return [name, `^${nodeMajor}`];
      const version = await attempt(name, () => npmLatest(name), null);
      return [name, version ? `^${version}` : known[name]];
    })
  );
  return { value: Object.fromEntries(entries), fallbacks };
}

// src/scaffold.ts
var TEMPLATES = fileURLToPath(new URL("../templates", import.meta.url));
var ROOTS = {
  web: "apps/web",
  api: "apps/api",
  contracts: "packages/contracts",
  "oxlint-config": "packages/oxlint-config",
  "typescript-config": "packages/typescript-config"
};
function templateVars(o, t2, cliVersion) {
  return {
    name: o.name,
    scope: o.scope,
    title: o.name.split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
    nodeMajor: t2.node,
    pnpmVersion: t2.pnpm,
    ftdsVersion: t2.ftds,
    postgresVersion: POSTGRES_VERSION,
    cliVersion,
    parts: o.parts.join(", ")
  };
}
function renderProject(o, t2, cliVersion) {
  const flags = flagsFor(o);
  const vars = templateVars(o, t2, cliVersion);
  const root = join2(TEMPLATES, o.stack);
  const files = renderDir(join2(root, "base"), "", flags, vars);
  for (const part of o.parts)
    files.push(...renderDir(join2(root, ROOTS[part]), ROOTS[part], flags, vars));
  if (flags.api && !flags.contracts) {
    const contract = renderFile(
      join2(root, "packages/contracts/src/index.ts"),
      "apps/api/src/contract.ts",
      flags,
      vars
    );
    if (contract) files.push(contract);
  }
  inlinePresets(files, root, o.scope, flags);
  const used = /* @__PURE__ */ new Set();
  for (const file of files) {
    if (basename(file.path) !== "package.json") continue;
    const pkg = parseJsonc(file);
    for (const field of ["dependencies", "devDependencies", "peerDependencies"])
      for (const [name, range] of Object.entries(pkg[field] ?? {}))
        if (range === "catalog:") used.add(name);
    file.content = `${JSON.stringify(pkg, null, 2)}
`;
  }
  return { files, catalog: [...used].sort() };
}
function fillCatalog(files, packages) {
  const workspace = files.find((f) => f.path === "pnpm-workspace.yaml");
  if (!workspace?.content.includes("  __CATALOG__"))
    throw new Error("pnpm-workspace.yaml template has no __CATALOG__ line");
  const lines = Object.entries(packages).sort(([a2], [b]) => a2.localeCompare(b)).map(([name, range]) => `  ${JSON.stringify(name)}: ${JSON.stringify(range)}`);
  workspace.content = workspace.content.replace("  __CATALOG__", lines.join("\n"));
}
function writeProject(dir, files) {
  for (const file of files) {
    const to = join2(dir, file.path);
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, file.content);
  }
}
var PRESETS = [
  { file: "tsconfig.json", flag: "tsconfig", dir: "typescript-config" },
  { file: ".oxlintrc.json", flag: "oxlint", dir: "oxlint-config" }
];
function inlinePresets(files, root, scope, flags) {
  for (const preset of PRESETS) {
    if (flags[preset.flag]) continue;
    const prefix = `${scope}/${preset.dir}/`;
    for (const file of files) {
      if (basename(file.path) !== preset.file) continue;
      const config = parseJsonc(file);
      const refs = [config.extends].flat().filter((ref2) => typeof ref2 === "string");
      const ref = refs.find((r2) => r2.includes(prefix));
      if (!ref) continue;
      const presetFile = join2(
        root,
        "packages",
        preset.dir,
        ref.slice(ref.indexOf(prefix) + prefix.length)
      );
      const { extends: _2, ...own } = config;
      file.content = `${JSON.stringify(merge(loadPreset(presetFile), own), null, 2)}
`;
    }
  }
}
function loadPreset(path) {
  const { extends: parent, ...own } = parseJsonc({
    path,
    content: readFileSync2(path, "utf8")
  });
  const parents = [parent].flat().filter((p) => typeof p === "string");
  const inherited = parents.reduce(
    (acc, p) => merge(acc, loadPreset(join2(dirname(path), p))),
    {}
  );
  return merge(inherited, own);
}
function merge(base, over) {
  const out = { ...base };
  for (const [key, value] of Object.entries(over))
    out[key] = isObject(value) && isObject(out[key]) ? merge(out[key], value) : value;
  return out;
}
var isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function parseJsonc(file) {
  const text2 = file.content.split("\n").filter((line) => !/^\s*\/\//.test(line)).join("\n").replace(/,(\s*[}\]])/g, "$1");
  try {
    return JSON.parse(text2);
  } catch (error) {
    throw new Error(`Template produced invalid JSON in ${file.path}: ${error}`);
  }
}

// src/steps.ts
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join as join3 } from "node:path";
function run(cmd, args, opts) {
  return new Promise((resolve2) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: { ...process.env, ...opts.env },
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";
    child.stdout.on("data", (d) => output += d);
    child.stderr.on("data", (d) => output += d);
    child.on("error", (error) => resolve2({ ok: false, output: String(error) }));
    child.on("close", (code) => resolve2({ ok: code === 0, output }));
  });
}
function lastLines(text2, n3 = 25) {
  return text2.trimEnd().split("\n").slice(-n3).join("\n");
}
function localPnpm() {
  const res = spawnSync("pnpm", ["--version"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    // Run outside any project so packageManager fields don't interfere.
    cwd: tmpdir()
  });
  return res.status === 0 ? res.stdout.trim() : void 0;
}
async function provisionPnpm(version) {
  const dir = mkdtempSync(join3(tmpdir(), "create-ft-app-"));
  const res = await run(
    "npm",
    ["install", "--prefix", dir, "--no-audit", "--no-fund", "--loglevel=error", `pnpm@${version}`],
    { cwd: dir }
  );
  if (!res.ok) throw new Error(`Couldn't install pnpm ${version}:
${lastLines(res.output)}`);
  const bin = join3(dir, "node_modules", ".bin");
  return { dir, env: { PATH: `${bin}${delimiter}${process.env.PATH ?? ""}` } };
}
var FTDS_ITEMS = ["ftds-init", "button", "tag", "theme-switch", "skiplink"];

// src/index.ts
function unwrap(value) {
  if (isCancel(value)) {
    cancel("Cancelled. Nothing was written.");
    process.exit(1);
  }
  return value;
}
function progress() {
  if (process.stdout.isTTY) return spinner();
  return {
    start: (msg) => log.step(`${msg}\u2026`),
    stop: (msg) => log.success(msg),
    error: (msg) => log.error(msg)
  };
}
function display(dir) {
  const rel = relative(process.cwd(), dir) || ".";
  return rel.startsWith("..") ? dir : rel;
}
var isEmptyDir = (dir) => !existsSync(dir) || readdirSync2(dir).every((f) => f === ".git" || f === ".DS_Store");
async function gather(args, interactive) {
  let name = args.name ?? (args.dir ? basename2(resolve(args.dir)) : void 0);
  if (!name && !interactive) throw new Error("Pass a folder or --name");
  if (interactive && validateName(name))
    name = unwrap(
      await text({
        message: name ? `Project name ("${name}" isn't kebab-case)` : "Project name",
        placeholder: "my-app",
        // Offer the kebab-case version of a folder name that doesn't fit.
        initialValue: name ? toKebabCase(name) : void 0,
        validate: validateName
      })
    );
  const nameError = validateName(name);
  if (nameError || !name) throw new Error(`${nameError}: "${name}"`);
  let dir = args.dir;
  if (!dir && interactive)
    dir = unwrap(
      await text({
        message: "Where should it go?",
        initialValue: `./${name}`,
        validate: (value) => value ? void 0 : "Enter a folder"
      })
    );
  const target = resolve(dir ?? name);
  if (!isEmptyDir(target)) {
    if (!interactive) throw new Error(`${target} is not empty`);
    const go = unwrap(
      await confirm({
        message: `${display(target)} is not empty. Write into it anyway?`,
        initialValue: false
      })
    );
    if (!go) {
      cancel("Cancelled. Nothing was written.");
      process.exit(1);
    }
  }
  const parts = args.include ?? (interactive ? unwrap(
    await multiselect({
      message: "What should it include?",
      options: PARTS.map((part) => ({
        value: part,
        label: part,
        hint: PART_HINTS[part]
      })),
      initialValues: [...PARTS],
      required: true
    })
  ) : [...PARTS]);
  const database = args.db ?? (parts.includes("api") && interactive ? unwrap(
    await select({
      message: "Database for the api",
      options: [
        {
          value: "postgres",
          label: "Postgres",
          hint: "Kysely + pg, migrations on boot"
        },
        { value: "none", label: "None" }
      ],
      initialValue: DEFAULTS.database
    })
  ) : DEFAULTS.database);
  const extraInfo = {
    docker: { label: "Dockerfile", hint: "one image for the app" },
    git: { label: "git", hint: "init, pre-commit format/lint/type-check/test, first commit" },
    codeReview: {
      label: "Code review",
      hint: "fiscal-cr on pull requests; needs the org's ANTHROPIC_* variables"
    },
    install: { label: "Install and verify", hint: "pnpm install, FTDS, format, build" }
  };
  const unasked = Object.keys(extraInfo).filter((k) => args[k] === void 0);
  const byDefault = unasked.filter((k) => DEFAULTS[k]);
  const picked = interactive && unasked.length ? unwrap(
    await multiselect({
      message: "Extras",
      options: unasked.map((k) => ({ value: k, ...extraInfo[k] })),
      initialValues: byDefault,
      required: false
    })
  ) : byDefault;
  const extra = (k) => args[k] ?? picked.includes(k);
  const versions = args.versions ?? (interactive ? unwrap(
    await select({
      message: "Dependency versions",
      options: [
        {
          value: "tested",
          label: "Tested set",
          hint: `the versions create-ft-app ${package_default.version} was verified with`
        },
        {
          value: "latest",
          label: "Latest",
          hint: "newest releases, checked by the verify step"
        }
      ],
      initialValue: DEFAULTS.versions
    })
  ) : DEFAULTS.versions);
  const scope = args.scope ?? `@${name}`;
  const scopeError = args.scope && validateScope(args.scope);
  if (scopeError) throw new Error(scopeError);
  return {
    stack: args.stack,
    name,
    dir: target,
    scope,
    parts,
    database,
    docker: extra("docker"),
    codeReview: extra("codeReview"),
    git: extra("git"),
    install: extra("install"),
    versions
  };
}
async function main() {
  const args = parse(process.argv.slice(2));
  if (args.help) return void console.log(HELP);
  if (args.version) return void console.log(package_default.version);
  if (Number(major(process.versions.node)) < 22)
    throw new Error(`Node 22 or later is required (found ${process.version})`);
  if (!AVAILABLE_STACKS.includes(args.stack))
    throw new Error(
      `The ${args.stack} stack isn't available yet. Available: ${AVAILABLE_STACKS.join(", ")}.`
    );
  const interactive = Boolean(process.stdin.isTTY) && !args.yes;
  intro(`create-ft-app ${package_default.version}`);
  const o = await gather(args, interactive);
  const flags = flagsFor(o);
  const s = progress();
  s.start(o.versions === "latest" ? "Looking up the latest versions" : "Preparing");
  const toolchain = await resolveToolchain(o.versions);
  const { files, catalog } = renderProject(o, toolchain.value, package_default.version);
  const packages = await resolvePackages(o.versions, catalog, toolchain.value.node);
  fillCatalog(files, packages.value);
  const { node, pnpm, ftds, shadcn } = toolchain.value;
  s.stop(
    `${o.versions === "latest" ? "Resolved the latest versions" : "Using the tested versions"} (Node ${node}, pnpm ${pnpm}, FTDS ${ftds})`
  );
  const fallbacks = [...toolchain.fallbacks, ...packages.fallbacks];
  if (fallbacks.length)
    log.warn(
      `Couldn't reach the registry for ${fallbacks.join(", ")}; used the tested versions.`
    );
  writeProject(o.dir, files);
  for (const f of files)
    if (f.path.endsWith(".env.example"))
      copyFileSync(join4(o.dir, f.path), join4(o.dir, f.path.replace(/\.example$/, "")));
  log.success(`Wrote ${files.length} files to ${o.dir}`);
  const failures = [];
  const step = async (label, cmd, cmdArgs, opts = {}) => {
    const sp = progress();
    sp.start(label);
    const res = await run(cmd, cmdArgs, {
      cwd: opts.cwd ?? o.dir,
      env: opts.env
    });
    if (res.ok) sp.stop(label);
    else {
      sp.error(`${label} failed`);
      log.message(lastLines(res.output));
      failures.push(label);
    }
    return res.ok;
  };
  if (o.git) await step("git init", "git", ["init", "-b", "main"]);
  const local = localPnpm();
  const pnpmMismatch = !local || major(local) !== major(pnpm);
  const ftdsArgs = [
    "dlx",
    `shadcn@${shadcn}`,
    "add",
    ...FTDS_ITEMS.map((i2) => `@ftds/${i2}`),
    "--yes",
    "--overwrite"
  ];
  let tempPnpm;
  try {
    if (o.install) {
      let env = { CI: "1" };
      if (pnpmMismatch) {
        const sp = progress();
        sp.start(`Fetching pnpm ${pnpm}`);
        const provisioned = await provisionPnpm(pnpm);
        tempPnpm = provisioned.dir;
        env = { ...env, ...provisioned.env };
        sp.stop(`Fetched pnpm ${pnpm}`);
      }
      if (await step("Installing dependencies", "pnpm", ["install"], { env })) {
        if (flags.web)
          await step(`Adding FTDS ${ftds} components`, "pnpm", ftdsArgs, {
            cwd: join4(o.dir, "apps/web"),
            env
          });
        await step("Formatting", "pnpm", ["run", "format"], { env });
        await step(
          "Verifying: lint, check-types, test, build",
          "pnpm",
          ["run", "verify", "--output-logs=errors-only"],
          { env }
        );
      }
    }
  } finally {
    if (tempPnpm) rmSync(tempPnpm, { recursive: true, force: true });
  }
  if (o.git) {
    await step("git add", "git", ["add", "-A"]);
    await step("First commit", "git", [
      "commit",
      "-q",
      "--no-verify",
      "-m",
      `chore: scaffold with create-ft-app ${package_default.version}`
    ]);
  }
  const next = [`cd ${display(o.dir)}`];
  if (!o.install) {
    next.push("pnpm install");
    if (flags.web) next.push(`(cd apps/web && pnpm ${ftdsArgs.join(" ")})`);
  }
  if (flags.postgres) next.push("docker compose up -d db");
  next.push("pnpm dev", "", "URLs and scripts are in README.md.");
  note(next.join("\n"), "Next steps");
  if (pnpmMismatch)
    log.warn(
      `This project uses pnpm ${pnpm}, but ${local ? `pnpm ${local} is` : "no pnpm is"} on your PATH.
Install it with: npm install -g pnpm@${major(pnpm)}`
    );
  if (failures.length) {
    outro(`Done, but these steps failed: ${failures.join(", ")}. The output is above.`);
    process.exitCode = 1;
  } else outro("Done.");
}
main().catch((error) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
