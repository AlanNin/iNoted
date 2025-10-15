import { db_client } from "@/db/client";
import { notebooks, notes } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { updateNotebookUpdatedAt } from "./notebooks";

export async function createNote(note: NewNoteProps) {
  try {
    const response = await db_client
      .insert(notes)
      .values({
        title: note.title,
        content: note.content,
        notebook_id: note.notebook_id,
      })
      .returning();

    if (note.notebook_id) {
      await updateNotebookUpdatedAt(note.notebook_id);
    }

    return response;
  } catch (error) {
    throw new Error("Could not create the note");
  }
}

export async function deleteNote(id: number) {
  try {
    const note = await db_client
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    if (!note.length) {
      throw new Error("Note not found");
    }

    await db_client.delete(notes).where(eq(notes.id, id));

    if (note[0].notebook_id) {
      await updateNotebookUpdatedAt(note[0].notebook_id);
    }
  } catch (error) {
    throw new Error("Could not delete the note");
  }
}

export async function deleteNotes(ids: number[]) {
  try {
    const notesToDelete = await db_client
      .select()
      .from(notes)
      .where(inArray(notes.id, ids));

    if (!notesToDelete.length) {
      throw new Error("No notes found to delete");
    }

    const notebookIds = [
      ...new Set(notesToDelete.map((note) => note.notebook_id).filter(Boolean)),
    ];

    await db_client.delete(notes).where(inArray(notes.id, ids));

    for (const notebookId of notebookIds) {
      if (notebookId) {
        await updateNotebookUpdatedAt(notebookId);
      }
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

export async function upsertNote(id: number | null, note: NewNoteProps) {
  try {
    if (id === null) {
      const response = await db_client
        .insert(notes)
        .values({
          title: note.title,
          content: note.content,
        })
        .returning();

      return response;
    } else {
      const response = await db_client
        .update(notes)
        .set({ title: note.title, content: note.content })
        .where(eq(notes.id, id))
        .returning();

      if (!response) {
        throw new Error("Note not found");
      }

      return response;
    }
  } catch (error) {
    throw new Error("Could not upsert the note");
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
    const query = db_client
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        notebook_id: notes.notebook_id,
        notebook_name: notebooks.name,
        created_at: notes.created_at,
        updated_at: notes.updated_at,
      })
      .from(notes)
      .leftJoin(notebooks, eq(notes.notebook_id, notebooks.id));

    if (notebookId !== undefined) {
      query.where(eq(notes.notebook_id, notebookId));
    }

    const result = await query;
    return result;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw new Error("Could not fetch notes");
  }
}

export async function getAllNotesCalendar() {
  try {
    const allNotes = await db_client
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        notebook_id: notes.notebook_id,
        notebook_name: notebooks.name,
        created_at: notes.created_at,
        updated_at: notes.updated_at,
      })
      .from(notes)
      .leftJoin(notebooks, eq(notes.notebook_id, notebooks.id));

    const groupedNotes = allNotes.reduce(
      (acc: Record<string, typeof allNotes>, note) => {
        const isoDate = note.created_at.replace(" ", "T") + "Z";
        const parsedDate = new Date(isoDate);

        const localDate =
          parsedDate.getFullYear() +
          "-" +
          String(parsedDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(parsedDate.getDate()).padStart(2, "0");

        if (!acc[localDate]) {
          acc[localDate] = [];
        }

        acc[localDate].push(note);
        return acc;
      },
      {}
    );

    const result = Object.keys(groupedNotes)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        notes: groupedNotes[date].map((note) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          notebook_id: note.notebook_id,
          notebook_name: note.notebook_name,
          created_at: note.created_at,
          updated_at: note.updated_at,
        })),
      }));

    return result;
  } catch (error) {
    console.error("Error fetching notes for calendar:", error);
    throw new Error("Could not fetch notes");
  }
}
