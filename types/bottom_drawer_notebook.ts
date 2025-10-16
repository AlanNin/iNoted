import { NewNotebookProps } from "./notebooks";

export type BottomDrawerCreateNotebookProps = {
  title: string;
  description?: string;
  onSubmit: (notebook: NewNotebookProps) => void;
};

export type BottomDrawerNotebookProps = {
  notebookId?: number;
  onSubmit: (notebook: NewNotebookProps) => void;
};
