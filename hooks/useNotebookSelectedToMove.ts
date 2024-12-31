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
  uncategorizedSelected: boolean;
  setUncategorizedSelected: (isUncategorizedSelected: boolean) => void;
};

export const useNotebooksSelectedToMoveMode = create<
  NotebooksSelectedToMoveModeState
>((set) => ({
  isNotebooksSelectedToMoveMode: false,
  selectedNotebook: null,
  uncategorizedSelected: false,
  toggleNotebooksSelectedToMoveMode: () =>
    set((state) => ({
      isNotebooksSelectedToMoveMode: !state.isNotebooksSelectedToMoveMode,
      selectedNotebook: null,
      uncategorizedSelected: false,
    })),
  setNotebooksSelectedToMoveMode: (isNotebooksSelectedToMoveMode) =>
    set({ isNotebooksSelectedToMoveMode }),
  selectNotebook: (noteId) =>
    set((state) => {
      if (state.uncategorizedSelected) {
        set({ uncategorizedSelected: false });
      }
      return {
        selectedNotebook: state.selectedNotebook === noteId ? null : noteId,
      };
    }),
  clearSelectedNotebook: () => set({ selectedNotebook: null }),
  setUncategorizedSelected: (isUncategorizedSelected) =>
    set((state) => {
      if (isUncategorizedSelected) {
        set({ selectedNotebook: null });
      }
      return { uncategorizedSelected: isUncategorizedSelected };
    }),
}));
