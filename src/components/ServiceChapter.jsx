const pad = (n) => String(n).padStart(2, '0')

/*
  One world inside the services journey. Layout only — the visual that
  lives inside it is passed in as children and owns its own motion.
*/
export default function ServiceChapter({ index, chapter, active, children }) {
  const n = pad(index + 1)
  return (
    <article
      className={`chapter chapter--${chapter.theme}${active ? ' is-active' : ''}`}
      id={chapter.id}
      aria-labelledby={`${chapter.id}-title`}
    >
      <span className="chapter__num" aria-hidden="true">
        {n}
      </span>

      <div className="chapter__copy">
        <p className="chapter__kicker t-label">
          {n} / {chapter.kicker}
        </p>
        <h3 id={`${chapter.id}-title`} className="chapter__title">
          {chapter.title}
        </h3>
        <p className="chapter__line">
          {chapter.line.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>
        <ul className="chapter__tags" aria-label={`${chapter.title} — what that covers`}>
          {chapter.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {chapter.note && <p className="chapter__note t-label">{chapter.note}</p>}
      </div>

      <div className="chapter__visual">{children}</div>
    </article>
  )
}
