type BottomDrawerCreateNotebookProps = {
  title: string;
  description?: string;
  onSubmit: (notebook: NewNotebookProps) => void;
};

type BottomDrawerNotebookProps = {
  notebookId?: number;
  onSubmit: (notebook: NewNotebookProps) => void;
};
