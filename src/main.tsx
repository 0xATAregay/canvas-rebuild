import { StrictMode, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowRight, Atom, BookOpen, CalendarDays, Check, ChevronDown, ChevronRight, ClipboardList, CodeXml, DraftingCompass, FileText, FlaskConical, GraduationCap, LayoutDashboard, Menu, Printer, Sigma, Terminal, X } from 'lucide-react'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/plus-jakarta-sans'
import { courses } from './courses'
import type { Assignment, Course } from './courses'
import { calculateGrades, letter, percentLabel } from './grades'
import './style.css'

const icons = { function: Sigma, atom: Atom, flask: FlaskConical, code: CodeXml, terminal: Terminal, draft: DraftingCompass }
const courseIcon = (course: Course) => icons[course.icon as keyof typeof icons]
const courseLink = (course: Course, page = 'home') => `#/courses/${course.id}/${page}`
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const dateLabel = (date: string) => dateFormat.format(new Date(date))
const submissionFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
const gradeLabel = (value: number | null) => value === null ? '—' : `${percentLabel(value)} (${letter(value)})`

function Dialog({ title, children, onClose, drawer = false }: { title: string; children: ReactNode; onClose: () => void; drawer?: boolean }) {
  return <dialog className={drawer ? 'drawer' : 'dialog'} ref={(node) => { if (node && !node.open) node.showModal() }}
    onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }} aria-label={title}>
    <div className="dialog-inner">
      <div className="panel-title"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      {children}
    </div>
  </dialog>
}

function Dashboard() {
  return <main id="main" className="dashboard" tabIndex={-1}>
    <header className="dashboard-intro">
      <p className="eyebrow">Student workspace</p>
      <h1>Dashboard</h1>
      <p>Pick a course to view your coursework and grades.</p>
    </header>
    <div className="section-heading"><h2>My courses <span>{courses.length}</span></h2><span className="term"><CalendarDays size={16} /> Fall 2026</span></div>
    <div className="course-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {courses.map((course) => {
        const Icon = courseIcon(course)
        return <article className={`course-card theme-${course.color}`} key={course.id}>
          <a className="card-home" href={courseLink(course)}>
            <div className="card-art"><span className="cover-code">{course.code}</span><Icon className="cover-mark" strokeWidth={1.25} /></div>
            <div className="card-title"><h3>{course.name}</h3><p>{course.instructor}</p></div>
          </a>
          <div className="card-footer"><a href={courseLink(course, 'grades')}><ClipboardList size={17} /> Grades</a><a href={courseLink(course)} aria-label={`Open ${course.name}`}><ArrowRight size={19} /></a></div>
        </article>
      })}
    </div>
  </main>
}

function ModuleList({ course, openResource }: { course: Course; openResource: (title: string, text: string) => void }) {
  const [open, setOpen] = useState(() => new Set(course.modules.map((module) => module.title)))
  return <section className="module-list" id="modules" aria-label="Course modules">
    <div className="section-heading"><h2>Modules</h2><button className="button" onClick={() => setOpen(new Set(open.size ? [] : course.modules.map((module) => module.title)))}>{open.size ? 'Collapse all' : 'Expand all'}</button></div>
    {course.modules.map((module) => <section className="module panel" key={module.title}>
      <button className="module-heading" aria-expanded={open.has(module.title)} onClick={() => {
        const updated = new Set(open)
        if (updated.has(module.title)) updated.delete(module.title)
        else updated.add(module.title)
        setOpen(updated)
      }}>{open.has(module.title) ? <ChevronDown size={17} /> : <ChevronRight size={17} />}{module.title}</button>
      {open.has(module.title) && module.lessons.map((lesson) => <button className="lesson" key={lesson.name} onClick={() => openResource(lesson.name, lesson.content)}><FileText size={17} /> {lesson.name}</button>)}
    </section>)}
  </section>
}

function Home({ course, modulesOnly }: { course: Course; modulesOnly: boolean }) {
  const [resource, setResource] = useState<{ title: string; text: string } | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const Icon = courseIcon(course)
  const next = course.assignments.find((row) => row.status === 'upcoming')!
  const recent = [...course.assignments].filter((row) => row.score !== null).sort((a, b) => b.due.localeCompare(a.due))[0]
  const openResource = (title: string, text: string) => setResource({ title, text })
  const resourceText: Record<string, string> = {
    Syllabus: `${course.overview} Your instructor is ${course.instructor}. The Grades page lists assessment categories and how the final grade is calculated.`,
    Textbook: 'Review the chapters on atomic structure, bonding, and reactions before their associated practice sessions.',
    'Post-Class Questions': 'Explain how electron configuration helps predict common ion charges. Then compare your prediction with the periodic table.',
    'Study Tools': 'Make a flashcard for each periodic trend and explain the underlying cause before checking your answer.',
    'Start Here': 'Review lab safety and open the first experiment in Modules before starting your notebook.',
    'Safety Activity': 'Identify the eyewash, emergency shower, and exits before beginning experimental work.',
    'Quizzes & Exams': 'The practical review covers measurement precision, dilution, and safe lab procedure. View Grades for scored assessments.',
    Absences: 'Review the missed experiment in Modules and bring a catch-up plan to your instructor.',
    Resources: 'Keep a lab notebook with a dated procedure, raw observations, calculations, and a short conclusion.',
    'Project Brief': 'Design a device to meet a measurable user need. Submit requirements, a prototype, and evidence from at least one test.',
  }
  return <div className="content-layout">
    <div className="min-w-0">
      {modulesOnly ? <><h1 className="page-title">{course.name}</h1><ModuleList course={course} openResource={openResource} /></> : <>
        {course.announcement && <div className="announcement panel"><Activity size={19} /><div><strong>Recent announcement</strong><p>{course.announcement}</p></div></div>}
        <header className={`course-hero theme-${course.color} ${course.id === 'calculus' ? 'calculus-hero' : ''}`}>
          <div><p className="eyebrow">{course.code} · Fall 2026</p><h1>{course.name}</h1><p>{course.overview}</p></div>
          <Icon className="hero-icon" strokeWidth={1.15} aria-hidden="true" />
        </header>
        {!course.modulesFirst && <div className="resource-grid">{course.resources.map((name) =>
          ['Modules', 'Chapter Modules', 'Experiments'].includes(name)
            ? <a className="resource" key={name} href={courseLink(course, 'modules')}><BookOpen size={17} />{name}</a>
            : <button className="resource" key={name} onClick={() => openResource(name, resourceText[name])}><FileText size={17} />{name}</button>,
        )}</div>}
        {course.modulesFirst ? <ModuleList course={course} openResource={openResource} /> : <section className="welcome panel"><h2>Welcome to {course.name}</h2>
          <p>{course.overview}</p><div className="instructor"><span>Instructor</span><strong>{course.instructor}</strong></div>
          {course.id === 'chemistry-lecture' && <p><strong>Final exam review</strong> · {dateLabel(next.due)}</p>}
          {course.id === 'chemistry-lab' && <p><strong>Laboratory</strong> · Science Hall, room 214<br /><strong>Teaching assistant</strong> · Jamie Ellis</p>}
        </section>}
      </>}
    </div>
    <aside className="side-stack">
      <section className="panel side-panel"><h2>To do</h2>
        {dismissed ? <p className="muted">You’re caught up.</p> : <div className="task"><CalendarDays size={17} /><div><button className="text-link" onClick={() => openResource(next.name, `Due ${dateLabel(next.due)} at 11:59 p.m. UTC · ${next.points} points. Review the related topics in Modules and prepare a short written summary.`)}>{next.name}</button><p>{dateLabel(next.due)} · {next.points} points</p></div><button className="icon-button" aria-label="Dismiss to-do item" onClick={() => setDismissed(true)}><X size={15} /></button></div>}
      </section>
      <section className="panel side-panel"><h2>Recent feedback</h2><div className="task"><Check size={17} className="text-emerald-700" /><div><a className="text-link" href={courseLink(course, 'grades')}>{recent.name}</a><p>{recent.score} out of {recent.points}</p></div></div></section>
    </aside>
    {resource && <Dialog title={resource.title} onClose={() => setResource(null)}><p>{resource.text}</p></Dialog>}
  </div>
}

const sorters: Record<string, (a: Assignment, b: Assignment, overrides: Record<string, number>) => number> = {
  due: (a, b) => a.due.localeCompare(b.due),
  name: (a, b) => a.name.localeCompare(b.name),
  group: (a, b) => a.group.localeCompare(b.group) || a.due.localeCompare(b.due),
  score: (a, b, overrides) => (overrides[b.id] ?? b.score ?? -1) - (overrides[a.id] ?? a.score ?? -1),
}

function Grades({ course, initialSort }: { course: Course; initialSort: string }) {
  const [selection, setSelection] = useState(course.id)
  const [arrangement, setArrangement] = useState(initialSort)
  const [sort, setSort] = useState(initialSort)
  const [gradedOnly, setGradedOnly] = useState(true)
  const [details, setDetails] = useState(false)
  const [tab, setTab] = useState<'assignments' | 'categories'>('assignments')
  const [overrides, setOverrides] = useState<Record<string, number>>({})
  const [active, setActive] = useState<Assignment | null>(null)
  const hasWhatIf = Object.keys(overrides).length > 0
  const totals = calculateGrades(course, gradedOnly, overrides)
  const rows = [...course.assignments].sort((a, b) => sorters[sort](a, b, overrides))
  return <div className="content-layout grades-layout">
    <div className="min-w-0">
      <div className="grade-heading"><div><p className="eyebrow">{course.code}</p><h1>Grades</h1><p className="muted">{course.name} · Fall 2026</p></div><button className="button" onClick={() => window.print()}><Printer size={17} /> Print grades</button></div>
      <div className="compact-grade"><span>{hasWhatIf ? 'What-if total' : gradedOnly ? 'Current grade' : 'All assignments'}<small className="sample-grades">Sample grades</small></span><strong>{gradeLabel(totals.total)}</strong></div>
      <form className="filters" onSubmit={(event) => {
        event.preventDefault()
        if (selection !== course.id) location.hash = `/courses/${selection}/grades?sort=${arrangement}`
        else setSort(arrangement)
      }}>
        <div className="filter-field"><label htmlFor="course-select">Course</label><select id="course-select" value={selection} onChange={(event) => setSelection(event.target.value)}>{courses.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>
        <div className="filter-field"><label htmlFor="grade-arrangement">Arrange by</label><select id="grade-arrangement" value={arrangement} onChange={(event) => setArrangement(event.target.value)}><option value="due">Due date</option><option value="name">Name</option><option value="group">Category</option><option value="score">Score</option></select></div>
        <button className="button primary">Apply</button>
      </form>
      <div className="panel grade-panel">
        <div className="view-tabs" aria-label="Grade view"><button aria-pressed={tab === 'assignments'} onClick={() => setTab('assignments')}>Assignments</button><button aria-pressed={tab === 'categories'} onClick={() => setTab('categories')}>Category summary</button></div>
        {tab === 'assignments' && <p className="scroll-hint">Scroll the table to see statuses and scores.</p>}
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Scrollable grade table">
          {tab === 'assignments' ? <table className="assignments">
            <thead><tr>{['Name', 'Due', 'Submitted (UTC)', 'Status', 'Score'].map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id}>
              <th scope="row"><button className="text-link" onClick={() => setActive(row)}>{row.name}</button><span className="subline">{row.group}</span>{details && <span className="subline detail-line">{row.points} possible points · {row.score === null ? 'Awaiting a grade' : 'Sample score recorded'}</span>}</th>
              <td>{dateLabel(row.due)}</td><td>{row.submitted ? submissionFormat.format(new Date(row.submitted)) : '—'}</td>
              <td><span className={`status ${row.status}`}>{row.status}</span></td>
              <td><button className="score" aria-label={`What-if score for ${row.name}`} onClick={() => setActive(row)}>{overrides[row.id] ?? row.score ?? '—'} / {row.points}{overrides[row.id] !== undefined && <span className="subline">What-if</span>}</button></td>
            </tr>)}</tbody>
          </table> : <table><thead><tr><th scope="col">Category</th><th scope="col">Points</th><th scope="col">Score</th>{totals.weighted && <th scope="col">Weight</th>}</tr></thead><tbody>
            {totals.categories.map((group) => <tr key={group.name}><th scope="row">{group.name}</th><td>{group.earned} / {group.possible}</td><td>{percentLabel(group.percent)}</td>{totals.weighted && <td>{group.weight}%</td>}</tr>)}
          </tbody></table>}
        </div>
        <div className="table-total"><strong>{hasWhatIf ? 'What-if total' : 'Total'}</strong><strong>{gradeLabel(totals.total)}</strong></div>
      </div>
    </div>
    <aside className="side-stack">
      <section className="panel side-panel grade-summary">
        <h2>{hasWhatIf ? 'What-if total' : gradedOnly ? 'Current grade' : 'All assignments'}<small className="sample-grades">Sample grades</small></h2>
        <strong className="grade-number" aria-live="polite">{gradeLabel(totals.total)}</strong>
        <button className="button" onClick={() => { setDetails(!details); setTab('assignments') }}>{details ? 'Hide all details' : 'Show all details'}</button>
        <label className="check-label"><input type="checkbox" checked={gradedOnly} onChange={(event) => setGradedOnly(event.target.checked)} /> Calculate using graded assignments only</label>
        <p className="muted">Select a score to try a what-if grade.</p>
        {hasWhatIf && <button className="text-link" onClick={() => setOverrides({})}>Reset what-if scores</button>}
      </section>
      <section className="panel side-panel weights"><h2>{totals.weighted ? 'Category weights' : 'Points by category'}</h2>
        <table><thead><tr><th scope="col">Group</th><th scope="col">{totals.weighted ? 'Weight' : 'Points'}</th></tr></thead><tbody>{totals.categories.map((group) => <tr key={group.name}><th scope="row">{group.name}</th><td>{totals.weighted ? `${group.weight}%` : `${group.earned} / ${group.possible}`}</td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th><td>{totals.weighted ? `${totals.categories.reduce((sum, group) => sum + group.weight, 0)}%` : `${totals.earned} / ${totals.possible}`}</td></tr></tfoot></table>
      </section>
    </aside>
    {active && <Dialog title={active.name} onClose={() => setActive(null)}>
      <p className="muted">{active.group} · Due {dateLabel(active.due)} · Sample score {active.score ?? '—'} / {active.points}</p>
      <form className="what-if" onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('score')
        if (typeof value === 'string' && value.trim() !== '') {
          setOverrides({ ...overrides, [active.id]: Number(value) })
          setActive(null)
        }
      }}><label>What-if score<input name="score" type="number" required min="0" max={active.points} step="0.01" defaultValue={overrides[active.id] ?? active.score ?? ''} /></label><button className="button primary">Apply score</button></form>
    </Dialog>}
  </div>
}

function App() {
  const [hash, setHash] = useState(location.hash)
  const [drawer, setDrawer] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  useEffect(() => {
    const onHash = () => { setHash(location.hash); setDrawer(false); setMobileNav(false); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const [path, query] = hash.split('?')
  const [, section, id, view] = path.split('/')
  const course = section === 'courses' ? courses.find((item) => item.id === id) : undefined
  const page = view === 'grades' ? 'grades' : view === 'modules' ? 'modules' : 'home'
  const initialSort = new URLSearchParams(query).get('sort') ?? 'due'
  useEffect(() => { document.title = course ? `${course.name} · ${page === 'grades' ? 'Grades' : page === 'modules' ? 'Modules' : 'Home'} · Coursework` : 'Dashboard · Coursework' }, [course, page])
  return <>
    <a className="skip" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
    <nav className="global-nav" aria-label="Global navigation">
      <a href="#/" className="brand" aria-label="Coursework dashboard"><GraduationCap size={26} /></a>
      <a href="#/" aria-current={!course ? 'page' : undefined} className="global-item"><LayoutDashboard size={21} /><span>Dashboard</span></a>
      <button className="global-item" aria-expanded={drawer} aria-current={course ? 'true' : undefined} onClick={() => setDrawer(true)}><BookOpen size={21} /><span>Courses</span></button>
    </nav>
    <div className="app-shell">
      <header className="topbar">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Coursework</a><ChevronRight size={15} />{course ? <><a href={courseLink(course)}>{course.name}</a><ChevronRight size={15} /><span aria-current="page">{page[0].toUpperCase() + page.slice(1)}</span></> : <span aria-current="page">Dashboard</span>}</nav>
      </header>
      {course ? <div className="course-shell">
        <button className="button mobile-menu" aria-expanded={mobileNav} onClick={() => setMobileNav(!mobileNav)}><Menu size={18} /> Course navigation</button>
        <nav className={`course-nav ${mobileNav ? 'open' : ''}`} aria-label="Course navigation">
          <p>Fall 2026</p>
          {['home', 'modules', 'grades'].map((item) => <a key={item} href={courseLink(course, item)} aria-current={item === page ? 'page' : undefined}>{item[0].toUpperCase() + item.slice(1)}</a>)}
        </nav>
        <main className="course-content" id="main" tabIndex={-1}>
          {page === 'grades' ? <Grades key={hash} course={course} initialSort={Object.hasOwn(sorters, initialSort) ? initialSort : 'due'} /> : <Home key={hash} course={course} modulesOnly={page === 'modules'} />}
        </main>
      </div> : <Dashboard />}
    </div>
    {drawer && <Dialog title="Courses" drawer onClose={() => setDrawer(false)}><div className="drawer-courses">{courses.map((item) => {
      const Icon = courseIcon(item)
      return <a key={item.id} href={courseLink(item)} onClick={() => setDrawer(false)} className={`theme-${item.color}`}><span className="drawer-icon"><Icon size={20} /></span><span><strong>{item.name}</strong><small>{item.code} · Fall 2026</small></span><ChevronRight size={17} /></a>
    })}</div></Dialog>}
  </>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
