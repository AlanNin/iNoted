type NoteCardProps = {
  index?: number;
  note: NoteProps;
  viewMode: "grid" | "list";
  onPress?: () => void;
  selectDisabled?: boolean;
  dateType?: "date" | "hour";
};
