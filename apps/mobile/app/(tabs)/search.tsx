import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api'

const POPULAR = ['Lập trình viên', 'Kế toán', 'Marketing', 'Thiết kế', 'Sales', 'Kỹ thuật']
const LOCATIONS = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Bình Dương']

export default function SearchTab() {
  const router    = useRouter()
  const [q, setQ]         = useState('')
  const [loc, setLoc]     = useState('')
  const [searched, setSearched] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey:  ['search', q, loc],
    queryFn:   () => jobsApi.list({ q: q || undefined, location: loc || undefined, limit: 30 }),
    enabled:   searched,
  })

  const doSearch = () => {
    setSearched(true)
    refetch()
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-3">Tìm kiếm việc làm</Text>

        <TextInput
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-2 bg-gray-50"
          placeholder="🔍  Vị trí, kỹ năng, công ty..."
          value={q}
          onChangeText={setQ}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        <TextInput
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-3 bg-gray-50"
          placeholder="📍  Địa điểm (Hà Nội, HCM...)"
          value={loc}
          onChangeText={setLoc}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />

        <TouchableOpacity
          onPress={doSearch}
          className="bg-brand rounded-xl py-3 items-center"
        >
          <Text className="text-white font-bold">Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {!searched ? (
        <View className="px-4 py-5">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Tìm kiếm phổ biến
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {POPULAR.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => { setQ(p); setSearched(true) }}
                className="border border-brand/30 bg-brand-50 rounded-full px-3.5 py-1.5"
              >
                <Text className="text-sm font-medium text-brand">{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Theo thành phố
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {LOCATIONS.map(l => (
              <TouchableOpacity
                key={l}
                onPress={() => { setLoc(l); setSearched(true) }}
                className="border border-gray-200 bg-white rounded-full px-3.5 py-1.5"
              >
                <Text className="text-sm text-gray-700">📍 {l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#19734E" />
        </View>
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Text className="text-sm text-gray-500 mb-3">
              {data?.meta?.total ?? 0} kết quả
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/jobs/${item.id}`)}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
            >
              <Text className="font-bold text-gray-900">{item.title}</Text>
              <Text className="text-gray-500 text-sm mt-0.5">{item.employer?.company?.name}</Text>
              <View className="flex-row gap-2 mt-2">
                <Text className="text-xs text-brand font-semibold">
                  {item.salaryMin ? `${(item.salaryMin/1e6).toFixed(0)}–${(item.salaryMax/1e6).toFixed(0)} triệu` : 'Thỏa thuận'}
                </Text>
                {item.location && <Text className="text-xs text-gray-400">• {item.location}</Text>}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-3xl mb-2">😕</Text>
              <Text className="text-gray-500">Không có kết quả phù hợp</Text>
            </View>
          }
        />
      )}
    </View>
  )
}
