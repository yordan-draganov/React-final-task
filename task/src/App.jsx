import { useState } from 'react'
import './App.css'
import ResponsiveProfileCardTask from './components/01-ResponsiveProfileCard'
import TodoLocalStorageTask from './components/02-TodoLocalStorage'
import AsyncDataDashboardTask from './components/03-AsyncDataDashboard'
import CourseCatalogTask from './components/04-CourseCatalog'
import KanbanBoardTask from './components/05-KanbanBoard'
import ClassroomAppTask from './components/06-ClassroomApp'

const taskEntries = [
  {
    id: '01',
    label: 'Задача 1',
    component: ResponsiveProfileCardTask,
  },
  {
    id: '02',
    label: 'Задача 2',
    component: TodoLocalStorageTask,
  },
  {
    id: '03',
    label: 'Задача 3',
    component: AsyncDataDashboardTask,
  },
  {
    id: '04',
    label: 'Задача 4',
    component: CourseCatalogTask,
  },
  {
    id: '05',
    label: 'Задача 5',
    component: KanbanBoardTask,
  },
  {
    id: '06',
    label: 'Задача 6',
    component: ClassroomAppTask,
  },
]

function App() {
  const [activeTaskId, setActiveTaskId] = useState(taskEntries[0].id)

  const activeTask =
    taskEntries.find((task) => task.id === activeTaskId) ?? taskEntries[0]

  const ActiveComponent = activeTask.component

  return (
    <div className="app-shell">
      <main className="workspace workspace--minimal">
        <nav className="task-nav task-nav--minimal" aria-label="Навигация между задачите">
          {taskEntries.map((task) => (
            <button
              key={task.id}
              type="button"
              className={`task-nav__item${
                task.id === activeTaskId ? ' task-nav__item--active' : ''
              }`}
              onClick={() => setActiveTaskId(task.id)}
            >
              <span className="task-nav__code">{task.label}</span>
            </button>
          ))}
        </nav>

        <section className="workspace__content">
          <ActiveComponent />
        </section>
      </main>
    </div>
  )
}

export default App
