// dom component, use inside existing dom component or specify "use dom" in the file
import Icon from "@/components/icon";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import React, { useEffect } from "react";
import colors from "@/constants/colors";
import useColorScheme from "@/hooks/useColorScheme";
import { MotiView } from "moti";

export default function Header({
  isShowMoreModalOpen,
  setIsShowMoreModalOpen,
  handleBack,
  handleShare,
  handleToggleBottomMoveNoteDrawer,
  handleToggleBottomNoteDetailsDrawer,
  handleToggleBottomNoteDeleteDrawer,
  handleToastAndroid,
  mode,
  SetMode,
  setIsTitleEditable,
  theme,
}: {
  isShowMoreModalOpen: boolean;
  setIsShowMoreModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleBack: () => void;
  handleShare: () => void;
  handleToggleBottomMoveNoteDrawer: () => void;
  handleToggleBottomNoteDetailsDrawer: () => void;
  handleToggleBottomNoteDeleteDrawer: () => void;
  handleToastAndroid: (message: string) => void;
  mode: "edit" | "view";
  SetMode: (mode: "edit" | "view") => void;
  setIsTitleEditable: React.Dispatch<React.SetStateAction<boolean>>;
  theme: "light" | "dark";
}) {
  const [editor] = useLexicalComposerContext();
  const moreContainerRef = React.useRef<HTMLDivElement>(null);

  function toggleMode(mode: "edit" | "view") {
    if (mode === "edit") {
      setIsTitleEditable(true);
      editor.setEditable(true);
      editor.focus();
      handleToastAndroid("Edit Mode");
    }

    if (mode === "view") {
      setIsTitleEditable(false);
      editor.setEditable(false);
      handleToastAndroid("View-Only");
    }

    SetMode(mode);
  }

  function toggleMoreModal() {
    setIsShowMoreModalOpen(!isShowMoreModalOpen);
  }

  React.useEffect(() => {
    const handleClickOutsideMoreModal = (event: any) => {
      if (
        moreContainerRef.current &&
        !moreContainerRef.current.contains(event.target)
      ) {
        setIsShowMoreModalOpen(false);
      }
    };
    document.addEventListener("mouseover", handleClickOutsideMoreModal);
    return () => {
      document.removeEventListener("mouseout", handleClickOutsideMoreModal);
    };
  }, []);

  const moreOptions = [
    {
      name: "Share",
      icon: "Share2",
      onClick: handleShare,
    },
    {
      name: "Move",
      icon: "BookCopy",
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
        <Icon name="ArrowLeft" customColor={colors[theme].tint} />
      </button>
      <div className="header-right">
        {mode === "edit" && (
          <button onClick={() => toggleMode("view")}>
            <Icon name="BookOpenText" customColor={colors[theme].tint} />
          </button>
        )}
        {mode === "view" && (
          <button onClick={() => toggleMode("edit")}>
            <Icon name="FilePen" customColor={colors[theme].tint} />
          </button>
        )}

        <div className="more-container" ref={moreContainerRef}>
          <button onClick={toggleMoreModal}>
            <Icon name="EllipsisVertical" customColor={colors[theme].tint} />
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
                        customColor={option.color || colors[theme].tint}
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
