import './styles.css'

const subjects = [
  { name: 'Математика', grade: 5.5 },
  { name: 'Физика', grade: 3.25 },
  { name: 'Информатика', grade: 5.75 },
]

function gradeClass(grade) {
  if (grade >= 5) {
    return 'profile-card__grade--high'
  }

  if (grade >= 4) {
    return 'profile-card__grade--mid'
  }

  return 'profile-card__grade--low'
}

export default function ResponsiveProfileCardTask() {
  const average =
    subjects.reduce((sum, subject) => sum + subject.grade, 0) / subjects.length

  return (
    <article className="profile-card">
      <div className="profile-card__header">
        <div className="profile-card__avatar" aria-hidden="true">
          ИП
        </div>
        <div>
          <p className="profile-card__class">Клас 11А</p>
          <h3 className="profile-card__name">Иван Петров</h3>
          <p className="profile-card__average">
            Среден успех:
            <span className={gradeClass(average)}>{average.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <div className="profile-card__subjects">
        {subjects.map((subject) => (
          <div key={subject.name} className="profile-card__subject">
            <span>{subject.name}</span>
            <span className={`profile-card__grade ${gradeClass(subject.grade)}`}>
              {subject.grade.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
