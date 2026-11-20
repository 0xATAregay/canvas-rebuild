import { expect, test } from '@playwright/test'

const grades = [
  ['Calculus I', '90% (A)'],
  ['Chemistry I Lecture', '82% (B)'],
  ['Chemistry Lab', '86% (B)'],
  ['Engineering Coding', '88% (B)'],
  ['Computational Thinking Lab', '81% (B)'],
  ['Engineering Design', '91% (A)'],
]

test('all six course homes, grades, and drawer links work', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.course-card')).toHaveCount(6)
  for (const [name, grade] of grades) {
    await page.getByRole('heading', { name, exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
    await page.getByRole('navigation', { name: 'Course navigation' }).getByRole('link', { name: 'Grades' }).click()
    await expect(page.locator('.grade-number')).toHaveText(grade)
    await expect(page.locator('.grade-summary').getByText('Sample grades')).toBeVisible()
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Courses', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Courses' })
  await expect(drawer.getByRole('link')).toHaveCount(6)
  await drawer.getByRole('link', { name: /Engineering Coding/ }).click()
  await expect(drawer).toHaveCount(0)
  await page.getByRole('button', { name: 'Collapse all' }).click()
  await expect(page.getByRole('button', { name: 'Lecture · Python fundamentals' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Lectures', exact: true }).click()
  await page.getByRole('button', { name: 'Lecture · Python fundamentals' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('grade controls update rows, categories, and computed totals', async ({ page }) => {
  await page.goto('./#/courses/calculus/grades')
  await expect(page.locator('.grade-number')).toHaveText('90% (A)')
  await page.reload()
  await expect(page.locator('.grade-number')).toHaveText('90% (A)')
  await page.getByRole('button', { name: 'Show all details' }).click()
  await expect(page.getByText('100 possible points · Awaiting a grade')).toBeVisible()
  await page.getByLabel('Calculate using graded assignments only').uncheck()
  await expect(page.locator('.grade-number')).toHaveText('72% (C)')
  await page.getByLabel('Calculate using graded assignments only').check()
  await page.getByRole('button', { name: 'What-if score for Integration Review' }).click()
  await page.getByRole('spinbutton', { name: 'What-if score' }).fill('100')
  await page.getByRole('button', { name: 'Apply score' }).click()
  await expect(page.locator('.grade-number')).toHaveText('92% (A)')
  await page.getByRole('button', { name: 'Reset what-if scores' }).click()
  await page.getByRole('button', { name: 'Category summary' }).click()
  await expect(page.getByRole('columnheader', { name: 'Category', exact: true })).toBeVisible()
  await page.getByLabel('Course', { exact: true }).selectOption('coding')
  await page.getByLabel('Arrange by').selectOption('name')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.locator('.grade-number')).toHaveText('88% (B)')
  await expect(page.getByLabel('Arrange by')).toHaveValue('name')
  await expect(page.locator('.assignments tbody tr').first()).toContainText('Data Types Exercise')
})

test('mobile navigation fits the viewport and grade table scrolls independently', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.getByRole('button', { name: 'Courses', exact: true }).click()
  await page.getByRole('dialog').getByRole('link', { name: /Computational Thinking Lab/ }).click()
  await page.getByRole('button', { name: 'Course navigation' }).click()
  await page.getByRole('navigation', { name: 'Course navigation' }).getByRole('link', { name: 'Grades' }).click()
  await expect(page.locator('.grade-number')).toHaveText('81% (B)')
  await expect(page.locator('.compact-grade').getByText('Sample grades')).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  expect(await page.getByRole('region', { name: 'Scrollable grade table' }).evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
})
