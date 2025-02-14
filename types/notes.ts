type NewNoteProps = {
  title: string;
  content: string;
  notebook_id?: number | null;
};

type NoteProps = {
  id: number;
  title: string;
  content: string;
  notebook_id?: number | null;
  created_at: string;
  updated_at: string;
};
