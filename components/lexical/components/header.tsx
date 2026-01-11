// dom component, use inside existing dom component or specify "use dom" in the file
import Icon from "@/components/icon";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import React, { useEffect } from "react";
import colors from "@/constants/colors";
import { MotiView } from "moti";
import { Keyboard } from "react-native";

export default function Header({
  isShowMoreModalOpen,
  setIsShowMoreModalOpen,
  isSearching,
  setIsSearching,
  handleBack,
  handleShare,
  handleOpenBottomMoveNoteDrawer,
  handleOpenBottomNoteDetailsDrawer,
  handleOpenBottomNoteDeleteDrawer,
  handleToastAndroid,
  mode,
  SetMode,
  setIsTitleEditable,
  theme,
  searchResultsNumber,
  searchIndex,
  searchTerm,
  isSearchFocused,
  setSearchIndex,
  setSearchTerm,
  setIsSearchFocused,
}: {
  isShowMoreModalOpen: boolean;
  setIsShowMoreModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  handleBack: () => void;
  handleShare: () => void;
  handleOpenBottomMoveNoteDrawer: () => void;
  handleOpenBottomNoteDetailsDrawer: () => void;
  handleOpenBottomNoteDeleteDrawer: () => void;
  handleToastAndroid: (message: string) => void;
  mode: "edit" | "view";
  SetMode: (mode: "edit" | "view") => void;
  setIsTitleEditable: React.Dispatch<React.SetStateAction<boolean>>;
  theme: "light" | "dark";
  searchResultsNumber: number;
  searchIndex: number;
  searchTerm: string | null;
  isSearchFocused: boolean;
  setSearchIndex: React.Dispatch<React.SetStateAction<number>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string | null>>;
  setIsSearchFocused: React.Dispatch<React.SetStateAction<boolean>>;
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
      name: mode === "edit" ? "Read Only" : "Enable Edit",
      icon: "BookOpenText",
      onClick:
        mode === "edit" ? () => toggleMode("view") : () => toggleMode("edit"),
    },
    {
      name: "Move",
      icon: "BookCopy",
      onClick: handleOpenBottomMoveNoteDrawer,
    },
    {
      name: "Details",
      icon: "Info",
      onClick: handleOpenBottomNoteDetailsDrawer,
    },
    {
      name: "Delete",
      icon: "Eraser",
      color: colors[theme].danger,
      onClick: handleOpenBottomNoteDeleteDrawer,
    },
  ];

  function searchPreviousNote() {
    setSearchIndex((prev) => Math.max(0, prev - 1));
    Keyboard.dismiss();
  }

  function searchNextNote() {
    setSearchIndex((prev) => Math.min(searchResultsNumber - 1, prev + 1));
    Keyboard.dismiss();
  }

  useEffect(() => {
    if (!isSearchFocused) {
      setIsSearchFocused(false);
    }
  }, [setIsSearchFocused]);

  return (
    <header className="header">
      {isSearching ? (
        <>
          <button onClick={() => setIsSearching(false)}>
            <Icon name="ArrowLeft" customColor={colors[theme].tint} />
          </button>
          <input
            className="header-search-input"
            placeholder="Find in note..."
            autoFocus={true}
            onChange={(e) => {
              if (searchIndex !== 0) {
                setSearchIndex(0);
              }
              setSearchTerm(e.target.value);
            }}
            onFocus={() => {
              setIsSearchFocused(true);
              editor.setEditable(false);
            }}
            onBlur={() => {
              setIsSearchFocused(false);
              editor.setEditable(true);
            }}
            style={{ color: colors[theme].tint }}
          />
          {searchTerm && searchTerm?.length > 0 && (
            <div className="header-search-right">
              {searchResultsNumber > 0 && (
                <>
                  <button
                    onClick={() => searchPreviousNote()}
                    disabled={searchIndex === 0}
                  >
                    <Icon name="ChevronUp" customColor={colors[theme].tint} />
                  </button>
                  {searchIndex + 1} / {searchResultsNumber}
                  <button
                    onClick={() => searchNextNote()}
                    disabled={searchIndex === searchResultsNumber - 1}
                  >
                    <Icon name="ChevronDown" customColor={colors[theme].tint} />
                  </button>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <button onClick={() => handleBack()}>
            <Icon name="ArrowLeft" customColor={colors[theme].tint} />
          </button>
          <div className="header-right">
            <button onClick={() => setIsSearching(true)}>
              <Icon name="ScanSearch" customColor={colors[theme].tint} />
            </button>

            <div className="more-container" ref={moreContainerRef}>
              <button onClick={toggleMoreModal}>
                <Icon
                  name="EllipsisVertical"
                  customColor={colors[theme].tint}
                />
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
                          <p
                            style={{
                              color: option.color || colors[theme].text,
                              whiteSpace: "nowrap",
                            }}
                          >
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
        </>
      )}
    </header>
  );
}
