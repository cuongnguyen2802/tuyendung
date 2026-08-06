import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'

function JobCard({ job, onPress }: { job: any; onPress: () => void }) {
  const salaryText = job.salaryMin && job.salaryMax
    ? `${(job.salaryMin / 1_000_000).toFixed(0)}–${(job.salaryMax / 1_000_000).toFixed(0)} triệu`
    : 'Thỏa thuận'

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white mx-4 mb-3 rounded-2xl p-4 shadow-sm border border-gray-100"
      activeOpacity={0.85}
    >
      {/* Company + logo placeholder */}
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-11 h-11 rounded-xl bg-brand-50 items-center justify-center">
          <Text className="text-xl">🏢</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-400" numberOfLines={1}>
            {job.employer?.company?.name ?? 'Công ty'}
          </Text>
          <Text className="font-bold text-gray-900 text-sm leading-tight" numberOfLines={2}>
            {job.title}
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View className="flex-row flex-wrap gap-1.5">
        <View className="bg-brand-50 rounded-full px-2.5 py-1">
          <Text className="text-xs font-semibold text-brand">{salaryText}</Text>
        </View>
        {job.location && (
          <View className="bg-gray-100 rounded-full px-2.5 py-1">
            <Text className="text-xs text-gray-600">📍 {job.location}</Text>
          </View>
        )}
        {job.jobType && (
          <View className="bg-gray-100 rounded-full px-2.5 py-1">
            <Text className="text-xs text-gray-600">{job.jobType}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default function JobsTab() {
  const router  = useRouter()
  const user    = useAuthStore(s => s.user)
  const [q, setQ] = useState('')

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['jobs', q],
    queryFn:  () => jobsApi.list({ q: q || undefined, limit: 20 }),
  })

  const jobs = data?.data ?? []

  const renderItem = useCallback(({ item }: { item: any }) => (
    <JobCard job={item} onPress={() => router.push(`/jobs/${item.id}`)} />
  ), [router])

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-brand px-5 pt-14 pb-5">
        <Text className="text-white/80 text-sm">Xin chào, {user?.fullName?.split(' ').pop() ?? 'bạn'} 👋</Text>
        <Text className="text-white text-xl font-bold mt-0.5">Tìm việc phù hợp</Text>

        {/* Search bar */}
        <View className="mt-4 bg-white rounded-xl flex-row items-center px-3 py-2.5 gap-2">
          <Text>🔍</Text>
          <TextInput
            className="flex-1 text-sm text-gray-800"
            placeholder="Vị trí, công ty..."
            placeholderTextColor="#9CA3AF"
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ('')}>
              <Text className="text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Job list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#19734E" />
          <Text className="text-gray-400 mt-3 text-sm">Đang tải việc làm...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#19734E" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-gray-500 text-sm">Không tìm thấy việc làm phù hợp</Text>
            </View>
          }
        />
      )}
    </View>
  )
}
