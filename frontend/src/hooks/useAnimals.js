import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { fetchAnimals, fetchAnimalById, fetchShelters, fetchFortune, fetchStats, fetchAnimalsFromGov } from '../services/api'

export function useAnimals(filters = {}) {
  return useQuery({
    queryKey: ['animals', filters],
    queryFn: () => fetchAnimals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useInfiniteAnimals(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['animals', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchAnimals({ ...filters, page: pageParam, limit: 20 })
      return result
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.data.length < 20) return undefined
      return pages.length + 1
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAnimal(id) {
  return useQuery({
    queryKey: ['animal', id],
    queryFn: () => fetchAnimalById(id),
    enabled: !!id,
  })
}

export function useShelters() {
  return useQuery({
    queryKey: ['shelters'],
    queryFn: fetchShelters,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useFortune() {
  return useQuery({
    queryKey: ['fortune', new Date().toDateString()],
    queryFn: fetchFortune,
    staleTime: Infinity, // Fortune doesn't change during the day
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useAllAnimals() {
  return useQuery({
    queryKey: ['allAnimals'],
    queryFn: fetchAnimalsFromGov,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })
}
