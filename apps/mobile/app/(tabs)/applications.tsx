import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Đã nộp',       color: '#6B7280', bg: '#F3F4F6' },
  REVIEWING:  { label: 'Đang xem xét', color: '#D97706', bg: '#FEF3C7' },
  INTERVIEW:  { label: 'Phỏng vấn',    color: '#2563EB', bg: '#EFF6FF' },
  OFFER:      { label: 'Offer ✓',      color: '#19734E', bg: '#EDF7F2' },
  REJECTED:   { label: 'Không đạt',    color: '#DC2626', bg: '#FEF2F2' },
}

export default function ApplicationsTab() {
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn:  applicationsApi.mine,
  })

  const apps = data?.data ?? []

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#19734E" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-lg font-bold text-gray-900">Đơn ứng tuyển</Text>
        <Text className="text-sm text-gray-400 mt-0.5">{apps.length} đơn đã nộp</Text>
      </View>

      <FlatList
        data={apps}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const status = STATUS_MAP[item.status] ?? STATUS_MAP.PENDING
          return (
            <TouchableOpacity
              onPress={() => router.push(`/jobs/${item.job?.id}`)}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <Text className="font-bold text-gray-900" numberOfLines={1}>{item.job?.title}</Text>
                  <Text className="text-gray-500 text-sm mt-0.5">{item.job?.employer?.company?.name}</Text>
                </View>
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: status.bg }}
                >
                  <Text className="text-xs font-semibold" style={{ color: status.color }}>
                    {status.label}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-400 mt-2">
                Nộp ngày {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">📋</Text>
            <Text className="text-gray-600 font-semibold">Chưa có đơn ứng tuyển</Text>
            <Text className="text-gray-400 text-sm mt-1">Hãy ứng tuyển các vị trí phù hợp!</Text>
          </View>
        }
      />
    </View>
  )
}
