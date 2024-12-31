import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NotebooksNotesModeState = {
  selectedNotebookToShow: NotebookProps | null;
  setSelectedNotebookToShow: (selectedNotebook: NotebookProps | null) => void;
  clearSelectedNotebookToShow: () => void;
};

export const useNotebooksNotes = create<NotebooksNotesModeState>((set) => ({
  selectedNotebookToShow: null,
  setSelectedNotebookToShow: async (selectedNotebookToShow) => {
    await AsyncStorage.setItem(
      "selectedNotebookToShow",
      JSON.stringify(selectedNotebookToShow)
    );
    set({ selectedNotebookToShow });
  },
  clearSelectedNotebookToShow: async () => {
    await AsyncStorage.removeItem("selectedNotebookToShow");
    set({ selectedNotebookToShow: null });
  },
}));

(async () => {
  try {
    const storedNotebook = await AsyncStorage.getItem("selectedNotebookToShow");
    if (storedNotebook) {
      useNotebooksNotes
        .getState()
        .setSelectedNotebookToShow(JSON.parse(storedNotebook));
    }
  } catch (error) {
    console.error("Error loading selected notebook:", error);
  }
})();
