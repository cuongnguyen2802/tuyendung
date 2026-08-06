import { Tabs, Redirect } from 'expo-router'
import { View, Text } from 'react-native'
import { useAuthStore } from '@/lib/auth-store'

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View className="items-center pt-1">
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text
        className="text-[10px] mt-0.5"
        style={{ color: focused ? '#19734E' : '#9CA3AF', fontWeight: focused ? '700' : '400' }}
      >
        {label}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  const { isLoggedIn } = useAuthStore()
  if (!isLoggedIn) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E7EB',
          height: 64,
        },
        tabBarActiveTintColor:   '#19734E',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Việc làm',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💼" label="Việc làm" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="Tìm kiếm" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Đơn ứng tuyển',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Đơn của tôi" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Tôi" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}
