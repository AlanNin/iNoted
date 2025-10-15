import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NotebooksNotesModeState = {
  selectedNotebookToShow: NotebookProps | null;
  uncategorizedToShowSelected: boolean;
  setSelectedNotebookToShow: (selectedNotebook: NotebookProps | null) => void;
  setUncategorizedToShowSelected: (
    uncategorizedToShowSelected: boolean
  ) => void;
  clearSelectedNotebookToShow: () => void;
};

export const useNotebooksNotes = create<NotebooksNotesModeState>((set) => ({
  selectedNotebookToShow: null,
  uncategorizedToShowSelected: false,
  setSelectedNotebookToShow: async (selectedNotebookToShow) => {
    await AsyncStorage.setItem(
      "selectedNotebookToShow",
      JSON.stringify(selectedNotebookToShow)
    );
    await AsyncStorage.removeItem("uncategorizedToShowSelected");
    set({ selectedNotebookToShow, uncategorizedToShowSelected: false });
  },
  setUncategorizedToShowSelected: async (uncategorizedToShowSelected) => {
    await AsyncStorage.setItem(
      "uncategorizedToShowSelected",
      uncategorizedToShowSelected.toString()
    );
    await AsyncStorage.removeItem("selectedNotebookToShow");
    set({ uncategorizedToShowSelected, selectedNotebookToShow: null });
  },
  clearSelectedNotebookToShow: async () => {
    await AsyncStorage.removeItem("selectedNotebookToShow");
    await AsyncStorage.removeItem("uncategorizedToShowSelected");
    set({ selectedNotebookToShow: null, uncategorizedToShowSelected: false });
  },
}));

(async () => {
  try {
    const storedNotebook = await AsyncStorage.getItem("selectedNotebookToShow");
    const storedUncategorizedToShowSelected = await AsyncStorage.getItem(
      "uncategorizedToShowSelected"
    );
    if (storedNotebook) {
      useNotebooksNotes
        .getState()
        .setSelectedNotebookToShow(JSON.parse(storedNotebook));
    } else if (storedUncategorizedToShowSelected) {
      useNotebooksNotes
        .getState()
        .setUncategorizedToShowSelected(
          JSON.parse(storedUncategorizedToShowSelected)
        );
    }
  } catch (error) {
    console.error("Error loading selected notebook:", error);
  }
})();
