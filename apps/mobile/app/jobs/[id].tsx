import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router     = useRouter()
  const { isLoggedIn } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn:  () => jobsApi.detail(id),
    enabled:  !!id,
  })

  const apply = useMutation({
    mutationFn: () => jobsApi.apply(id),
    onSuccess:  () => Alert.alert('Thành công! 🎉', 'Đơn ứng tuyển đã được gửi!'),
    onError:    (e: any) => Alert.alert('Lỗi', e?.message ?? 'Vui lòng thử lại'),
  })

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#19734E" />
      </View>
    )
  }

  const job = data?.data
  if (!job) return null

  const salaryText = job.salaryMin && job.salaryMax
    ? `${(job.salaryMin / 1_000_000).toFixed(0)}–${(job.salaryMax / 1_000_000).toFixed(0)} triệu/tháng`
    : 'Thỏa thuận'

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Job header */}
        <View className="px-5 pt-5 pb-4 border-b border-gray-100">
          <View className="w-14 h-14 rounded-2xl bg-brand-50 items-center justify-center mb-3">
            <Text className="text-3xl">🏢</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 leading-tight">{job.title}</Text>
          <Text className="text-brand font-semibold mt-1">
            {job.employer?.company?.name ?? 'Công ty'}
          </Text>
        </View>

        {/* Key info */}
        <View className="flex-row flex-wrap px-5 py-4 gap-3 border-b border-gray-100">
          {[
            { icon: '💰', text: salaryText },
            { icon: '📍', text: job.location ?? 'Chưa cập nhật' },
            { icon: '⏱️',  text: job.jobType ?? 'Full-time' },
            { icon: '🎓', text: job.experienceLevel ?? 'Không yêu cầu' },
          ].map(({ icon, text }) => (
            <View key={text} className="flex-row items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-2">
              <Text>{icon}</Text>
              <Text className="text-sm text-gray-700">{text}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View className="px-5 py-4">
          <Text className="text-base font-bold text-gray-900 mb-2">Mô tả công việc</Text>
          <Text className="text-gray-600 text-sm leading-6">
            {job.description ?? 'Đang cập nhật...'}
          </Text>
        </View>

        {/* Requirements */}
        {job.requirements && (
          <View className="px-5 pb-4">
            <Text className="text-base font-bold text-gray-900 mb-2">Yêu cầu</Text>
            <Text className="text-gray-600 text-sm leading-6">{job.requirements}</Text>
          </View>
        )}

        {/* Benefits */}
        {job.benefits && (
          <View className="px-5 pb-4">
            <Text className="text-base font-bold text-gray-900 mb-2">Quyền lợi</Text>
            <Text className="text-gray-600 text-sm leading-6">{job.benefits}</Text>
          </View>
        )}
      </ScrollView>

      {/* Apply button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4"
        style={{ paddingBottom: 28 }}
      >
        <TouchableOpacity
          onPress={() => {
            if (!isLoggedIn) {
              Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để ứng tuyển', [
                { text: 'Đăng nhập', onPress: () => router.push('/(auth)/login') },
                { text: 'Huỷ', style: 'cancel' },
              ])
              return
            }
            apply.mutate()
          }}
          disabled={apply.isPending}
          className="bg-brand rounded-xl py-4 items-center"
          style={{ opacity: apply.isPending ? 0.7 : 1 }}
        >
          {apply.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Ứng tuyển ngay</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
