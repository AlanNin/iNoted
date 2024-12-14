import { db_client } from "@/db/client";
import { notebooks, notes } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function createNotebook(notebook: NewNotebookProps) {
  try {
    await db_client.insert(notebooks).values({
      name: notebook.name,
      background: notebook.background,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Could not create the notebook");
  }
}

export async function deleteNotebook(id: number) {
  try {
    const result = await db_client
      .delete(notebooks)
      .where(eq(notebooks.id, id));
    if (!result) {
      throw new Error("Notebook not found");
    }
  } catch (error) {
    throw new Error("Could not delete the notebook");
  }
}

export async function deleteNotebooks(ids: number[]) {
  try {
    const result = await db_client
      .delete(notebooks)
      .where(inArray(notebooks.id, ids));
    if (!result) {
      throw new Error("Notebook not found");
    }
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
    return await db_client.select().from(notebooks);
  } catch (error) {
    throw new Error("Could not fetch notebooks");
  }
}

export async function addNoteToNotebook({
  noteId,
  notebookId,
}: {
  noteId: number;
  notebookId: number;
}) {
  try {
    const result = await db_client
      .update(notes)
      .set({ notebook_id: notebookId })
      .where(eq(notes.id, noteId));

    if (!result) {
      throw new Error("Note not found");
    }
  } catch (error) {
    throw new Error("Could not add the note to the notebook");
  }
}

export async function removeNoteFromNotebook({ noteId }: { noteId: number }) {
  try {
    const result = await db_client
      .update(notes)
      .set({ notebook_id: null })
      .where(eq(notes.id, noteId));

    if (!result) {
      throw new Error("Note not found");
    }
  } catch (error) {
    throw new Error("Could not remove the note from the notebook");
  }
}
