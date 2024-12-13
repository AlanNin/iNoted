import { create } from "zustand";

type NotebooksEditModeState = {
  isNotebooksEditMode: boolean;
  selectedNotebooks: number[];
  toggleNotebooksEditMode: () => void;
  setNotebooksEditMode: (isNotebooksEditMode: boolean) => void;
  selectNote: (noteId: number) => void;
  clearSelectedNotebooks: () => void;
};

export const useNotebooksEditMode = create<NotebooksEditModeState>(
  (set, get) => ({
    isNotebooksEditMode: false,
    selectedNotebooks: [],
    toggleNotebooksEditMode: () =>
      set((state) => ({
        isNotebooksEditMode: !state.isNotebooksEditMode,
        selectedNotebooks: [],
      })),
    setNotebooksEditMode: (isNotebooksEditMode) => set({ isNotebooksEditMode }),
    selectNote: (noteId) => {
      const { selectedNotebooks } = get();
      if (selectedNotebooks.includes(noteId)) {
        set({
          selectedNotebooks: selectedNotebooks.filter((id) => id !== noteId),
        });
      } else {
        set({ selectedNotebooks: [...selectedNotebooks, noteId] });
      }
    },
    clearSelectedNotebooks: () => set({ selectedNotebooks: [] }),
  })
);
