// dom component, use inside existing dom component or specify "use dom" in the file
import Icon from "@/components/icon";
import UndoButton from "./undoButton";
import RedoButton from "./redoButton";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import React from "react";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { MotiView } from "moti";
import { BackHandler } from "react-native";
import { $setSelection, SELECTION_CHANGE_COMMAND } from "lexical";

export default function Header({
  isShowMoreModalOpen,
  setIsShowMoreModalOpen,
  handleBack,
  isKeyboardVisible,
  handleShare,
  handleToggleBottomMoveNoteDrawer,
  handleToggleBottomNoteDetailsDrawer,
  handleToggleBottomNoteDeleteDrawer,
}: {
  isShowMoreModalOpen: boolean;
  setIsShowMoreModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleBack: () => void;
  isKeyboardVisible: boolean;
  handleShare: () => void;
  handleToggleBottomMoveNoteDrawer: () => void;
  handleToggleBottomNoteDetailsDrawer: () => void;
  handleToggleBottomNoteDeleteDrawer: () => void;
}) {
  const theme = useColorScheme();
  const [editor] = useLexicalComposerContext();
  const moreContainerRef = React.useRef<HTMLDivElement>(null);

  function toggleMoreModal() {
    setIsShowMoreModalOpen(!isShowMoreModalOpen);
  }

  const handleHideKeyboard = React.useCallback(() => {
    editor.blur();
    editor.update(() => {
      $setSelection(null);
    });
  }, []);

  React.useEffect(() => {
    const handleClickOutsideMoreModal = (event: any) => {
      if (
        moreContainerRef.current &&
        !moreContainerRef.current.contains(event.target)
      ) {
        setIsShowMoreModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMoreModal);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMoreModal);
    };
  }, []);

  React.useEffect(() => {
    const backAction = async () => {
      if (isShowMoreModalOpen) {
        setIsShowMoreModalOpen(false);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        backAction();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [isShowMoreModalOpen]);

  const moreOptions = [
    {
      name: "Share",
      icon: "Share2",
      onClick: handleShare,
    },
    {
      name: "Move",
      icon: "NotebookPen",
      onClick: handleToggleBottomMoveNoteDrawer,
    },
    {
      name: "Details",
      icon: "Info",
      onClick: handleToggleBottomNoteDetailsDrawer,
    },
    {
      name: "Delete",
      icon: "Eraser",
      color: colors[theme].danger,
      onClick: handleToggleBottomNoteDeleteDrawer,
    },
  ];

  return (
    <header className="header">
      <button onClick={() => handleBack()}>
        <Icon name="ArrowLeft" />
      </button>
      <div className="header-right">
        <UndoButton />
        <RedoButton />
        {isKeyboardVisible && (
          <button onClick={handleHideKeyboard}>
            <Icon name="Check" />
          </button>
        )}
        <div className="more-container" ref={moreContainerRef}>
          <button onClick={toggleMoreModal}>
            <Icon name="EllipsisVertical" />
          </button>
          {isShowMoreModalOpen && (
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 150,
              }}
              style={{ zIndex: 10 }}
            >
              <div
                className="more-modal"
                style={{ backgroundColor: colors[theme].grayscale_light }}
              >
                {moreOptions.map((option, index) => (
                  <React.Fragment key={option.name}>
                    <button
                      onClick={() => {
                        setIsShowMoreModalOpen(false);
                        option.onClick();
                      }}
                      className="more-modal-button"
                    >
                      <Icon
                        name={option.icon}
                        strokeWidth={1.2}
                        size={18}
                        customColor={option.color || colors[theme].text}
                      />
                      <p style={{ color: option.color || colors[theme].text }}>
                        {option.name}
                      </p>
                    </button>

                    {index === 0 && (
                      <div
                        className="divider"
                        style={{ backgroundColor: colors[theme].foggiest }}
                      />
                    )}
                    {index === moreOptions.length - 2 && (
                      <div
                        className="divider"
                        style={{ backgroundColor: colors[theme].foggiest }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </MotiView>
          )}
        </div>
      </div>
    </header>
  );
}
