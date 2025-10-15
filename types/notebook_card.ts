type NoteBookCardProps = {
  index?: number;
  isAdding?: boolean;
  numberOfLinesName?: number;
  notebook: NotebookProps;
  onPress?: (notebookId: number) => void;
  isLoading?: boolean;
  isToMove?: boolean;
  isToFilter?: boolean;
  disabled?: boolean;
  mini?: boolean;
  showName?: boolean;
  defaultSelected?: boolean;
};
