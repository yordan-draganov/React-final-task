import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'

const STORAGE_KEY = 'practice-react-classroom'
const ClassroomContext = createContext(null)

const initialState = {
  students: [
    {
      id: 1,
      name: 'Иван Петров',
      className: '11A',
      grades: { Математика: [5, 6], Информатика: [6, 5, 6] },
    },
    {
      id: 2,
      name: 'Мария Иванова',
      className: '11Б',
      grades: { Математика: [6, 6], Физика: [5, 4] },
    },
    {
      id: 3,
      name: 'Николай Георгиев',
      className: '11A',
      grades: { История: [4, 5], 'Български език': [5, 5] },
    },
    {
      id: 4,
      name: 'Елица Стоянова',
      className: '11Б',
      grades: { Информатика: [6, 6], 'Английски език': [5, 6] },
    },
  ],
  classFilter: 'all',
  nextId: 5,
}

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialState
  } catch {
    return initialState
  }
}

function classroomReducer(state, action) {
  switch (action.type) {
    case 'ADD_STUDENT':
      return {
        ...state,
        nextId: state.nextId + 1,
        students: [
          ...state.students,
          {
            id: state.nextId,
            name: action.payload.name,
            className: action.payload.className,
            grades: {},
          },
        ],
      }
    case 'ADD_GRADE':
      return {
        ...state,
        students: state.students.map((student) =>
          student.id === action.payload.studentId
            ? {
                ...student,
                grades: {
                  ...student.grades,
                  [action.payload.subject]: [
                    ...(student.grades[action.payload.subject] ?? []),
                    action.payload.grade,
                  ],
                },
              }
            : student,
        ),
      }
    case 'REMOVE_STUDENT':
      return {
        ...state,
        students: state.students.filter(
          (student) => student.id !== action.payload.studentId,
        ),
      }
    case 'SET_FILTER':
      return {
        ...state,
        classFilter: action.payload.classFilter,
      }
    default:
      return state
  }
}

function ClassroomProvider({ children }) {
  const [state, dispatch] = useReducer(classroomReducer, undefined, loadInitialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = { state, dispatch }

  return (
    <ClassroomContext.Provider value={value}>{children}</ClassroomContext.Provider>
  )
}

function useClassroom() {
  const context = useContext(ClassroomContext)

  if (!context) {
    throw new Error('useClassroom трябва да се използва в ClassroomProvider')
  }

  return context
}

function calculateAverage(grades) {
  const gradeValues = Object.values(grades).flat()
  return gradeValues.length
    ? gradeValues.reduce((sum, grade) => sum + grade, 0) / gradeValues.length
    : 0
}

function StudentForm() {
  const { dispatch } = useClassroom()
  const [name, setName] = useState('')
  const [className, setClassName] = useState('11A')

  function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    dispatch({
      type: 'ADD_STUDENT',
      payload: { name: name.trim(), className },
    })
    setName('')
  }

  return (
    <form className="panel grid-two" onSubmit={handleSubmit}>
      <input
        className="field"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Име на ученик"
      />
      <div className="toolbar">
        <select
          className="select"
          value={className}
          onChange={(event) => setClassName(event.target.value)}
        >
          <option value="11A">11A</option>
          <option value="11Б">11Б</option>
        </select>
        <button type="submit" className="button">
          Добави ученик
        </button>
      </div>
    </form>
  )
}

function GradeForm() {
  const { state, dispatch } = useClassroom()
  const [studentId, setStudentId] = useState(state.students[0]?.id ?? '')
  const [subject, setSubject] = useState('Математика')
  const [grade, setGrade] = useState(6)

  const selectedStudentId = state.students.some(
    (student) => student.id === Number(studentId),
  )
    ? studentId
    : state.students[0]?.id ?? ''

  function handleSubmit(event) {
    event.preventDefault()

    if (!selectedStudentId) {
      return
    }

    dispatch({
      type: 'ADD_GRADE',
      payload: {
        studentId: Number(selectedStudentId),
        subject,
        grade: Number(grade),
      },
    })
  }

  return (
    <form className="panel grid-three" onSubmit={handleSubmit}>
      <select
        className="select"
        value={selectedStudentId}
        onChange={(event) => setStudentId(event.target.value)}
      >
        {state.students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}
          </option>
        ))}
      </select>
      <input
        className="field"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        placeholder="Предмет"
      />
      <div className="toolbar">
        <select
          className="select"
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
        </select>
        <button type="submit" className="button">
          Добави оценка
        </button>
      </div>
    </form>
  )
}

function SearchBar() {
  const { state, dispatch } = useClassroom()

  return (
    <div className="panel toolbar">
      <p className="muted" style={{ margin: 0 }}>
        Филтър по клас:
      </p>
      <button
        type="button"
        className={`button ${state.classFilter === 'all' ? '' : 'button--secondary'}`}
        onClick={() =>
          dispatch({ type: 'SET_FILTER', payload: { classFilter: 'all' } })
        }
      >
        Всички
      </button>
      <button
        type="button"
        className={`button ${state.classFilter === '11A' ? '' : 'button--secondary'}`}
        onClick={() =>
          dispatch({ type: 'SET_FILTER', payload: { classFilter: '11A' } })
        }
      >
        11A
      </button>
      <button
        type="button"
        className={`button ${state.classFilter === '11Б' ? '' : 'button--secondary'}`}
        onClick={() =>
          dispatch({ type: 'SET_FILTER', payload: { classFilter: '11Б' } })
        }
      >
        11Б
      </button>
    </div>
  )
}

function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('dark', dark)

    return () => {
      document.body.classList.remove('dark')
    }
  }, [dark])

  return (
    <button
      type="button"
      className="button button--secondary"
      onClick={() => setDark((currentDark) => !currentDark)}
    >
      {dark ? 'Светъл режим' : 'Тъмен режим'}
    </button>
  )
}

function AsyncStatus() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(false)
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <div className="stat-card">
      <p className="stat-card__label">Асинхронен статус</p>
      <p className="stat-card__value">{loading ? 'Зареждане...' : 'Данните са готови'}</p>
    </div>
  )
}

function StatsDashboard() {
  const { state } = useClassroom()

  const visibleStudents =
    state.classFilter === 'all'
      ? state.students
      : state.students.filter((student) => student.className === state.classFilter)

  const studentAverages = visibleStudents.map((student) => ({
    ...student,
    average: calculateAverage(student.grades),
  }))

  const averageSuccess = studentAverages.length
    ? (
        studentAverages.reduce((sum, student) => sum + student.average, 0) /
        studentAverages.length
      ).toFixed(2)
    : '0.00'

  const topStudent = [...studentAverages].sort(
    (firstStudent, secondStudent) => secondStudent.average - firstStudent.average,
  )[0]

  const honorsCount = studentAverages.filter((student) => student.average >= 5.5).length

  const class11A = state.students
    .filter((student) => student.className === '11A')
    .map((student) => calculateAverage(student.grades))
  const class11B = state.students
    .filter((student) => student.className === '11Б')
    .map((student) => calculateAverage(student.grades))

  const classAverage = (values) =>
    values.length
      ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)
      : '0.00'

  return (
    <div className="grid-three">
      <div className="stat-card">
        <p className="stat-card__label">Среден успех</p>
        <p className="stat-card__value">{averageSuccess}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card__label">Отличници</p>
        <p className="stat-card__value">{honorsCount}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card__label">Най-добър ученик</p>
        <p className="stat-card__value">{topStudent?.name ?? 'Няма данни'}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card__label">Среден 11A</p>
        <p className="stat-card__value">{classAverage(class11A)}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card__label">Среден 11Б</p>
        <p className="stat-card__value">{classAverage(class11B)}</p>
      </div>
      <AsyncStatus />
    </div>
  )
}

function StudentTable() {
  const { state, dispatch } = useClassroom()

  const visibleStudents =
    state.classFilter === 'all'
      ? state.students
      : state.students.filter((student) => student.className === state.classFilter)

  return (
    <div className="student-list">
      {visibleStudents.length === 0 ? (
        <div className="empty-state">Няма ученици за избрания клас.</div>
      ) : (
        visibleStudents.map((student) => (
          <article key={student.id} className="panel stack">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <div>
                <h4>{student.name}</h4>
                <p className="muted">Клас: {student.className}</p>
              </div>
              <button
                type="button"
                className="button button--ghost"
                onClick={() =>
                  dispatch({
                    type: 'REMOVE_STUDENT',
                    payload: { studentId: student.id },
                  })
                }
              >
                Премахни
              </button>
            </div>

            <div className="student-grades-grid">
              {Object.entries(student.grades).length === 0 ? (
                <div className="empty-state">Все още няма въведени оценки.</div>
              ) : (
                Object.entries(student.grades).map(([subject, grades]) => (
                  <div key={subject} className="stat-card">
                    <p className="stat-card__label">{subject}</p>
                    <p className="stat-card__value">{grades.join(', ')}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        ))
      )}
    </div>
  )
}

function ClassroomContent() {
  return (
    <div className="stack">
      <StatsDashboard />
      <div className="classroom-actions">
        <DarkModeToggle />
      </div>
      <SearchBar />
      <StudentForm />
      <GradeForm />
      <StudentTable />
    </div>
  )
}

export default function ClassroomAppTask() {
  return (
    <ClassroomProvider>
      <ClassroomContent />
    </ClassroomProvider>
  )
}
