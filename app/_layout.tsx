import { Stack } from "expo-router";
import "react-native-reanimated";
import { FavoritesProvider } from "../context/FavoritesContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(rider)" options={{ headerShown: false }} />
          <Stack.Screen name="order-tracking" options={{ headerShown: false }} />
          <Stack.Screen name="waiting-for-rider" options={{ headerShown: false }} />
        </Stack>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
