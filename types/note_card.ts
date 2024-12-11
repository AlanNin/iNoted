type NoteCardProps = {
  note: NoteProps;
  index?: number;
  viewMode: "grid" | "list";
  isEditMode: boolean;
  setEditMode: (isEditMode: boolean) => void;
  selectedNotes: number[];
  handleSelectNote: (noteId: number) => void;
};
