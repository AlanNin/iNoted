import { create } from "zustand";

type EditModeState = {
  isEditMode: boolean;
  selectedNotes: number[];
  toggleEditMode: () => void;
  selectNote: (noteId: number) => void;
  clearSelectedNotes: () => void;
};

export const useEditMode = create<EditModeState>((set, get) => ({
  isEditMode: false,
  selectedNotes: [],
  toggleEditMode: () =>
    set((state) => ({
      isEditMode: !state.isEditMode,
      selectedNotes: [],
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
