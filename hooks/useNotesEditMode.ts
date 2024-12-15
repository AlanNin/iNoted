import { create } from "zustand";

type NotesEditModeState = {
  isNotesEditMode: boolean;
  selectedNotes: number[];
  toggleNotesEditMode: () => void;
  setNotesEditMode: (isNotesEditMode: boolean) => void;
  selectNote: (noteId: number) => void;
  clearSelectedNotes: () => void;
};

export const useNotesEditMode = create<NotesEditModeState>((set, get) => ({
  isNotesEditMode: false,
  selectedNotes: [],
  toggleNotesEditMode: () =>
    set((state) => ({
      isNotesEditMode: !state.isNotesEditMode,
      selectedNotes: [],
    })),
  setNotesEditMode: (isNotesEditMode) =>
    set((state) => ({
      isNotesEditMode,
      selectedNotes: isNotesEditMode ? state.selectedNotes : [],
    })),
  selectNote: (noteId) => {
    const { selectedNotes } = get();
    if (selectedNotes.includes(noteId)) {
      set({ selectedNotes: selectedNotes.filter((id) => id !== noteId) });
    } else {
      set({ selectedNotes: [...selectedNotes, noteId] });
    }
  },
  clearSelectedNotes: () => set({ selectedNotes: [] }),
}));
