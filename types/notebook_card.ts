type NoteBookCardProps = {
  index?: number;
  isAdding?: boolean;
  numberOfLinesName?: number;
  notebook: NotebookProps;
  onPress?: (notebookId: number) => void;
  isLoading?: boolean;
};
