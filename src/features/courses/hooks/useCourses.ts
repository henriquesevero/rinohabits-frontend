import { useCallback, useEffect, useState } from 'react'
import { courseService } from '../services/courseService'
import type { Course, CourseStatus, CreateCoursePayload, UpdateCoursePayload } from '../types/course.types'

export function useCourses(statusFilter?: CourseStatus) {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [justCompletedCourse, setJustCompletedCourse] = useState<Course | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await courseService.list(statusFilter)
      setCourses(data)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    refresh()
  }, [refresh])

  function detectCompletion(previous: Course | undefined, updated: Course) {
    if (previous && previous.status !== 'concluido' && updated.status === 'concluido') {
      setJustCompletedCourse(updated)
    }
  }

  const createCourse = useCallback(
    async (payload: CreateCoursePayload) => {
      await courseService.create(payload)
      await refresh()
    },
    [refresh],
  )

  const registerStudy = useCallback(async (courseId: string, hoursLoggedNow: number) => {
    const updated = await courseService.registerStudy(courseId, hoursLoggedNow)
    setCourses((current) => {
      detectCompletion(current.find((c) => c.id === courseId), updated)
      return current.map((c) => (c.id === updated.id ? updated : c))
    })
    return updated
  }, [])

  const changeStatus = useCallback(
    async (courseId: string, status: CourseStatus) => {
      const updated = await courseService.update(courseId, { status })
      setCourses((current) => {
        detectCompletion(current.find((c) => c.id === courseId), updated)
        return current.map((c) => (c.id === updated.id ? updated : c))
      })
      await refresh()
    },
    [refresh],
  )

  const deleteCourse = useCallback(
    async (courseId: string) => {
      await courseService.remove(courseId)
      await refresh()
    },
    [refresh],
  )

  const updateCourse = useCallback(async (courseId: string, payload: UpdateCoursePayload): Promise<Course> => {
    const updated = await courseService.update(courseId, payload)
    setCourses((current) => current.map((c) => (c.id === updated.id ? updated : c)))
    return updated
  }, [])

  const updateCover = useCallback((courseId: string, coverUrl: string) => {
    setCourses((current) => current.map((c) => (c.id === courseId ? { ...c, coverUrl } : c)))
  }, [])

  const clearJustCompleted = useCallback(() => setJustCompletedCourse(null), [])

  const reorderCourses = useCallback(async (reorderedSubsetIds: string[]) => {
    let allOrderedIds: string[] = []

    setCourses((current) => {
      const byId = new Map(current.map((c) => [c.id, c]))
      const reorderedSet = new Set(reorderedSubsetIds)

      // Positions (indices) in global array occupied by the reordered subset
      const positions: number[] = []
      current.forEach((c, i) => { if (reorderedSet.has(c.id)) positions.push(i) })

      // Slot the reordered items back into those same positions
      const result = [...current]
      reorderedSubsetIds.forEach((id, i) => { result[positions[i]] = byId.get(id)! })

      allOrderedIds = result.map((c) => c.id)
      return result
    })

    await courseService.reorderCourses(allOrderedIds)
  }, [])

  return {
    courses,
    isLoading,
    createCourse,
    updateCourse,
    registerStudy,
    changeStatus,
    deleteCourse,
    updateCover,
    refresh,
    reorderCourses,
    justCompletedCourse,
    clearJustCompleted,
  }
}
