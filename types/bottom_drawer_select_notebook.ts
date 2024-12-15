type BottomDrawerSelectNotebookProps = {
  title: string;
  description?: string;
  setSelectedNotebook: (notebookId: number | null) => void;
  isNotebookSelected: boolean;
};
