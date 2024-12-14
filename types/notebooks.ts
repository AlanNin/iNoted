type NewNotebookProps = {
  id?: number | null;
  name: string;
  background: string;
};

type NotebookProps = {
  id?: number;
  name: string;
  background: string;
  notes?: NoteProps[];
  created_at?: string;
  updated_at?: string;
};
