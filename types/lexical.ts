export type LexicalProps = {
  handleBack: () => void;
  isKeyboardVisible: boolean;
  isShowMoreModalOpen: boolean;
  setIsShowMoreModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  handleShare: () => void;
  handleOpenBottomMoveNoteDrawer: () => void;
  handleOpenBottomNoteDetailsDrawer: () => void;
  handleOpenBottomNoteDeleteDrawer: () => void;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  content: string;
  noteDate: string;
  handleToastAndroid: (message: string) => void;
  theme: "light" | "dark";
};
