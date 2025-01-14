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
import { $getRoot, EditorState, LexicalEditor } from "lexical";
import {
  theme as lexicalTheme,
  dark_theme as lexicalDarkTheme,
} from "@/components/lexical/theme";
import ToolbarPlugin from "@/components/lexical/plugins/ToolbarPlugin";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import React from "react";
import Header from "./components/header";
import ContentTop from "./components/contentTop";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";

const placeholder = "Capture your thoughts...";

export default function LexicalEditorComponent({
  isShowMoreModalOpen,
  setIsShowMoreModalOpen,
  handleShare,
  handleBack,
  isKeyboardVisible,
  ChangeNavigationBarColor,
  handleToggleBottomMoveNoteDrawer,
  handleToggleBottomNoteDetailsDrawer,
  handleToggleBottomNoteDeleteDrawer,
  setContent,
  setTitle,
  title,
  content,
  noteDate,
}: LexicalProps) {
  const theme = useColorScheme();

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
    ],
    onError(error: Error) {
      throw error;
    },
    theme: theme === "light" ? lexicalTheme : lexicalDarkTheme,
  };

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      ChangeNavigationBarColor({ color: undefined });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    ChangeNavigationBarColor({ color: undefined });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <main
        className="main-container"
        style={{ background: colors[theme].editor.background }}
      >
        <Header
          isShowMoreModalOpen={isShowMoreModalOpen}
          setIsShowMoreModalOpen={setIsShowMoreModalOpen}
          handleBack={handleBack}
          isKeyboardVisible={isKeyboardVisible}
          handleShare={handleShare}
          handleToggleBottomMoveNoteDrawer={handleToggleBottomMoveNoteDrawer}
          handleToggleBottomNoteDetailsDrawer={
            handleToggleBottomNoteDetailsDrawer
          }
          handleToggleBottomNoteDeleteDrawer={
            handleToggleBottomNoteDeleteDrawer
          }
        />
        <ContentTop noteDate={noteDate} setTitle={setTitle} title={title} />

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
                  className="editor-input"
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
              onChange={(editorState, editor, tags) => {
                setContent(JSON.stringify(editorState.toJSON()));
              }}
              ignoreHistoryMergeTagChange
              ignoreSelectionChange
            />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            {/* <TreeViewPlugin /> */}
          </div>
        </div>
        <ToolbarPlugin />
      </main>
    </LexicalComposer>
  );
}
