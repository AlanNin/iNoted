import { db_client } from "@/db/client";
import { notebooks, notes } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function createNotebook(notebook: NewNotebookProps) {
  try {
    if (notebook.name.length === 0) {
      throw new Error("Please enter a name for the notebook");
    }

    if (notebook.background.length === 0) {
      throw new Error("Please enter a background for the notebook");
    }

    await db_client.insert(notebooks).values({
      name: notebook.name,
      background: notebook.background,
    });
  } catch (error) {
    throw new Error("Could not create the notebook");
  }
}

export async function deleteNotebook(id: number) {
  try {
    await db_client.transaction(async (tx) => {
      await tx
        .update(notes)
        .set({ notebook_id: null })
        .where(eq(notes.notebook_id, id));

      // Elimina el notebook
      const result = await tx.delete(notebooks).where(eq(notebooks.id, id));
      if (!result) {
        throw new Error("Notebook not found");
      }
    });
  } catch (error) {
    throw new Error("Could not delete the notebook");
  }
}

export async function deleteNotebooks(ids: number[]) {
  try {
    await db_client.transaction(async (tx) => {
      await tx
        .update(notes)
        .set({ notebook_id: null })
        .where(inArray(notes.notebook_id, ids));

      // Elimina los notebooks
      const result = await tx
        .delete(notebooks)
        .where(inArray(notebooks.id, ids));
      if (!result) {
        throw new Error("Notebooks not found");
      }
    });
  } catch (error) {
    throw new Error("Could not delete the notebooks");
  }
}

export async function updateNotebook(id: number, notebook: NewNotebookProps) {
  try {
    const result = await db_client
      .update(notebooks)
      .set({ name: notebook.name, background: notebook.background })
      .where(eq(notebooks.id, id));

    if (!result) {
      throw new Error("Notebook not found");
    }
  } catch (error) {
    throw new Error("Could not update the notebook");
  }
}

export async function getNotebookById(id: number) {
  try {
    const notebook = await db_client
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, id))
      .limit(1);

    if (notebook.length === 0) {
      throw new Error("Notebook not found");
    }

    const notesForNotebook = await db_client
      .select()
      .from(notes)
      .where(eq(notes.notebook_id, id));

    const notebookWithNotes = {
      ...notebook[0],
      notes: notesForNotebook,
    };

    return notebookWithNotes;
  } catch (error) {
    throw new Error("Could not fetch the notebook");
  }
}

export async function getAllNotebooks() {
  try {
    const notebooksList = await db_client.select().from(notebooks);

    const notesList = await db_client.select().from(notes);

    const notebooksWithNotes = notebooksList.map((notebook) => {
      const notesForNotebook = notesList.filter(
        (note) => note.notebook_id === notebook.id
      );

      return {
        ...notebook,
        notes: notesForNotebook,
      };
    });

    return notebooksWithNotes;
  } catch (error) {
    throw new Error("Could not fetch notebooks with their notes");
  }
}

export async function addNotesToNotebook({
  noteIds,
  notebookId,
  isUncategorized = false,
}: {
  noteIds: number | number[];
  notebookId: number | undefined;
  isUncategorized?: boolean;
}) {
  try {
    const notesToUpdate = Array.isArray(noteIds) ? noteIds : [noteIds];

    await Promise.all(
      notesToUpdate.map((noteId) =>
        db_client
          .update(notes)
          .set({ notebook_id: null })
          .where(eq(notes.id, noteId))
      )
    );

    if (!isUncategorized) {
      await Promise.all(
        notesToUpdate.map((noteId) =>
          db_client
            .update(notes)
            .set({ notebook_id: notebookId })
            .where(eq(notes.id, noteId))
        )
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error("Could not add notes to the notebook");
  }
}

export async function removeNoteFromNotebook({
  noteIds,
}: {
  noteIds: number[];
}) {
  try {
    const notesToRemove = Array.isArray(noteIds) ? noteIds : [noteIds];

    const result = await Promise.all(
      notesToRemove.map((noteId) =>
        db_client
          .update(notes)
          .set({ notebook_id: null })
          .where(eq(notes.id, noteId))
      )
    );

    if (result.some((res) => !res)) {
      throw new Error(
        "One or more notes were not found or could not be removed"
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error("Could not remove notes from the notebook");
  }
}
