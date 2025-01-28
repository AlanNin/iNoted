type LexicalProps = {
  handleBack: () => void;
  isKeyboardVisible: boolean;
  isShowMoreModalOpen: boolean;
  setIsShowMoreModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleShare: () => void;
  handleToggleBottomMoveNoteDrawer: () => void;
  handleToggleBottomNoteDetailsDrawer: () => void;
  handleToggleBottomNoteDeleteDrawer: () => void;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  content: string;
  noteDate: string;
  navigationType: string;
  handleToastAndroid: (message: string) => void;
  theme: "light" | "dark";
};
