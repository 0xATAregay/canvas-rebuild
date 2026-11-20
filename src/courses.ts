export type Assignment = {
  id: string
  name: string
  group: string
  due: string
  submitted?: string
  status: 'graded' | 'late' | 'upcoming'
  points: number
  score: number | null
}

type Category = { name: string; weight: number }
type Lesson = { name: string; content: string }
type Module = { title: string; lessons: Lesson[] }

export type Course = {
  id: string
  name: string
  code: string
  color: string
  icon: string
  instructor: string
  overview: string
  announcement?: string
  modulesFirst?: boolean
  resources: string[]
  modules: Module[]
  categories: Category[]
  assignments: Assignment[]
}

const plans = [
  { id: 'calculus', name: 'Calculus I', code: 'MATH 1451', color: 'berry', icon: 'function', instructor: 'Dr. Avery Kim', overview: 'Explore limits, derivatives, and integrals through models of change and accumulation.', resources: ['Modules', 'Syllabus'], target: 90,
    groups: [['Practice', 0, 'Limits and Continuity Worksheet', 'Derivative Applications'], ['Exams', 0, 'Exam 1 · Limits and Derivatives', 'Exam 2 · Integration']], next: 'Integration Review',
    lessons: [['Limits and derivatives', 'Continuity at a point', 'Use one-sided limits to check where a piecewise function is continuous.'], ['Integrals and applications', 'Area under a curve', 'Compare a Riemann sum with the exact area from a definite integral.']] },
  { id: 'chemistry-lecture', name: 'Chemistry I Lecture', code: 'CHEM 1307', color: 'teal', icon: 'atom', instructor: 'Dr. Morgan Patel', overview: 'Connect atomic structure and bonding to the reactions and properties you observe in the laboratory.', resources: ['Textbook', 'Chapter Modules', 'Post-Class Questions', 'Study Tools'], target: 82,
    groups: [['Homework', 20, 'Chapter 1 · Measurements', 'Chapter 2 · Atomic Structure'], ['Post-Class Questions', 20, 'Periodic Trends Review', 'Bonding Reflection'], ['Tests', 60, 'Test 1 · Foundations', 'Test 2 · Reactions']], next: 'Final Exam Review',
    lessons: [['Atomic structure', 'Periodic trends', 'Compare atomic radius and ionization energy across a period.'], ['Chemical reactions', 'Balancing equations', 'Balance a reaction by conserving each element before checking charge.']] },
  { id: 'chemistry-lab', name: 'Chemistry Lab', code: 'CHEM 1107', color: 'blue', icon: 'flask', instructor: 'Dr. Morgan Patel', overview: 'Practice measurement, observation, and scientific reporting in a first-semester chemistry lab.', announcement: 'Lab final review materials are available under Quizzes & Exams.', resources: ['Start Here', 'Syllabus', 'Experiments', 'Safety Activity', 'Quizzes & Exams', 'Absences', 'Resources'], target: 86,
    groups: [['Pre-Labs', 13, 'Pre-Lab 1 · Measurement', 'Pre-Lab 2 · Solutions'], ['Lab Reports', 60, 'Lab 1 · Density Report', 'Lab 2 · Solution Report'], ['Post-Labs', 13, 'Post-Lab 1 · Uncertainty', 'Post-Lab 2 · Dilution'], ['Lab Summaries', 5, 'Measurement Summary', 'Solutions Summary'], ['Final Exam', 8, 'Practical · Measurement', 'Practical · Solutions'], ['Other Assessments', 1, 'Syllabus Quiz', 'Safety Check']], next: 'Lab Notebook Review',
    lessons: [['Getting started', 'Lab safety checklist', 'Review protective equipment and locate the safety stations before starting a lab.'], ['Experiments', 'Density and measurement', 'Record repeated measurements and use the spread to discuss uncertainty.']] },
  { id: 'coding', name: 'Engineering Coding', code: 'ENGR 1330', color: 'indigo', icon: 'code', instructor: 'Prof. Riley Chen', overview: 'Use Python to solve engineering problems with data, functions, and visualizations.', modulesFirst: true, resources: ['Syllabus'], target: 88,
    groups: [['Assignments', 10, 'Python Setup', 'Data Types Exercise'], ['Projects', 30, 'Project 1 · Unit Converter', 'Project 2 · Data Explorer'], ['Quizzes', 20, 'Quiz 1 · Expressions', 'Quiz 2 · Functions'], ['Exams', 20, 'Exam 1 · Python Basics', 'Exam 2 · Data Analysis'], ['Labs', 20, 'Lab · Plotting', 'Lab · File Input']], next: 'Project 3 · Sensor Dashboard',
    lessons: [['Lectures', 'Lecture · Python fundamentals', 'Write a function that converts a temperature and test its boundary cases.'], ['Data and visualization', 'Lecture · Working with tables', 'Summarize a data table and choose a chart that fits the comparison.']] },
  { id: 'thinking-lab', name: 'Computational Thinking Lab', code: 'ENGR 1330L', color: 'amber', icon: 'terminal', instructor: 'Prof. Riley Chen', overview: 'Develop and test solutions in notebook-based computational labs.', modulesFirst: true, resources: ['Syllabus'], target: 81,
    groups: [['Lab Assignments', 0, 'Lab-00 · Notebook Setup', 'Lab-01 · Functions'], ['Lab Projects', 0, 'Lab-02 · Plotting', 'Lab-03 · Simulation']], next: 'Lab-04 · Iteration',
    lessons: [['Labs', 'Lab000.ipynb', 'Create a notebook, evaluate a simple expression, and explain the result in a Markdown cell.'], ['Applied labs', 'Lab003.ipynb', 'Simulate repeated trials and compare the results with a theoretical expectation.']] },
  { id: 'design', name: 'Engineering Design', code: 'ENGR 1340', color: 'rose', icon: 'draft', instructor: 'Prof. Jordan Rivera', overview: 'Develop an engineering concept from requirements and sketches through a tested prototype.', announcement: 'Bring a one-page prototype test plan to the next design studio.', resources: ['Modules', 'Syllabus', 'Project Brief'], target: 91,
    groups: [['Exams', 30, 'Exam 1 · Design Process', 'Exam 2 · Trade-offs'], ['Assignments', 10, 'Safety Certificate', 'Design Constraints Exercise'], ['Project Assignments', 40, 'Concept Proposal', 'Preliminary Design Review'], ['Project Demonstration', 20, 'Prototype Test', 'Project Showcase']], next: 'Design Portfolio Reflection',
    lessons: [['Design foundations', 'Requirements and constraints', 'Separate measurable requirements from constraints and assumptions.'], ['Project studio', 'Prototype test plan', 'Choose a test method and write a pass criterion for each requirement.']] },
] as const

const isoDate = (month: number, day: number) =>
  new Date(Date.UTC(2026, month - 1, day, 23, 59)).toISOString()

// Category averages vary while their weighted (or points-based) adjustments cancel out.
const categoryAdjustments: Record<string, readonly number[]> = {
  calculus: [2, -2],
  'chemistry-lecture': [3, 0, -1],
  'chemistry-lab': [1, 0, -1],
  coding: [3, -1],
  'thinking-lab': [2, -2],
  design: [1, -3],
}

export const courses: Course[] = plans.map((plan) => {
  const categories = plan.groups.map(([name, weight]) => ({ name, weight }))
  const assignments: Assignment[] = plan.groups.flatMap(([group, , ...names], categoryIndex) =>
    names.map((name, index) => {
      const due = isoDate(9 + index, 4 + categoryIndex * 3)
      const late = index === 1 && categoryIndex === 0
      const variation = 2 + categoryIndex % 2
      const adjustment = categoryAdjustments[plan.id]?.[categoryIndex] ?? 0
      return {
        id: `${categoryIndex}-${index}`, name, group, due,
        submitted: new Date(Date.parse(due) + (late ? 2 : -4) * 3600000).toISOString(),
        status: late ? 'late' : 'graded', points: 100,
        score: plan.target + adjustment + (index === 0 ? -variation : variation),
      }
    }),
  )
  return {
    ...plan, resources: [...plan.resources], categories,
    modules: plan.lessons.map(([title, name, content], index) => ({
      title,
      lessons: [
        { name, content },
        { name: plan.id === 'thinking-lab' ? `Lab00${index === 0 ? 1 : 4}.ipynb` : `${title} · Practice`, content: `${content} Document your reasoning and one check of your result.` },
      ],
    })),
    assignments: [...assignments, { id: 'upcoming', name: plan.next, group: categories[0].name, due: isoDate(12, 2), points: 100, score: null, status: 'upcoming' }],
  }
})
