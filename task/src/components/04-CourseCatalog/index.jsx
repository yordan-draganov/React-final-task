import { useMemo, useState } from 'react'
import { courses } from './data'

function SearchBar({ value, onChange }) {
  return (
    <input
      className="field"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Търси по име на курс"
    />
  )
}

function FilterPanel({
  category,
  level,
  onCategoryChange,
  onLevelChange,
  onClear,
}) {
  return (
    <div className="toolbar">
      <select
        className="select"
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="all">Всички категории</option>
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
        <option value="DevOps">DevOps</option>
      </select>

      <select
        className="select"
        value={level}
        onChange={(event) => onLevelChange(event.target.value)}
      >
        <option value="all">Всички нива</option>
        <option value="Начинаещ">Начинаещ</option>
        <option value="Среден">Среден</option>
        <option value="Напреднал">Напреднал</option>
      </select>

      <button type="button" className="button button--secondary" onClick={onClear}>
        Изчисти филтрите
      </button>
    </div>
  )
}

function SortControls({ sortBy, onSortChange }) {
  return (
    <div className="toolbar">
      <button
        type="button"
        className={`button ${sortBy === 'rating' ? '' : 'button--secondary'}`}
        onClick={() => onSortChange('rating')}
      >
        Сортирай по рейтинг
      </button>
      <button
        type="button"
        className={`button ${sortBy === 'students' ? '' : 'button--secondary'}`}
        onClick={() => onSortChange('students')}
      >
        Сортирай по студенти
      </button>
    </div>
  )
}

function CourseCard({ course }) {
  const levelTone = {
    Начинаещ: '#1d7f5f',
    Среден: '#d18f1b',
    Напреднал: '#b03a2e',
  }

  return (
    <article className="panel">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <span
          className="topic-list__item"
          style={{ background: `${levelTone[course.level]}1a`, color: levelTone[course.level] }}
        >
          {course.level}
        </span>
        <span className="muted">{course.category}</span>
      </div>
      <h4>{course.title}</h4>
      <p className="muted">Рейтинг: {course.rating.toFixed(1)} / 5.0</p>
      <p className="muted">Студенти: {course.students}</p>
      {course.rating >= 4.8 ? <p className="muted">Топ избор за мотивирани курсисти.</p> : null}
    </article>
  )
}

function StatsBar({ children }) {
  return <div className="grid-three">{children}</div>
}

export default function CourseCatalogTask() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState('all')
  const [sortBy, setSortBy] = useState('rating')

  const filteredCourses = useMemo(
    () =>
      courses
        .filter((course) =>
          course.title.toLowerCase().includes(search.trim().toLowerCase()),
        )
        .filter((course) => category === 'all' || course.category === category)
        .filter((course) => level === 'all' || course.level === level)
        .sort((firstCourse, secondCourse) => secondCourse[sortBy] - firstCourse[sortBy]),
    [category, level, search, sortBy],
  )

  const averageRating = filteredCourses.length
    ? (
        filteredCourses.reduce((sum, course) => sum + course.rating, 0) /
        filteredCourses.length
      ).toFixed(1)
    : '0.0'

  const totalStudents = filteredCourses.reduce(
    (sum, course) => sum + course.students,
    0,
  )

  return (
    <div className="stack">
      <div className="grid-two">
        <SearchBar value={search} onChange={setSearch} />
        <SortControls sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      <FilterPanel
        category={category}
        level={level}
        onCategoryChange={setCategory}
        onLevelChange={setLevel}
        onClear={() => {
          setCategory('all')
          setLevel('all')
          setSearch('')
        }}
      />

      <StatsBar>
        <div className="stat-card">
          <p className="stat-card__label">Намерени курсове</p>
          <p className="stat-card__value">{filteredCourses.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Среден рейтинг</p>
          <p className="stat-card__value">{averageRating}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Общо студенти</p>
          <p className="stat-card__value">{totalStudents}</p>
        </div>
      </StatsBar>

      {filteredCourses.length === 0 ? (
        <div className="empty-state">Няма намерени курсове по зададените критерии.</div>
      ) : (
        <div className="grid-three">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
