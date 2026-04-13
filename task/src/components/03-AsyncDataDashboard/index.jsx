import { useEffect, useState } from 'react'

const API_BASE_URL = 'https://jsonplaceholder.typicode.com'

async function fetchResource(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)

  if (!response.ok) {
    throw new Error(`Заявката се провали: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

function buildStats(users, posts, comments, elapsed) {
  const averageCommentsPerPost = posts.length
    ? (comments.length / posts.length).toFixed(1)
    : '0.0'

  return [
    { label: 'Потребители', value: users.length },
    { label: 'Постове', value: posts.length },
    { label: 'Коментари', value: comments.length },
    { label: 'Средно коментари на пост', value: averageCommentsPerPost },
    { label: 'Време за зареждане', value: `${elapsed} ms` },
  ]
}

export default function AsyncDataDashboardTask() {
  const [state, setState] = useState({
    loading: true,
    error: '',
    stats: [],
    fallbackMessages: [],
  })

  async function loadDashboard() {
    const startedAt = Date.now()

    setState({
      loading: true,
      error: '',
      stats: [],
      fallbackMessages: [],
    })

    try {
      const [users, posts, comments] = await Promise.all([
        fetchResource('/users'),
        fetchResource('/posts?_limit=10'),
        fetchResource('/comments?_limit=20'),
      ])

      setState({
        loading: false,
        error: '',
        stats: buildStats(users, posts, comments, Date.now() - startedAt),
        fallbackMessages: [],
      })
    } catch (promiseAllError) {
      const results = await Promise.allSettled([
        fetchResource('/users'),
        fetchResource('/posts?_limit=10'),
        fetchResource('/comments?_limit=20'),
      ])

      const labels = ['Потребители', 'Постове', 'Коментари']
      const fallbackMessages = results.map((result, index) =>
        result.status === 'fulfilled'
          ? `${labels[index]}: успешно заредени (${result.value.length})`
          : `${labels[index]}: грешка - ${result.reason.message}`,
      )

      const safeUsers = results[0].status === 'fulfilled' ? results[0].value : []
      const safePosts = results[1].status === 'fulfilled' ? results[1].value : []
      const safeComments = results[2].status === 'fulfilled' ? results[2].value : []

      setState({
        loading: false,
        error: promiseAllError.message,
        stats: buildStats(
          safeUsers,
          safePosts,
          safeComments,
          Date.now() - startedAt,
        ),
        fallbackMessages,
      })
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <div className="stack">
      <div className="toolbar">
        <button type="button" className="button" onClick={loadDashboard}>
          Презареди данни
        </button>
      </div>

      {state.loading ? (
        <div className="status-message status-message--success">
          Зареждане на dashboard данните...
        </div>
      ) : null}

      {state.error ? (
        <div className="status-message status-message--error">
          Promise.all fallback: {state.error}
        </div>
      ) : null}

      <div className="grid-three">
        {state.stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-card__label">{stat.label}</p>
            <p className="stat-card__value">{stat.value}</p>
          </div>
        ))}
      </div>

      {state.fallbackMessages.length > 0 ? (
        <section className="panel stack">
          <h4>Fallback резултати</h4>
          {state.fallbackMessages.map((message) => (
            <p key={message} className="muted">
              {message}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  )
}
