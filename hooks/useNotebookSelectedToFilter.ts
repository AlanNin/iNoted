import { create } from "zustand";

type NotebooksSelectedToFilterModeState = {
  isNotebooksSelectedToFilterMode: boolean;
  selectedNotebook: number | null;
  toggleNotebooksSelectedToFilterMode: () => void;
  setNotebooksSelectedToFilterMode: (
    isNotebooksSelectedToFilterMode: boolean
  ) => void;
  selectNotebook: (noteId: number) => void;
  clearSelectedNotebook: () => void;
  uncategorizedSelected: boolean;
  setUncategorizedSelected: (isUncategorizedSelected: boolean) => void;
};

export const useNotebooksSelectedToFilterMode =
  create<NotebooksSelectedToFilterModeState>((set) => ({
    isNotebooksSelectedToFilterMode: false,
    selectedNotebook: null,
    uncategorizedSelected: false,
    toggleNotebooksSelectedToFilterMode: () =>
      set((state) => ({
        isNotebooksSelectedToFilterMode: !state.isNotebooksSelectedToFilterMode,
        selectedNotebook: null,
        uncategorizedSelected: false,
      })),
    setNotebooksSelectedToFilterMode: (isNotebooksSelectedToFilterMode) =>
      set({ isNotebooksSelectedToFilterMode }),
    selectNotebook: (noteId) =>
      set((state) => {
        if (state.uncategorizedSelected) {
          set({ uncategorizedSelected: false });
        }
        return {
          selectedNotebook: state.selectedNotebook === noteId ? null : noteId,
        };
      }),
    clearSelectedNotebook: () =>
      set({ selectedNotebook: null, uncategorizedSelected: false }),
    setUncategorizedSelected: (isUncategorizedSelected) =>
      set((state) => {
        if (isUncategorizedSelected) {
          set({ selectedNotebook: null });
        }
        return { uncategorizedSelected: isUncategorizedSelected };
      }),
  }));
