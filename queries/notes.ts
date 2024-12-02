// import { extendedClient } from "@/prisma/prisma_client";

// export function createNote(data: NewNote) {
//   return extendedClient.notes.create({
//     data: {
//       title: data.title,
//       content: data.content,
//     },
//   });
// }

// export function deleteNote(id: number) {
//   return extendedClient.notes.delete({
//     where: {
//       id,
//     },
//   });
// }

// export function updateNote(id: number, data: NewNote) {
//   return extendedClient.notes.update({
//     where: {
//       id,
//     },
//     data: {
//       title: data.title,
//       content: data.content,
//     },
//   });
// }

// export function getNoteById(id: number) {
//   return extendedClient.notes.findUnique({
//     where: {
//       id,
//     },
//   });
// }

// export function getAllNotes() {
//   return extendedClient.notes.findMany();
// }
