// client/src/pages/Create/Editor/hooks/useEditor.js

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────
const INDENT = "  "; // 2 spaces
const PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
const CLOSING_CHARS = new Set([")", "]", "}", '"', "'", "`"]);

// ─── Pure Text Helpers ────────────────────────────────────────────────────────

function getLineRange(text, start, end) {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const afterEnd = text.indexOf("\n", end);
  const lineEnd = afterEnd === -1 ? text.length : afterEnd;
  return { lineStart, lineEnd };
}

function indentLines(text, start, end) {
  const { lineStart, lineEnd } = getLineRange(text, start, end);
  const block = text.slice(lineStart, lineEnd);
  const indented = block
    .split("\n")
    .map((l) => INDENT + l)
    .join("\n");
  const added = indented.length - block.length;
  return {
    newText: text.slice(0, lineStart) + indented + text.slice(lineEnd),
    newStart: start + INDENT.length,
    newEnd: end + added,
  };
}

function dedentLines(text, start, end) {
  const { lineStart, lineEnd } = getLineRange(text, start, end);
  const block = text.slice(lineStart, lineEnd);
  let firstRemoved = 0;
  const dedented = block
    .split("\n")
    .map((l, i) => {
      if (l.startsWith(INDENT)) {
        if (i === 0) firstRemoved = INDENT.length;
        return l.slice(INDENT.length);
      }
      if (l.startsWith(" ")) {
        if (i === 0) firstRemoved = 1;
        return l.slice(1);
      }
      return l;
    })
    .join("\n");
  const removed = block.length - dedented.length;
  return {
    newText: text.slice(0, lineStart) + dedented + text.slice(lineEnd),
    newStart: Math.max(lineStart, start - firstRemoved),
    newEnd: Math.max(lineStart, end - removed),
  };
}

function duplicateLine(text, start, end) {
  const { lineStart, lineEnd } = getLineRange(text, start, end);
  const block = text.slice(lineStart, lineEnd);
  const insert = "\n" + block;
  return {
    newText: text.slice(0, lineEnd) + insert + text.slice(lineEnd),
    newStart: start + insert.length,
    newEnd: end + insert.length,
  };
}

function deleteLine(text, start) {
  const { lineStart, lineEnd } = getLineRange(text, start, start);
  let delStart = lineStart;
  let delEnd = lineEnd;
  if (delEnd < text.length) delEnd += 1;
  else if (delStart > 0) delStart -= 1;
  return {
    newText: text.slice(0, delStart) + text.slice(delEnd),
    newStart: delStart,
  };
}

function moveLine(text, start, end, direction) {
  const { lineStart, lineEnd } = getLineRange(text, start, end);
  const block = text.slice(lineStart, lineEnd);
  if (direction === "up") {
    if (lineStart === 0) return null;
    const prevEnd = lineStart - 1;
    const prevStart = text.lastIndexOf("\n", prevEnd - 1) + 1;
    const prevBlock = text.slice(prevStart, prevEnd);
    const offset = -(prevBlock.length + 1);
    return {
      newText:
        text.slice(0, prevStart) +
        block +
        "\n" +
        prevBlock +
        text.slice(lineEnd),
      newStart: start + offset,
      newEnd: end + offset,
    };
  } else {
    if (lineEnd >= text.length) return null;
    const nextStart = lineEnd + 1;
    const nextEndRaw = text.indexOf("\n", nextStart);
    const nextEnd = nextEndRaw === -1 ? text.length : nextEndRaw;
    const nextBlock = text.slice(nextStart, nextEnd);
    const offset = nextBlock.length + 1;
    return {
      newText:
        text.slice(0, lineStart) +
        nextBlock +
        "\n" +
        block +
        text.slice(nextEnd),
      newStart: start + offset,
      newEnd: end + offset,
    };
  }
}

function selectLine(text, start) {
  const { lineStart, lineEnd } = getLineRange(text, start, start);
  return { newStart: lineStart, newEnd: lineEnd };
}

function toggleComment(text, start, end) {
  const { lineStart, lineEnd } = getLineRange(text, start, end);
  const block = text.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const allCommented = lines.every(
    (l) => l.trimStart().startsWith("<!-- ") && l.trimEnd().endsWith(" -->"),
  );
  const toggled = lines
    .map((l) =>
      allCommented
        ? l.replace(/^(\s*)<!-- /, "$1").replace(/ -->$/, "")
        : `<!-- ${l} -->`,
    )
    .join("\n");
  const diff = toggled.length - block.length;
  const firstLineDiff = allCommented ? -5 : 5;
  return {
    newText: text.slice(0, lineStart) + toggled + text.slice(lineEnd),
    newStart: Math.max(lineStart, start + firstLineDiff),
    newEnd: end + diff,
  };
}

function handleSmartEnter(text, pos) {
  const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
  const line = text.slice(lineStart, pos);

  const cbMatch = line.match(/^(\s*)-\s\[[ x]\]\s(.*)$/);
  if (cbMatch) {
    if (cbMatch[2].trim() === "")
      return {
        newText: text.slice(0, lineStart) + "\n" + text.slice(pos),
        newPos: lineStart + 1,
      };
    const cont = `\n${cbMatch[1]}- [ ] `;
    return {
      newText: text.slice(0, pos) + cont + text.slice(pos),
      newPos: pos + cont.length,
    };
  }

  const olMatch = line.match(/^(\s*)(\d+)\.\s(.*)$/);
  if (olMatch) {
    if (olMatch[3].trim() === "")
      return {
        newText: text.slice(0, lineStart) + "\n" + text.slice(pos),
        newPos: lineStart + 1,
      };
    const cont = `\n${olMatch[1]}${parseInt(olMatch[2]) + 1}. `;
    return {
      newText: text.slice(0, pos) + cont + text.slice(pos),
      newPos: pos + cont.length,
    };
  }

  const ulMatch = line.match(/^(\s*)([-*+])\s(.*)$/);
  if (ulMatch) {
    if (ulMatch[3].trim() === "")
      return {
        newText: text.slice(0, lineStart) + "\n" + text.slice(pos),
        newPos: lineStart + 1,
      };
    const cont = `\n${ulMatch[1]}${ulMatch[2]} `;
    return {
      newText: text.slice(0, pos) + cont + text.slice(pos),
      newPos: pos + cont.length,
    };
  }

  const bqMatch = line.match(/^(\s*>+\s?)(.*)$/);
  if (bqMatch) {
    if (bqMatch[2].trim() === "")
      return {
        newText: text.slice(0, lineStart) + "\n" + text.slice(pos),
        newPos: lineStart + 1,
      };
    const prefix = line.match(/^(\s*>+\s?)/)[1];
    const cont = `\n${prefix}`;
    return {
      newText: text.slice(0, pos) + cont + text.slice(pos),
      newPos: pos + cont.length,
    };
  }

  return null;
}

function handleAutoPair(text, start, end, key) {
  if (CLOSING_CHARS.has(key) && start === end && text[start] === key) {
    return { newText: text, newStart: start + 1, newEnd: start + 1 };
  }
  const close = PAIRS[key];
  if (!close) return null;
  if (start !== end) {
    const selected = text.slice(start, end);
    return {
      newText: text.slice(0, start) + key + selected + close + text.slice(end),
      newStart: start + 1,
      newEnd: end + 1,
    };
  }
  return {
    newText: text.slice(0, start) + key + close + text.slice(start),
    newStart: start + 1,
    newEnd: start + 1,
  };
}

function handlePairBackspace(text, start, end) {
  if (start !== end) return null;
  const before = text[start - 1];
  const after = text[start];
  if (before && PAIRS[before] && PAIRS[before] === after) {
    return {
      newText: text.slice(0, start - 1) + text.slice(start + 1),
      newStart: start - 1,
      newEnd: start - 1,
    };
  }
  return null;
}

// ─── Combined Hook ────────────────────────────────────────────────────────────

/**
 * useEditor
 *
 * Combines formatting state (undo/redo, handleFormat, handleContentChange)
 * with all VS-Code-like keybindings into a single hook.
 *
 * @param {string}          content
 * @param {Function}        setContent
 * @param {React.RefObject} textareaRef   - forwarded ref on <ContentInput>
 * @param {React.RefObject} publishBtnRef
 * @param {React.RefObject} undoBtnRef
 * @param {React.RefObject} redoBtnRef
 */
export function useEditor({
  content,
  setContent,
  textareaRef,
  publishBtnRef,
  undoBtnRef,
  redoBtnRef,
}) {
  // ── Formatting state ───────────────────────────────────────────────────────
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [textAlignment, setTextAlignment] = useState("left");
  const [isSaved, setIsSaved] = useState(true);

  const addToUndoStack = useCallback((prev) => {
    setUndoStack((s) => [...s, prev]);
    setRedoStack([]);
  }, []);

  const handleContentChange = useCallback(
    (e, setIsSavedExternal) => {
      const newContent = e.target.value;
      addToUndoStack(content);
      setContent(newContent);
      (setIsSavedExternal ?? setIsSaved)(false);
      e.target.style.height = "auto";
      e.target.style.height = e.target.scrollHeight + "px";
    },
    [content, setContent, addToUndoStack],
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((s) => [...s, content]);
    setContent(prev);
    setUndoStack((s) => s.slice(0, -1));
  }, [undoStack, content, setContent]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((s) => [...s, content]);
    setContent(next);
    setRedoStack((s) => s.slice(0, -1));
  }, [redoStack, content, setContent]);

  const handleFormat = useCallback(
    (format) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const sel = content.substring(start, end);

      if (!sel) {
        toast.error("Select some text first");
        return;
      }

      const wrap = (before, after = before) =>
        content.substring(0, start) +
        before +
        sel +
        after +
        content.substring(end);

      const formatMap = {
        bold: () => wrap("**"),
        italic: () => wrap("*"),
        underline: () => wrap("<u>", "</u>"),
        strikethrough: () => wrap("~~"),
        highlight: () => wrap("<mark>", "</mark>"),
        inlineCode: () => wrap("`"),
        quote: () =>
          content.substring(0, start) + `> ${sel}` + content.substring(end),
        list: () =>
          content.substring(0, start) + `- ${sel}` + content.substring(end),
        heading: () =>
          content.substring(0, start) + `## ${sel}` + content.substring(end),
        line: () =>
          content.substring(0, start) +
          `\n---\n${sel}` +
          content.substring(end),
        code: () =>
          content.substring(0, start) +
          `\`\`\`txt\n${sel}\n\`\`\`` +
          content.substring(end),
        link: () =>
          content.substring(0, start) +
          `[${sel}](http://example.com)` +
          content.substring(end),
        subscript: () => wrap("~"),
        pageBreak: () =>
          content.substring(0, start) +
          `${sel}\n<span className=html2pdf__page-break></span>` +
          content.substring(end),
        dropCap: () =>
          content.substring(0, start) +
          `<span style="float: left; font-size: 3rem; font-weight: bold; line-height: 1; margin-right: 8px;">${sel[0]}</span>${sel.slice(1)}` +
          content.substring(end),
      };

      const fn = formatMap[format];
      if (!fn) return;
      addToUndoStack(content);
      setContent(fn());
      setSelectedText(sel);
    },
    [content, setContent, addToUndoStack, textareaRef],
  );

  // ── Keybindings ────────────────────────────────────────────────────────────
  const pendingSel = useRef(null);

  // Flush pending cursor restore after every render
  useEffect(() => {
    const ta = textareaRef?.current;
    if (pendingSel.current && ta) {
      const { start, end } = pendingSel.current;
      ta.selectionStart = start;
      ta.selectionEnd = end;
      pendingSel.current = null;
    }
  });

  /** Apply a text-edit result: update state + queue cursor restore */
  const apply = useCallback(
    (newText, newStart, newEnd) => {
      pendingSel.current = { start: newStart, end: newEnd ?? newStart };
      addToUndoStack(content);
      setContent(newText);
      setIsSaved(false);
    },
    [content, setContent, addToUndoStack],
  );

  const onKeyDown = useCallback(
    (e) => {
      const ta = textareaRef?.current;
      if (!ta) return;

      const text = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // ── Cmd / Ctrl combos ──────────────────────────────────────────────────
      if (isMod && !isAlt) {
        switch (e.key) {
          case "s":
          case "S":
            e.preventDefault();
            publishBtnRef?.current?.click();
            return;

          case "b":
          case "B":
            e.preventDefault();
            handleFormat("bold");
            return;

          case "i":
          case "I":
            e.preventDefault();
            handleFormat("italic");
            return;

          case "u":
          case "U":
            e.preventDefault();
            handleFormat("underline");
            return;

          case "]":
            e.preventDefault();
            apply(...Object.values(indentLines(text, start, end)));
            return;

          case "[":
            e.preventDefault();
            apply(...Object.values(dedentLines(text, start, end)));
            return;

          case "d":
          case "D":
            e.preventDefault();
            apply(...Object.values(duplicateLine(text, start, end)));
            return;

          case "k":
          case "K":
            if (isShift) {
              e.preventDefault();
              const r = deleteLine(text, start);
              apply(r.newText, r.newStart);
            }
            return;

          case "/":
            e.preventDefault();
            apply(...Object.values(toggleComment(text, start, end)));
            return;

          case "l":
          case "L":
            e.preventDefault();
            {
              const { newStart, newEnd } = selectLine(text, start);
              ta.selectionStart = newStart;
              ta.selectionEnd = newEnd;
            }
            return;

          case "z":
          case "Z":
            e.preventDefault();
            isShift
              ? redoBtnRef?.current?.click()
              : undoBtnRef?.current?.click();
            return;

          case "y":
          case "Y":
            e.preventDefault();
            redoBtnRef?.current?.click();
            return;

          default:
            break;
        }
      }

      // ── Alt + ↑ / ↓  →  move line ─────────────────────────────────────────
      if (isAlt && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const result = moveLine(
          text,
          start,
          end,
          e.key === "ArrowUp" ? "up" : "down",
        );
        if (result) apply(result.newText, result.newStart, result.newEnd);
        return;
      }

      // ── Tab / Shift+Tab  →  indent / dedent ───────────────────────────────
      if (e.key === "Tab") {
        e.preventDefault();
        if (isShift) {
          apply(...Object.values(dedentLines(text, start, end)));
        } else if (start === end) {
          apply(
            text.slice(0, start) + INDENT + text.slice(start),
            start + INDENT.length,
          );
        } else {
          apply(...Object.values(indentLines(text, start, end)));
        }
        return;
      }

      // ── Enter  →  smart list / blockquote continuation ────────────────────
      if (e.key === "Enter" && !isMod) {
        const result = handleSmartEnter(text, start);
        if (result) {
          e.preventDefault();
          apply(result.newText, result.newPos);
          return;
        }
      }

      // ── Auto-pair ──────────────────────────────────────────────────────────
      if (e.key in PAIRS || CLOSING_CHARS.has(e.key)) {
        const result = handleAutoPair(text, start, end, e.key);
        if (result) {
          e.preventDefault();
          apply(result.newText, result.newStart, result.newEnd);
          return;
        }
      }

      // ── Backspace  →  delete matching pair ────────────────────────────────
      if (e.key === "Backspace") {
        const result = handlePairBackspace(text, start, end);
        if (result) {
          e.preventDefault();
          apply(result.newText, result.newStart, result.newEnd);
          return;
        }
      }
    },
    [apply, handleFormat, publishBtnRef, undoBtnRef, redoBtnRef, textareaRef],
  );

  return {
    // formatting state
    selectedText,
    setSelectedText,
    textAlignment,
    setTextAlignment,
    isSaved,
    setIsSaved,
    undoStack,
    redoStack,
    // handlers
    handleContentChange,
    handleUndo,
    handleRedo,
    handleFormat,
    // keybinding handler for <ContentInput onKeyDown={...}>
    onKeyDown,
  };
}
