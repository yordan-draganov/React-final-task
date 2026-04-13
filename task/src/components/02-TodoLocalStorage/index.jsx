import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'practice-react-todo-list'

function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY)
    return savedTodos ? JSON.parse(savedTodos) : []
  } catch {
    return []
  }
}

function createTodo(text) {
  return {
    id: Date.now(),
    text,
    completed: false,
  }
}

export default function TodoLocalStorageTask() {
  const [todos, setTodos] = useState(loadTodos)
  const [value, setValue] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const visibleTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed)
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed)
    }

    return todos
  }, [filter, todos])

  const completedCount = todos.filter((todo) => todo.completed).length

  function addTodo() {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      setError('Моля, въведи задача преди да добавиш.')
      return
    }

    setTodos((currentTodos) => [createTodo(trimmedValue), ...currentTodos])
    setValue('')
    setError('')
  }

  function handleListClick(event) {
    const actionButton = event.target.closest('[data-action]')

    if (!actionButton) {
      return
    }

    const todoId = Number(actionButton.dataset.todoId)
    const action = actionButton.dataset.action

    if (action === 'toggle') {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
        ),
      )
    }

    if (action === 'delete') {
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    addTodo()
  }

  return (
    <div className="stack">
      <div className="grid-two">
        <section className="panel stack">
          <form className="stack" onSubmit={handleSubmit}>
            <label htmlFor="todo-input">Нова задача</label>
            <input
              id="todo-input"
              className="field"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Например: Да завърша React упражнението"
            />
            {error ? (
              <div className="status-message status-message--error">{error}</div>
            ) : null}

            <div className="toolbar">
              <button type="submit" className="button">
                Добави задача
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  setValue('')
                  setError('')
                }}
              >
                Изчисти поле
              </button>
            </div>
          </form>
        </section>

        <aside className="stack">
          <div className="stat-card">
            <p className="stat-card__label">Общо задачи</p>
            <p className="stat-card__value">{todos.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Завършени</p>
            <p className="stat-card__value">{completedCount}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Активен филтър</p>
            <p className="stat-card__value">
              {filter === 'all'
                ? 'Всички'
                : filter === 'active'
                  ? 'Активни'
                  : 'Завършени'}
            </p>
          </div>
        </aside>
      </div>

      <section className="panel stack">
        <div className="toolbar">
          <button
            type="button"
            className={`button ${filter === 'all' ? '' : 'button--secondary'}`}
            onClick={() => setFilter('all')}
          >
            Всички
          </button>
          <button
            type="button"
            className={`button ${filter === 'active' ? '' : 'button--secondary'}`}
            onClick={() => setFilter('active')}
          >
            Активни
          </button>
          <button
            type="button"
            className={`button ${filter === 'completed' ? '' : 'button--secondary'}`}
            onClick={() => setFilter('completed')}
          >
            Завършени
          </button>
        </div>

        <div className="stack" onClick={handleListClick} role="presentation">
          {visibleTodos.length === 0 ? (
            <div className="empty-state">Няма задачи за показване по този филтър.</div>
          ) : (
            visibleTodos.map((todo) => (
              <article key={todo.id} className="panel">
                <div className="toolbar" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <h4
                      style={{
                        marginBottom: '0.35rem',
                        textDecoration: todo.completed ? 'line-through' : 'none',
                      }}
                    >
                      {todo.text}
                    </h4>
                    <p className="muted">
                      Статус: {todo.completed ? 'Завършена' : 'Активна'}
                    </p>
                  </div>

                  <div className="toolbar">
                    <button
                      type="button"
                      className="button button--secondary"
                      data-action="toggle"
                      data-todo-id={todo.id}
                    >
                      {todo.completed ? 'Върни' : 'Завърши'}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      data-action="delete"
                      data-todo-id={todo.id}
                    >
                      Изтрий
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
