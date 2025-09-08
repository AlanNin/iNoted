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
import ToolbarPlugin from "@/components/lexical/plugins/toolbarPlugin";
import colors from "@/constants/colors";
import React from "react";
import Header from "./components/header";
import ContentTop from "./components/contentTop";
import TreeViewPlugin from "./plugins/treeViewPlugin";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HashtagNode } from "@lexical/hashtag";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { CodeNode } from "@lexical/code";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import EditablePlugin from "@/components/lexical/plugins/editablePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { LinkNode, AutoLinkNode } from "@lexical/link";

const placeholder = "Capture your thoughts...";

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith("http") ? fullMatch : `https://${fullMatch}`,
    };
  },
];

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
  const [isTitleEditable, setIsTitleEditable] = React.useState<boolean>(true);
  const [isTitleFocused, setIsTitleFocused] = React.useState<boolean>(false);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

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
      AutoLinkNode,
    ],
    onError(error: Error) {
      throw error;
    },
    theme: theme === "light" ? lexicalTheme : lexicalDarkTheme,
  };

  const isSafeUrl = (url: string) => {
    try {
      const parsed = new URL(url, "https://example.com");
      const allowed = ["http:", "https:", "mailto:", "tel:"];
      return allowed.includes(parsed.protocol);
    } catch {
      return false;
    }
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
          setIsTitleFocused={setIsTitleFocused}
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
                  autoComplete="on"
                  spellCheck="true"
                  autoCorrect="on"
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
            <LinkPlugin
              validateUrl={isSafeUrl}
              attributes={{ rel: "noreferrer", target: "_blank" }}
            />
            <AutoLinkPlugin matchers={MATCHERS} />
            {/* <TreeViewPlugin /> */}
          </div>
        </div>
        {mode === "edit" && isKeyboardVisible && !isTitleFocused && (
          <ToolbarPlugin
            theme={theme}
            canUndo={canUndo}
            canRedo={canRedo}
            setCanUndo={setCanUndo}
            setCanRedo={setCanRedo}
          />
        )}
      </main>
    </LexicalComposer>
  );
}
