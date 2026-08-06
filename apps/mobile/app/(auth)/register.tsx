import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useAuthStore } from '@/lib/auth-store'

export default function RegisterScreen() {
  const router    = useRouter()
  const register  = useAuthStore(s => s.register)

  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || password.length < 6) return
    setLoading(true)
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password })
      router.replace('/(tabs)')
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err?.message ?? 'Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="bg-brand px-6 pt-16 pb-10">
          <Text className="text-white text-2xl font-bold">TuyenDung.vn</Text>
          <Text className="text-white/80 text-sm mt-1">Tạo tài khoản miễn phí</Text>
        </View>

        <View className="px-6 pt-8 pb-10">
          <Text className="text-2xl font-bold text-gray-900 mb-1">Đăng ký</Text>
          <Text className="text-gray-500 text-sm mb-8">Bắt đầu hành trình tìm việc của bạn</Text>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Họ và tên</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 mb-4"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
          />

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
            className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 mb-2"
            placeholder="Ít nhất 6 ký tự"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text className="text-xs text-gray-400 mb-6">Mật khẩu phải có ít nhất 6 ký tự</Text>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading || !fullName || !email || password.length < 6}
            className="bg-brand rounded-xl py-3.5 items-center"
            style={{ opacity: loading || !fullName || !email || password.length < 6 ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Tạo tài khoản</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 text-sm">Đã có tài khoản? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-brand font-semibold text-sm">Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
