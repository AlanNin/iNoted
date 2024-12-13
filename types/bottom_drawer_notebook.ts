export type BottomDrawerNotebookProps = {
  title: string;
  description?: string;
  defaultName?: string;
  defaultBackground?: string;
  onSubmit: (notebook: NewNotebookProps) => void;
};
