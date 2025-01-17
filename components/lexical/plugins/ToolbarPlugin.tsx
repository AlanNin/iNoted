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
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  LexicalCommand,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  createCommand,
} from "lexical";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  $getListDepth,
} from "@lexical/list";
import { motion } from "motion/react";

import colors from "@/constants/colors";
import * as React from "react";
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
  closeIcon,
  colorPaletteIcon,
  fontColorIcon,
  fontSizeIcon,
  h1Icon,
  h2Icon,
  h3Icon,
  h4Icon,
  h5Icon,
  h6Icon,
  highlightIcon,
  indentIcon,
  italicIcon,
  minusIcon,
  outdentIcon,
  plusIcon,
  redoIcon,
  strikethroughIcon,
  subscriptIcon,
  superscriptIcon,
  underlineIcon,
  undoIcon,
} from "../components/toolbarIcons";
import { MotiView } from "@/components/themed";
import ColorPicker, { HueSlider, Panel1 } from "reanimated-color-picker";
export const SET_FONT_SIZE_COMMAND: LexicalCommand<number> = createCommand();
export const SET_FONT_COLOR_COMMAND: LexicalCommand<string> = createCommand();
export const SET_HIGHLIGHT_COLOR_COMMAND: LexicalCommand<string> = createCommand();
export const SET_IS_SHOWING_FONT_SIZE_OPTIONS_COMMAND: LexicalCommand<boolean> = createCommand();
export const SET_IS_SHOWING_FONT_COLOR_OPTIONS_COMMAND: LexicalCommand<boolean> = createCommand();
export const SET_IS_SHOWING_HIGHLIGHT_COLOR_OPTIONS_COMMAND: LexicalCommand<boolean> = createCommand();
const LowPriority = 1;
const MAX_LIST_DEPTH = 5;

export default function ToolbarPlugin() {
  const theme = useColorScheme();
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState(false);
  const [isSuperScript, setIsSuperScript] = React.useState(false);
  const [isSubScript, setIsSubScript] = React.useState(false);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [isUnorderedList, setIsUnorderedList] = React.useState(false);
  const [isOrderedList, setIsOrderedList] = React.useState(false);
  const [isCheckList, setIsCheckList] = React.useState(false);
  const [listDepth, setListDepth] = React.useState(0);
  const [fontSize, setFontSize] = React.useState(16);
  const [fontColor, setFontColor] = React.useState(colors[theme].editor.text);
  const [highlightColor, setHighlightColor] = React.useState(
    colors[theme].editor.background
  );
  const [showFontSizeOptions, setShowFontSizeOptions] = React.useState(false);
  const [showFontColorOptions, setShowFontColorOptions] = React.useState(false);
  const [
    showHighlightColorOptions,
    setShowHighlightColorOptions,
  ] = React.useState(false);
  const [pickerTemporaryColor, setPickerTemporaryColor] = React.useState<
    string
  >("");
  const [colorPicker, setColorPicker] = React.useState<
    "font" | "highlight" | null
  >(null);

  const fontColorPalette = [
    colors[theme].text, // Default
    "#00BFFF", // Deep Sky Blue
    "#FF7F50", // Coral
    "#6A0DAD", // Purple
    "#32CD32", // Lime Green
    "#FF4500", // Orange Red
    "#FFD700", // Gold
    "#8A2BE2", // Blue Violet
    "#20B2AA", // Light Sea Green
    "#DC143C", // Crimson
    "#7FFFD4", // Aquamarine
    "#FF69B4", // Hot Pink
    "#191970", // Midnight Blue
    "#6495ED", // Cornflower Blue
  ];

  const highlightColorPalette = [
    colors[theme].editor.background, // None
    colors[theme].editor.text_highlight, // Default
    "#00BFFF", // Deep Sky Blue
    "#FF7F50", // Coral
    "#6A0DAD", // Purple
    "#32CD32", // Lime Green
    "#FF4500", // Orange Red
    "#FFD700", // Gold
    "#8A2BE2", // Blue Violet
    "#20B2AA", // Light Sea Green
    "#DC143C", // Crimson
    "#7FFFD4", // Aquamarine
    "#FF69B4", // Hot Pink
    "#191970", // Midnight Blue
    "#6495ED", // Cornflower Blue
  ];

  const updateToolbar = React.useCallback(() => {
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
      setIsSuperScript(selection.hasFormat("superscript"));
      setIsSubScript(selection.hasFormat("subscript"));

      // Update text style
      const font_size = $getSelectionStyleValueForProperty(
        selection,
        "font-size"
      );
      const currentFontSize = font_size ? parseInt(font_size) : 16;
      setFontSize(currentFontSize);

      let font_color = $getSelectionStyleValueForProperty(selection, "color");
      let highlight_color = $getSelectionStyleValueForProperty(
        selection,
        "background-color"
      );

      if ($isListNode(parent)) {
        setIsUnorderedList(parent.getListType() === "bullet");
        setIsOrderedList(parent.getListType() === "number");
        setIsCheckList(parent.getListType() === "check");
        setListDepth($getListDepth(parent));

        if (parent.getListType() === "check") {
          font_color = colors[theme].editor.checklist;
        }
      } else if ($isListNode(grandParent)) {
        setIsUnorderedList(grandParent.getListType() === "bullet");
        setIsOrderedList(grandParent.getListType() === "number");
        setIsCheckList(grandParent.getListType() === "check");
        setListDepth($getListDepth(grandParent));

        if (grandParent.getListType() === "check") {
          font_color = colors[theme].editor.checklist;
        }
      } else {
        setIsUnorderedList(false);
        setIsOrderedList(false);
        setIsCheckList(false);
        setListDepth(0);
      }

      setFontColor(font_color || colors[theme].editor.text);
      setHighlightColor(highlight_color || colors[theme].editor.background);
    }
  }, [theme, fontColor]);

  React.useEffect(() => {
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
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        SET_FONT_SIZE_COMMAND,
        (fontSize: number) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, {
              "font-size": `${fontSize}px`,
            });
          }
          return true;
        },
        LowPriority
      ),
      editor.registerCommand(
        SET_FONT_COLOR_COMMAND,
        (fontColor: string) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, {
              color: fontColor,
            });
          }
          return true;
        },
        LowPriority
      ),
      editor.registerCommand(
        SET_HIGHLIGHT_COLOR_COMMAND,
        (highlightColor: string) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, {
              "background-color": highlightColor,
            });
          }
          return true;
        },
        LowPriority
      ),
      editor.registerCommand(
        SET_IS_SHOWING_FONT_SIZE_OPTIONS_COMMAND,
        (value: boolean) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            setShowFontSizeOptions(value);
          }
          return true;
        },
        LowPriority
      ),
      editor.registerCommand(
        SET_IS_SHOWING_FONT_COLOR_OPTIONS_COMMAND,
        (value: boolean) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            setShowFontColorOptions(value);
          }
          return true;
        },
        LowPriority
      ),
      editor.registerCommand(
        SET_IS_SHOWING_HIGHLIGHT_COLOR_OPTIONS_COMMAND,
        (value: boolean) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            setShowHighlightColorOptions(value);
          }
          return true;
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

  const handleOutdentList = () => {
    if (listDepth <= 1) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    }
  };

  const handleIndentList = () => {
    if (listDepth < MAX_LIST_DEPTH) {
      editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    const clampedSize = Math.min(Math.max(newSize, 12), 52);
    editor.dispatchCommand(SET_FONT_SIZE_COMMAND, clampedSize);
  };

  const handleColorPickerComplete = (
    color: string,
    type: "font" | "highlight"
  ) => {
    setColorPicker(null);

    if (type === "font") {
      editor.dispatchCommand(SET_FONT_COLOR_COMMAND, color);
    }

    if (type === "highlight") {
      editor.dispatchCommand(SET_HIGHLIGHT_COLOR_COMMAND, color);
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        translateY: 50,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
      }}
      transition={{
        type: "keyframes",
        duration: 0.2,
        delay: 0.2,
      }}
      className="toolbar"
      style={{
        background: colors[theme].editor.toolbar_background,
        overflowX: "scroll",
        overflowY: "hidden",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Format */}
      <button
        onMouseDown={() => {
          editor.dispatchCommand(
            SET_IS_SHOWING_FONT_SIZE_OPTIONS_COMMAND,
            true
          );
        }}
        className={"toolbar-item spaced"}
        aria-label="Font Modal"
        style={{ gap: 4 }}
      >
        {fontSizeIcon()}
      </button>
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
      <button
        onMouseDown={() => {
          editor.dispatchCommand(
            SET_IS_SHOWING_FONT_COLOR_OPTIONS_COMMAND,
            true
          );
        }}
        className={"toolbar-item spaced"}
        aria-label="Font Color"
      >
        {fontColorIcon(fontColor)}
      </button>
      <button
        onMouseDown={() => {
          editor.dispatchCommand(
            SET_IS_SHOWING_HIGHLIGHT_COLOR_OPTIONS_COMMAND,
            true
          );
        }}
        className={"toolbar-item spaced"}
        aria-label="Format Strikethrough"
      >
        {highlightIcon(highlightColor)}
      </button>
      <Divider />
      {/* Undo Redo */}
      <button
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo Last Action"
        disabled={!canUndo}
      >
        {undoIcon()}
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Redo Last Undone Action"
        disabled={!canRedo}
      >
        {redoIcon()}
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
      {/* Lists */}
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
        onClick={handleOutdentList}
        className="toolbar-item spaced"
        aria-label="Decrease Depth"
        disabled={!isCheckList && !isOrderedList && !isUnorderedList}
      >
        {outdentIcon()}
      </button>
      <button
        onClick={handleIndentList}
        className="toolbar-item spaced"
        aria-label="Increase Depth"
        disabled={
          (!isCheckList && !isOrderedList && !isUnorderedList) ||
          listDepth >= MAX_LIST_DEPTH
        }
      >
        {indentIcon()}
      </button>
      {/* Font Size Modal */}
      <MotiView
        animate={{
          opacity: showFontSizeOptions ? 1 : 0,
          translateY: showFontSizeOptions ? 0 : 50,
        }}
        transition={{
          type: "timing",
          duration: 150,
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          overflowX: "scroll",
          width: "100%",
          backgroundColor: colors[theme].editor.toolbar_background,
          padding: 8,
          gap: 4,
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        <button
          onMouseDown={() => {
            setShowFontSizeOptions(false);
          }}
          className={"toolbar-item spaced"}
          aria-label="Close Font Modal"
        >
          {closeIcon()}
        </button>
        <Divider />
        <button
          onMouseDown={() => {
            handleFontSizeChange(fontSize - 1);
          }}
          className={"toolbar-item spaced"}
          aria-label="Font Size -"
          disabled={fontSize === 12}
        >
          {minusIcon()}
        </button>
        <button
          className={"toolbar-item spaced "}
          aria-label="Font Size"
          style={{
            backgroundColor: colors[theme].foggiest,
            color: colors[theme].text,
            borderRadius: 8,
          }}
        >
          {fontSize}
        </button>
        <button
          onMouseDown={() => {
            handleFontSizeChange(fontSize + 1);
          }}
          className={"toolbar-item spaced"}
          aria-label="Font Size +"
          disabled={fontSize === 52}
        >
          {plusIcon()}
        </button>
        <Divider />
        <button
          onMouseDown={() => {
            handleFontSizeChange(16);
          }}
          className={"toolbar-item spaced"}
          aria-label="Format Size H6"
          style={{
            background:
              fontSize === 16
                ? colors[theme].editor.toolbar_active
                : "transparent",
          }}
        >
          {h6Icon(fontSize === 16)}
        </button>
        <button
          onMouseDown={() => {
            handleFontSizeChange(20);
          }}
          className={"toolbar-item spaced"}
          aria-label="Format Size H5"
          style={{
            background:
              fontSize === 20
                ? colors[theme].editor.toolbar_active
                : "transparent",
          }}
        >
          {h5Icon(fontSize === 20)}
        </button>
        <button
          onMouseDown={() => {
            handleFontSizeChange(28);
          }}
          className={"toolbar-item spaced"}
          aria-label="Format Size H4"
          style={{
            background:
              fontSize === 28
                ? colors[theme].editor.toolbar_active
                : "transparent",
          }}
        >
          {h4Icon(fontSize === 28)}
        </button>
        <button
          onMouseDown={() => {
            handleFontSizeChange(36);
          }}
          className={"toolbar-item spaced"}
          aria-label="Format Size H3"
          style={{
            background:
              fontSize === 36
                ? colors[theme].editor.toolbar_active
                : "transparent",
          }}
        >
          {h3Icon(fontSize === 36)}
        </button>
        <button
          onMouseDown={() => {
            handleFontSizeChange(44);
          }}
          className={"toolbar-item spaced"}
          aria-label="Format Size H2"
          style={{
            background:
              fontSize === 44
                ? colors[theme].editor.toolbar_active
                : "transparent",
          }}
        >
          {h2Icon(fontSize === 44)}
        </button>
        <button
          onMouseDown={() => {
            handleFontSizeChange(52);
          }}
          className={"toolbar-item spaced"}
          aria-label="Format Size H1"
          style={{
            background:
              fontSize === 52
                ? colors[theme].editor.toolbar_active
                : "transparent",
          }}
        >
          {h1Icon(fontSize === 52)}
        </button>
      </MotiView>

      {/* Font Color Modal */}
      <MotiView
        animate={{
          opacity: showFontColorOptions ? 1 : 0,
          translateY: showFontColorOptions ? 0 : 50,
        }}
        transition={{
          type: "timing",
          duration: 150,
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          overflowX: "scroll",
          width: "100%",
          backgroundColor: colors[theme].editor.toolbar_background,
          padding: 8,
          gap: 4,
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        <button
          onMouseDown={() => {
            setShowFontColorOptions(false);
            setColorPicker(null);
          }}
          className={"toolbar-item spaced"}
          aria-label="Close Font Modal"
        >
          {closeIcon()}
        </button>
        <Divider />
        <button
          onMouseDown={() => {
            if (colorPicker === null) {
              setColorPicker("font");
            } else {
              setColorPicker(null);
            }
          }}
          className={"toolbar-item spaced"}
          aria-label="Font Color"
          style={{
            background:
              colorPicker !== null
                ? colors[theme].editor.toolbar_active
                : "transparent",
          }}
        >
          {colorPaletteIcon(colorPicker !== null)}
        </button>
        <Divider />
        {fontColorPalette.map((color) => (
          <button
            onMouseDown={() => {
              editor.dispatchCommand(SET_FONT_COLOR_COMMAND, color);
            }}
            key={color}
            className={
              "toolbar-item spaced " +
              (color === fontColor
                ? `${
                    theme === "dark"
                      ? "dark-editor-color-selected"
                      : "editor-color-selected"
                  }`
                : "")
            }
            aria-label="Font Color In Modal"
            style={{
              backgroundColor: color,
              borderRadius: 9999,
              padding: 10,
              marginLeft: 4,
              marginRight: 4,
              outlineColor: colors[theme].primary_light,
            }}
          />
        ))}
      </MotiView>

      {/* Highlight Color Modal */}
      <MotiView
        animate={{
          opacity: showHighlightColorOptions ? 1 : 0,
          translateY: showHighlightColorOptions ? 0 : 50,
        }}
        transition={{
          type: "timing",
          duration: 150,
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          overflowX: "scroll",
          width: "100%",
          backgroundColor: colors[theme].editor.toolbar_background,
          padding: 8,
          gap: 4,
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        <button
          onMouseDown={() => {
            setShowHighlightColorOptions(false);
            setColorPicker(null);
          }}
          className={"toolbar-item spaced"}
          aria-label="Close Font Modal"
        >
          {closeIcon()}
        </button>
        <Divider />
        <button
          onMouseDown={() => {
            if (colorPicker === null) {
              setColorPicker("highlight");
            } else {
              setColorPicker(null);
            }
          }}
          className={"toolbar-item spaced"}
          aria-label="Highlight Color"
          style={{
            background:
              colorPicker !== null
                ? colors[theme].editor.toolbar_active
                : "transparent",
          }}
        >
          {colorPaletteIcon(colorPicker !== null)}
        </button>
        <Divider />
        {highlightColorPalette.map((color) => (
          <button
            onMouseDown={() => {
              editor.dispatchCommand(SET_HIGHLIGHT_COLOR_COMMAND, color);
            }}
            key={color}
            className={
              "toolbar-item spaced " +
              (color === highlightColor
                ? `${
                    theme === "dark"
                      ? "dark-editor-color-selected"
                      : "editor-color-selected"
                  }`
                : "")
            }
            aria-label="Highlight Color In Modal"
            style={{
              backgroundColor: color,
              borderRadius: 9999,
              padding: 10,
              marginLeft: 4,
              marginRight: 4,
              outlineColor: colors[theme].primary_light,
            }}
          />
        ))}
      </MotiView>
      {/* Color Picker Modal */}
      {colorPicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            marginBottom: 45,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MotiView
            from={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            transition={{
              type: "timing",
              duration: 150,
            }}
            style={{
              zIndex: 10,
              width: "80%",
              backgroundColor: colors[theme].background,
              padding: 12,
              paddingTop: 20,
              paddingBottom: 20,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              margin: 24,
            }}
          >
            <p
              style={{
                margin: 0,
                color: colors[theme].text_muted,
              }}
            >
              {pickerTemporaryColor.length > 0
                ? pickerTemporaryColor
                : colorPicker === "font"
                ? fontColor
                : highlightColor}
            </p>
            <ColorPicker
              style={{ width: "100%" }}
              value={colorPicker === "font" ? fontColor : highlightColor}
              onChange={({ hex }: { hex: string }) => {
                setPickerTemporaryColor(hex);
              }}
              thumbSize={32}
            >
              <Panel1 style={{ width: "100%", borderRadius: 12 }} />
              <HueSlider style={{ marginTop: 16 }} thumbSize={24} />
            </ColorPicker>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                aria-label="Font Color Confirm"
                style={{
                  color: colors[theme].text,
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
                onClick={() => {
                  setColorPicker(null);
                  setPickerTemporaryColor(
                    colorPicker === "font" ? fontColor : highlightColor
                  );
                }}
              >
                Cancel
              </button>
              <div
                style={{ width: 0.5, backgroundColor: colors[theme].foggy }}
              />
              <button
                aria-label="Font Color Confirm"
                style={{
                  color: colors[theme].primary,
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
                onClick={() => {
                  handleColorPickerComplete(pickerTemporaryColor, colorPicker);
                }}
              >
                Confirm
              </button>
            </div>
          </MotiView>
        </div>
      )}
    </motion.div>
  );
}
