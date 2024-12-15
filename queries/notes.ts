import { db_client } from "@/db/client";
import { notebooks, notes } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function createNote(note: NewNoteProps) {
  try {
    await db_client.insert(notes).values({
      title: note.title,
      content: note.content,
    });
  } catch (error) {
    throw new Error("Could not create the note");
  }
}

export async function deleteNote(id: number) {
  try {
    const result = await db_client.delete(notes).where(eq(notes.id, id));
    if (!result) {
      throw new Error("Note not found");
    }
  } catch (error) {
    throw new Error("Could not delete the note");
  }
}

export async function deleteNotes(ids: number[]) {
  try {
    const result = await db_client.delete(notes).where(inArray(notes.id, ids));
    if (!result) {
      throw new Error("Note not found");
    }
  } catch (error) {
    throw new Error("Could not delete the notes");
  }
}

export async function updateNote(id: number, note: NewNoteProps) {
  try {
    const result = await db_client
      .update(notes)
      .set({ title: note.title, content: note.content })
      .where(eq(notes.id, id));

    if (!result) {
      throw new Error("Note not found");
    }
  } catch (error) {
    throw new Error("Could not update the note");
  }
}

export async function getNoteById(id: number) {
  try {
    const note = await db_client
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    if (note.length === 0) {
      throw new Error("Note not found");
    }

    return note[0];
  } catch (error) {
    throw new Error("Could not fetch the note");
  }
}

export async function getAllNotes() {
  try {
    return await db_client.select().from(notes);
  } catch (error) {
    throw new Error("Could not fetch notes");
  }
}

export async function getAllNotesCustom(notebookId?: number) {
  try {
    if (notebookId !== undefined) {
      const result = await db_client
        .select({
          notebookName: notebooks.name,
          notes: notes,
        })
        .from(notes)
        .leftJoin(notebooks, eq(notes.notebook_id, notebooks.id))
        .where(eq(notes.notebook_id, notebookId));

      return {
        notebookName: result[0]?.notebookName || null,
        notes: result.map((r) => r.notes),
      };
    } else {
      const allNotes = await db_client.select().from(notes);

      return {
        notebookName: null,
        notes: allNotes,
      };
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw new Error("Could not fetch notes");
  }
}
