import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, JetBrainsMono_400Regular, JetBrainsMono_600SemiBold, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { storage } from '@/shared/storage/storage';
import { ThemeContextProvider, useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    storage.getToken().then((token) => {
      const inAuthGroup = segments[0] === '(auth)';
      if (!token && !inAuthGroup) {
        router.replace('/login');
      }
    });
  }, [router, segments]);

  return null;
}

function AppWithTheme() {
  const { isDark, colors } = useTheme();

  const NavigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.bgPage,
      card: colors.bgSurface,
      text: colors.textPrimary,
      border: colors.borderPrimary,
      primary: colors.primary,
      notification: colors.primary,
    },
  };

  return (
    <ThemeProvider value={NavigationTheme}>
      <AuthGuard />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(recipes)/recipe-form" options={{ title: 'Nova receita' }} />
        <Stack.Screen name="(recipes)/[id]" options={{ title: 'Receita', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeContextProvider>
        <AppWithTheme />
      </ThemeContextProvider>
    </GestureHandlerRootView>
  );
}
