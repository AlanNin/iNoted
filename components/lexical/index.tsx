"use dom";
import "./styles.css";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";
import {
  theme as lexicalTheme,
  dark_theme as lexicalDarkTheme,
} from "@/components/lexical/theme";
import ToolbarPlugin from "@/components/lexical/plugins/ToolbarPlugin";
import colors from "@/constants/colors";
import React from "react";
import Header from "./components/header";
import ContentTop from "./components/contentTop";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HashtagNode } from "@lexical/hashtag";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import EditablePlugin from "@/components/lexical/plugins/EditablePlugin";

const placeholder = "Capture your thoughts...";

export default function LexicalEditorComponent({
  isShowMoreModalOpen,
  setIsShowMoreModalOpen,
  handleShare,
  handleBack,
  isKeyboardVisible,
  handleToggleBottomMoveNoteDrawer,
  handleToggleBottomNoteDetailsDrawer,
  handleToggleBottomNoteDeleteDrawer,
  setContent,
  setTitle,
  title,
  content,
  noteDate,
  navigationType,
  handleToastAndroid,
  theme,
}: LexicalProps) {
  const [mode, SetMode] = React.useState<"edit" | "view">("edit");
  const [isTitleEditable, setIsTitleEditable] = React.useState(true);

  const editorConfig = {
    namespace: "Lexical Editor",
    editorState: content,
    nodes: [
      HorizontalRuleNode,
      CodeNode,
      LinkNode,
      ListNode,
      ListItemNode,
      HeadingNode,
      QuoteNode,
      HashtagNode,
    ],
    onError(error: Error) {
      throw error;
    },
    theme: theme === "light" ? lexicalTheme : lexicalDarkTheme,
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <main
        className="main-container"
        style={{
          background: colors[theme].editor.background,
          color: colors[theme].editor.text,
        }}
      >
        <Header
          isShowMoreModalOpen={isShowMoreModalOpen}
          setIsShowMoreModalOpen={setIsShowMoreModalOpen}
          handleBack={handleBack}
          handleShare={handleShare}
          handleToggleBottomMoveNoteDrawer={handleToggleBottomMoveNoteDrawer}
          handleToggleBottomNoteDetailsDrawer={
            handleToggleBottomNoteDetailsDrawer
          }
          handleToggleBottomNoteDeleteDrawer={
            handleToggleBottomNoteDeleteDrawer
          }
          handleToastAndroid={handleToastAndroid}
          mode={mode}
          SetMode={SetMode}
          setIsTitleEditable={setIsTitleEditable}
          theme={theme}
        />
        <ContentTop
          noteDate={noteDate}
          setTitle={setTitle}
          title={title}
          isTitleEditable={isTitleEditable}
          theme={theme}
        />

        <div className="editor-container">
          <div
            className="editor-inner"
            style={{
              background: colors[theme].editor.background,
              color: colors[theme].editor.text,
            }}
          >
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  id="editor-input-content"
                  autoComplete="off"
                  spellCheck="false"
                  autoCorrect="off"
                  className={`editor-input${
                    theme === "dark" ? " dark-editor-input" : ""
                  }`}
                  aria-placeholder={placeholder}
                  style={{
                    color: colors[theme].editor.text,
                  }}
                  placeholder={
                    <div
                      className="editor-placeholder"
                      style={{ color: colors[theme].editor.placeholder }}
                    >
                      {placeholder}
                    </div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin
              onChange={(editorState) => {
                setContent(JSON.stringify(editorState.toJSON()));
              }}
              ignoreHistoryMergeTagChange
            />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <EditablePlugin
              isKeyboardVisible={isKeyboardVisible}
              setIsTitleEditable={setIsTitleEditable}
              navigationType={navigationType}
              mode={mode}
            />
            <HashtagPlugin />
            {/* <TreeViewPlugin /> */}
          </div>
        </div>
        {mode === "edit" && isKeyboardVisible && (
          <ToolbarPlugin theme={theme} />
        )}
      </main>
    </LexicalComposer>
  );
}
