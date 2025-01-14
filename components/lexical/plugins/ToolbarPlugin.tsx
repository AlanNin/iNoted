/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import "../styles.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  $getListDepth,
} from "@lexical/list";
import { useCallback, useEffect, useRef, useState } from "react";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import {
  Divider,
  OLIcon,
  ULIcon,
  alignCenterIcon,
  alignJustifyIcon,
  alignLeftIcon,
  alignRightIcon,
  boldIcon,
  checkListIcon,
  highlightIcon,
  indentIcon,
  italicIcon,
  outdentIcon,
  strikethroughIcon,
  subscriptIcon,
  superscriptIcon,
  underlineIcon,
} from "../components/toolbarIcons";

const LowPriority = 1;
const MAX_LIST_DEPTH = 5;

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const theme = useColorScheme();
  const toolbarRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [isSuperScript, setIsSuperScript] = useState(false);
  const [isSubScript, setIsSubScript] = useState(false);
  const [isUnorderedList, setIsUnorderedList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isCheckList, setIsCheckList] = useState(false);
  const [listDepth, setListDepth] = useState(0);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      const grandParent = parent?.getParent();

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsHighlight(selection.hasFormat("highlight"));
      setIsSuperScript(selection.hasFormat("superscript"));
      setIsSubScript(selection.hasFormat("subscript"));

      // Check list status and depth
      if ($isListNode(parent)) {
        setIsUnorderedList(parent.getListType() === "bullet");
        setIsOrderedList(parent.getListType() === "number");
        setIsCheckList(parent.getListType() === "check");
        setListDepth($getListDepth(parent));
      } else if ($isListNode(grandParent)) {
        setIsUnorderedList(grandParent.getListType() === "bullet");
        setIsOrderedList(grandParent.getListType() === "number");
        setIsCheckList(grandParent.getListType() === "check");
        setListDepth($getListDepth(grandParent));
      } else {
        setIsUnorderedList(false);
        setIsOrderedList(false);
        setIsCheckList(false);
        setListDepth(0);
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const toggleList = (listType: string) => {
    if (listType === "ul") {
      if (isUnorderedList) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }
    } else if (listType === "ol") {
      if (isOrderedList) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
    } else if (listType === "check") {
      if (isCheckList) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
      }
    }
  };

  const handleOutdent = () => {
    if (listDepth <= 1) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    }
  };

  const handleIndent = () => {
    if (listDepth < MAX_LIST_DEPTH) {
      editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    }
  };

  return (
    <div
      className="toolbar"
      ref={toolbarRef}
      style={{ background: colors[theme].editor.toolbar_background }}
    >
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={"toolbar-item spaced"}
        aria-label="Format Bold"
        style={{
          background: isBold
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
      >
        {boldIcon(isBold)}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        aria-label="Format Italics"
        className={"toolbar-item spaced"}
        style={{
          background: isItalic
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
      >
        {italicIcon(isItalic)}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={"toolbar-item spaced"}
        style={{
          background: isUnderline
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
        aria-label="Format Underline"
      >
        {underlineIcon(isUnderline)}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={"toolbar-item spaced"}
        style={{
          background: isStrikethrough
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
        aria-label="Format Strikethrough"
      >
        {strikethroughIcon(isStrikethrough)}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight");
        }}
        className={"toolbar-item spaced"}
        style={{
          background: isHighlight
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
        aria-label="Format Strikethrough"
      >
        {highlightIcon(isHighlight)}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
        }}
        className={"toolbar-item spaced"}
        style={{
          background: isSuperScript
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
        aria-label="Format Strikethrough"
      >
        {superscriptIcon(isSuperScript)}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
        }}
        className={"toolbar-item spaced"}
        style={{
          background: isSubScript
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
        aria-label="Format Strikethrough"
      >
        {subscriptIcon(isSubScript)}
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        {alignLeftIcon()}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        {alignCenterIcon()}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        {alignRightIcon()}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        {alignJustifyIcon()}
      </button>
      <Divider />
      <button
        onClick={() => toggleList("check")}
        className={"toolbar-item spaced"}
        style={{
          background: isCheckList
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
        aria-label="Insert Check List"
      >
        {checkListIcon(isCheckList)}
      </button>
      <button
        onClick={() => toggleList("ul")}
        className={"toolbar-item spaced"}
        style={{
          background: isUnorderedList
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
        aria-label="Toggle Unordered List"
      >
        {ULIcon(isUnorderedList)}
      </button>
      <button
        onClick={() => toggleList("ol")}
        className={"toolbar-item spaced"}
        style={{
          background: isOrderedList
            ? colors[theme].editor.toolbar_active
            : "transparent",
        }}
        aria-label="Toggle Ordered List"
      >
        {OLIcon(isOrderedList)}
      </button>
      <button
        onClick={handleOutdent}
        className="toolbar-item spaced"
        aria-label="Decrease Depth"
        disabled={!isCheckList && !isOrderedList && !isUnorderedList}
      >
        {outdentIcon()}
      </button>
      <button
        onClick={handleIndent}
        className="toolbar-item spaced"
        aria-label="Increase Depth"
        disabled={
          (!isCheckList && !isOrderedList && !isUnorderedList) ||
          listDepth >= MAX_LIST_DEPTH
        }
      >
        {indentIcon()}
      </button>
    </div>
  );
}
