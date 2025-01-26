import { Stack } from "expo-router";

export default function NotebooksLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[notebookId]" options={{ headerShown: false }} />
    </Stack>
  );
}
