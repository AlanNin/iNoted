// dom component, use inside existing dom component or specify "use dom" in the file
import Icon from "@/components/icon";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { CAN_UNDO_COMMAND, UNDO_COMMAND } from "lexical";
import * as React from "react";

const LowPriority = 1;

export default function UndoButton() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = React.useState(false);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor]);

  return (
    <button
      disabled={!canUndo}
      onClick={() => {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
      }}
      className="toolbar-item spaced"
      aria-label="Undo"
    >
      <Icon name="Undo2" muted={!canUndo} />
    </button>
  );
}
