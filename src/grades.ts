import type { Course } from './courses.ts'

export function calculateGrades(course: Course, gradedOnly = true, overrides: Record<string, number> = {}) {
  const categories = course.categories.map((category) => {
    const rows = course.assignments.filter((row) => row.group === category.name)
    const included = rows.filter((row) => !gradedOnly || (overrides[row.id] ?? row.score) !== null)
    const earned = included.reduce((sum, row) => sum + (overrides[row.id] ?? row.score ?? 0), 0)
    const possible = included.reduce((sum, row) => sum + row.points, 0)
    return { ...category, earned, possible, percent: possible ? 100 * earned / possible : null }
  })
  const weighted = course.categories.some((category) => category.weight > 0)
  const earned = categories.reduce((sum, category) => sum + category.earned, 0)
  const possible = categories.reduce((sum, category) => sum + category.possible, 0)
  const activeWeight = categories.reduce((sum, category) => sum + (category.percent === null ? 0 : category.weight), 0)
  const weightedTotal = categories.reduce((sum, category) => sum + (category.percent ?? 0) * category.weight, 0)
  const total = weighted
    ? activeWeight ? weightedTotal / activeWeight : null
    : possible ? 100 * earned / possible : null
  return { categories, weighted, total, earned, possible }
}

export function letter(percent: number) {
  if (percent >= 90) return 'A'
  if (percent >= 80) return 'B'
  if (percent >= 70) return 'C'
  if (percent >= 60) return 'D'
  return 'F'
}

export const percentLabel = (value: number | null) =>
  value === null ? '—' : `${Number(value.toFixed(2))}%`
