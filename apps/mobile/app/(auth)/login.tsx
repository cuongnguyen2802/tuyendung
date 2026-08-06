import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuthStore } from '@/lib/auth-store'

export default function LoginScreen() {
  const router   = useRouter()
  const login    = useAuthStore(s => s.login)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password) return
    setLoading(true)
    try {
      await login(email.trim(), password)
      router.replace('/(tabs)')
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err?.message ?? 'Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="bg-brand px-6 pt-16 pb-10">
        <Text className="text-white text-2xl font-bold">TuyenDung.vn</Text>
        <Text className="text-white/80 text-sm mt-1">Nền tảng tuyển dụng hàng đầu Việt Nam</Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</Text>
        <Text className="text-gray-500 text-sm mb-8">Chào mừng bạn trở lại!</Text>

        <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 mb-4"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text className="text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 mb-6"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading || !email || !password}
          className="bg-brand rounded-xl py-3.5 items-center"
          style={{ opacity: loading || !email || !password ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500 text-sm">Chưa có tài khoản? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-brand font-semibold text-sm">Đăng ký ngay</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
