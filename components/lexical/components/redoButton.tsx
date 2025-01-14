// dom component, use inside existing dom component or specify "use dom" in the file
import Icon from "@/components/icon";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { CAN_REDO_COMMAND, REDO_COMMAND } from "lexical";
import * as React from "react";

const LowPriority = 1;

export default function RedoButton() {
  const [editor] = useLexicalComposerContext();
  const [canRedo, setCanRedo] = React.useState(false);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor]);

  return (
    <button
      disabled={!canRedo}
      onClick={() => {
        editor.dispatchCommand(REDO_COMMAND, undefined);
      }}
      className="toolbar-item"
      aria-label="Redo"
    >
      <Icon name="Redo2" muted={!canRedo} />
    </button>
  );
}
