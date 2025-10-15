type NoteCardProps = {
  note: NoteProps;
  viewMode: "grid" | "list";
  onPress?: () => void;
  selectDisabled?: boolean;
  dateType?: "date" | "hour";
  showNotebookIndicator?: boolean;
};
