type NoteCardProps = {
  index?: number;
  note: NoteProps;
  viewMode: "grid" | "list";
  onPress?: () => void;
  animated?: boolean;
  selectDisabled?: boolean;
  dateType?: "date" | "hour";
};
