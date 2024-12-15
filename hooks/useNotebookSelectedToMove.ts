import { create } from "zustand";

type NotebooksSelectedToMoveModeState = {
  isNotebooksSelectedToMoveMode: boolean;
  selectedNotebook: number | null;
  toggleNotebooksSelectedToMoveMode: () => void;
  setNotebooksSelectedToMoveMode: (
    isNotebooksSelectedToMoveMode: boolean
  ) => void;
  selectNotebook: (noteId: number) => void;
  clearSelectedNotebook: () => void;
};

export const useNotebooksSelectedToMoveMode = create<
  NotebooksSelectedToMoveModeState
>((set) => ({
  isNotebooksSelectedToMoveMode: false,
  selectedNotebook: null, // Solo un ID o null
  toggleNotebooksSelectedToMoveMode: () =>
    set((state) => ({
      isNotebooksSelectedToMoveMode: !state.isNotebooksSelectedToMoveMode,
      selectedNotebook: null,
    })),
  setNotebooksSelectedToMoveMode: (isNotebooksSelectedToMoveMode) =>
    set({ isNotebooksSelectedToMoveMode }),
  selectNotebook: (noteId) =>
    set((state) => ({
      selectedNotebook: state.selectedNotebook === noteId ? null : noteId,
    })),

  clearSelectedNotebook: () => set({ selectedNotebook: null }),
}));
