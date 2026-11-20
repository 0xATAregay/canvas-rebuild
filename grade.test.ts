import assert from 'node:assert/strict'
import { test } from 'node:test'
import { courses } from './src/courses.ts'
import { calculateGrades, letter } from './src/grades.ts'

const expected = [90, 82, 86, 88, 81, 91]
for (const [index, course] of courses.entries()) {
  test(`${course.name} calculates the requested sample grade`, () => {
    const result = calculateGrades(course)
    assert.equal(result.total, expected[index])
    assert.equal(letter(result.total), index === 0 || index === 5 ? 'A' : 'B')
    assert.equal(result.categories.reduce((sum, group) => sum + group.weight, 0), result.weighted ? 100 : 0)
    assert.ok(course.assignments.every((row) => row.score === null || row.score >= 0 && row.score <= row.points))
    assert.ok(calculateGrades(course, false).total! < result.total)
    assert.ok(calculateGrades(course, true, { upcoming: 100 }).total! > result.total)
    assert.equal(calculateGrades(course).total, expected[index])
  })
}
