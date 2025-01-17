type BottomDrawerMoveNoteProps = {
  title: string;
  description?: string;
  onSubmit: (notebookId: number, isUncategorized?: boolean) => void;
};
