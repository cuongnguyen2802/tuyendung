import '../global.css'

import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '@/lib/auth-store'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function RootLayout() {
  const { loadUser, isLoading } = useAuthStore()

  useEffect(() => {
    loadUser().then(() => SplashScreen.hideAsync())
  }, [])

  if (isLoading) return null

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)"  options={{ headerShown: false }} />
          <Stack.Screen name="(auth)"  options={{ headerShown: false }} />
          <Stack.Screen name="jobs/[id]" options={{ headerShown: true, title: 'Chi tiết việc làm', headerTintColor: '#19734E' }} />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
