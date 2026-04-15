import { createContext, useContext, useReducer, useState } from 'react'

const TaskContext = createContext(null)
const FilterContext = createContext(null)

const initialTasks = {
  nextId: 5,
  tasks: [
    {
      id: 1,
      title: 'Да планирам началната структура',
      priority: 'high',
      status: 'todo',
      createdAt: '13.04.2026, 10:00',
    },
    {
      id: 2,
      title: 'Да добавя логика с редюсър',
      priority: 'medium',
      status: 'in-progress',
      createdAt: '13.04.2026, 10:30',
    },
    {
      id: 3,
      title: 'Да проверя адаптивния изглед',
      priority: 'low',
      status: 'done',
      createdAt: '13.04.2026, 11:00',
    },
    {
      id: 4,
      title: 'Да подготвя демонстрационни данни',
      priority: 'high',
      status: 'todo',
      createdAt: '13.04.2026, 11:10',
    },
  ],
}

function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        nextId: state.nextId + 1,
        tasks: [
          {
            id: state.nextId,
            title: action.payload.title,
            priority: action.payload.priority,
            status: 'todo',
            createdAt: new Date().toLocaleString('bg-BG'),
          },
          ...state.tasks,
        ],
      }
    case 'MOVE_TASK': {
      const flow = { todo: 'in-progress', 'in-progress': 'done', done: 'done' }
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, status: flow[task.status] ?? task.status }
            : task,
        ),
      }
    }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      }
    default:
      return state
  }
}

function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialTasks)
  const value = { tasks: state.tasks, dispatch }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

function FilterProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const value = {
    searchQuery,
    priorityFilter,
    setSearchQuery,
    setPriorityFilter,
  }

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

function useTaskBoard() {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error('useTaskBoard трябва да се използва в TaskProvider')
  }

  return context
}

function useTaskFilters() {
  const context = useContext(FilterContext)

  if (!context) {
    throw new Error('useTaskFilters трябва да се използва в FilterProvider')
  }

  return context
}

function TaskForm() {
  const { dispatch } = useTaskBoard()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')

  function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    dispatch({
      type: 'ADD_TASK',
      payload: { title: title.trim(), priority },
    })

    setTitle('')
    setPriority('medium')
  }

  return (
    <form className="panel grid-two" onSubmit={handleSubmit}>
      <input
        className="field"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Нова задача за канбан дъската"
      />
      <div className="toolbar">
        <select
          className="select"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="low">Нисък</option>
          <option value="medium">Среден</option>
          <option value="high">Висок</option>
        </select>
        <button type="submit" className="button">
          Добави
        </button>
      </div>
    </form>
  )
}

function FilterBar() {
  const { searchQuery, priorityFilter, setPriorityFilter, setSearchQuery } =
    useTaskFilters()

  return (
    <div className="panel grid-two">
      <input
        className="field"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Търси задача по име"
      />
      <select
        className="select"
        value={priorityFilter}
        onChange={(event) => setPriorityFilter(event.target.value)}
      >
        <option value="all">Всички приоритети</option>
        <option value="high">Висок</option>
        <option value="medium">Среден</option>
        <option value="low">Нисък</option>
      </select>
    </div>
  )
}

function TaskCard({ task }) {
  const { dispatch } = useTaskBoard()
  const priorityLabels = {
    low: 'Нисък',
    medium: 'Среден',
    high: 'Висок',
  }
  const priorityTone = {
    low: '#1d7f5f',
    medium: '#d18f1b',
    high: '#b03a2e',
  }

  return (
    <article className="panel stack">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <span
          className="topic-list__item"
          style={{
            background: `${priorityTone[task.priority]}1a`,
            color: priorityTone[task.priority],
          }}
        >
          {priorityLabels[task.priority]}
        </span>
        <span className="muted">{task.createdAt}</span>
      </div>
      <h4>{task.title}</h4>
      <div className="toolbar">
        <button
          type="button"
          className="button button--secondary"
          onClick={() =>
            dispatch({ type: 'MOVE_TASK', payload: { id: task.id } })
          }
          disabled={task.status === 'done'}
        >
          Напред
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={() =>
            dispatch({ type: 'DELETE_TASK', payload: { id: task.id } })
          }
        >
          Изтрий
        </button>
      </div>
    </article>
  )
}

function KanbanColumn({ status, title }) {
  const { tasks } = useTaskBoard()
  const { searchQuery, priorityFilter } = useTaskFilters()

  const filteredTasks = tasks
    .filter((task) => task.status === status)
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    )
    .filter((task) => priorityFilter === 'all' || task.priority === priorityFilter)

  return (
    <section className="panel stack">
      <h3>
        {title} ({filteredTasks.length})
      </h3>
      {filteredTasks.length === 0 ? (
        <div className="empty-state">Няма задачи в тази колона.</div>
      ) : (
        filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </section>
  )
}

function Dashboard() {
  const { tasks } = useTaskBoard()
  const doneCount = tasks.filter((task) => task.status === 'done').length
  const highPriorityCount = tasks.filter((task) => task.priority === 'high').length
  const completionRate = tasks.length
    ? Math.round((doneCount / tasks.length) * 100)
    : 0

  return (
    <div className="grid-three">
      <div className="stat-card">
        <p className="stat-card__label">Всички задачи</p>
        <p className="stat-card__value">{tasks.length}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card__label">Висок приоритет</p>
        <p className="stat-card__value">{highPriorityCount}</p>
      </div>
      <div className="stat-card">
        <p className="stat-card__label">Завършеност</p>
        <p className="stat-card__value">{completionRate}%</p>
      </div>
    </div>
  )
}

function KanbanBoardContent() {
  return (
    <div className="stack">
      <Dashboard />
      <TaskForm />
      <FilterBar />
      <div className="grid-three">
        <KanbanColumn status="todo" title="За правене" />
        <KanbanColumn status="in-progress" title="В процес" />
        <KanbanColumn status="done" title="Готово" />
      </div>
    </div>
  )
}

export default function KanbanBoardTask() {
  return (
    <TaskProvider>
      <FilterProvider>
        <KanbanBoardContent />
      </FilterProvider>
    </TaskProvider>
  )
}
