import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/lib/auth-store'

function MenuItem({ icon, label, onPress, danger }: {
  icon: string; label: string; onPress: () => void; danger?: boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3.5 bg-white border-b border-gray-50"
      activeOpacity={0.7}
    >
      <Text className="text-xl w-7 text-center">{icon}</Text>
      <Text
        className="flex-1 text-sm font-medium"
        style={{ color: danger ? '#DC2626' : '#111827' }}
      >
        {label}
      </Text>
      <Text className="text-gray-300">›</Text>
    </TouchableOpacity>
  )
}

export default function ProfileTab() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/login') },
      },
    ])
  }

  const initial = user?.fullName?.[0]?.toUpperCase() ?? '?'

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Avatar section */}
      <View className="bg-brand pt-14 pb-8 items-center">
        <View className="w-20 h-20 rounded-full bg-white/25 items-center justify-center mb-3">
          <Text className="text-white text-3xl font-bold">{initial}</Text>
        </View>
        <Text className="text-white text-lg font-bold">{user?.fullName}</Text>
        <Text className="text-white/70 text-sm mt-0.5">{user?.email}</Text>
        <View className="mt-2 bg-white/20 rounded-full px-3 py-0.5">
          <Text className="text-white text-xs font-semibold">
            {user?.role === 'EMPLOYER' ? '🏢 Nhà tuyển dụng' : '👤 Ứng viên'}
          </Text>
        </View>
      </View>

      {/* Menu sections */}
      <View className="mx-4 mt-5 rounded-2xl overflow-hidden border border-gray-100">
        <MenuItem icon="✏️"  label="Chỉnh sửa hồ sơ"       onPress={() => {}} />
        <MenuItem icon="📄"  label="Quản lý CV"              onPress={() => {}} />
        <MenuItem icon="💼"  label="Việc làm đã lưu"         onPress={() => {}} />
        <MenuItem icon="🔔"  label="Thông báo"               onPress={() => {}} />
      </View>

      <View className="mx-4 mt-3 rounded-2xl overflow-hidden border border-gray-100">
        <MenuItem icon="🔒"  label="Đổi mật khẩu"           onPress={() => {}} />
        <MenuItem icon="❓"  label="Trợ giúp & Hỗ trợ"      onPress={() => {}} />
        <MenuItem icon="⭐"  label="Đánh giá ứng dụng"      onPress={() => {}} />
      </View>

      <View className="mx-4 mt-3 mb-8 rounded-2xl overflow-hidden border border-red-100">
        <MenuItem icon="🚪"  label="Đăng xuất"  onPress={handleLogout} danger />
      </View>

      <Text className="text-center text-gray-300 text-xs mb-6">TuyenDung.vn v1.0.0</Text>
    </ScrollView>
  )
}
