import { db_client } from "@/db/client";
import { notes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createNote(note: NewNote) {
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

export async function updateNote(id: number, note: NewNote) {
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
