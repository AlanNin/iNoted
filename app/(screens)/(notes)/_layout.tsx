import { Stack } from "expo-router";

export default function NotesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[noteId]" options={{ headerShown: false }} />
    </Stack>
  );
}
