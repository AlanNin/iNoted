type NewNoteProps = {
  title: string;
  content: string;
  notebook_id?: number;
};

type NoteProps = {
  id: number;
  title: string;
  content: string;
  notebook_id?: number;
  created_at: string;
  updated_at: string;
};
