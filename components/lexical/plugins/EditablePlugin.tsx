import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import React from "react";

export default function EditablePlugin({
  isKeyboardVisible,
  setIsTitleEditable,
  navigationType,
  mode,
}: {
  isKeyboardVisible: boolean;
  setIsTitleEditable: React.Dispatch<React.SetStateAction<boolean>>;
  navigationType: string;
  mode: "edit" | "view";
}) {
  const DELAY = navigationType === "threeButton" ? 0 : 525;

  const [editor] = useLexicalComposerContext();
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isKeyboardVisible || mode === "view") return;

    editor.setEditable(false);
    setIsTitleEditable(false);

    const timer = setTimeout(() => {
      editor.setEditable(true);
      setIsTitleEditable(true);
      editor.focus();
    }, DELAY);

    return () => clearTimeout(timer);
  }, [isKeyboardVisible]);

  return null;
}
