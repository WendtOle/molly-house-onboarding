import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Markdown from 'react-markdown';
import { loadHints } from './content';
import './style.css';

const hints = loadHints(
  import.meta.glob('../content/hints/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
);
const topics = [...new Set(hints.flatMap((hint) => hint.topics))].sort((a, b) =>
  a.localeCompare(b),
);

function readRoute() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return { topic: params.get('topic') ?? '', hint: params.get('hint') ?? '' };
}

function navigate(topic = '', hint = '') {
  const params = new URLSearchParams();
  if (topic) params.set('topic', topic);
  if (hint) params.set('hint', hint);
  window.location.hash = params.toString();
}

export function App() {
  const [route, setRoute] = useState(readRoute);
  const [query, setQuery] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const main = useRef<HTMLElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const search = query.trim().toLocaleLowerCase();
  const topicExists = !route.topic || topics.includes(route.topic);
  const collection = hints.filter(
    (hint) => !route.topic || hint.topics.includes(route.topic),
  );
  const results = collection.filter((hint) =>
    `${hint.title} ${hint.topics.join(' ')} ${hint.body}`
      .toLocaleLowerCase()
      .includes(search),
  );
  // Reader navigation stays within the selected topic, independent of search.
  const currentIndex = collection.findIndex((hint) => hint.id === route.hint);
  const current = route.hint ? collection[currentIndex] : undefined;
  const invalidRoute = !topicExists || Boolean(route.hint && !current);
  const isHome = !route.topic && !route.hint;

  useEffect(() => {
    function onHashChange() {
      setRoute(readRoute());
      setQuery('');
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      )
        return;
      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        searchInput.current
      ) {
        event.preventDefault();
        searchInput.current.focus();
      }
    }
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  useEffect(() => {
    if (route.topic || route.hint) heading.current?.focus();
    window.scrollTo({ top: 0 });
    document.title = `${current?.title ?? (route.topic || 'Table Companion')} · Molly House`;
  }, [route.topic, route.hint, current?.title]);

  function step(direction: number) {
    const next = collection[currentIndex + direction];
    if (next) navigate(route.topic, next.id);
  }

  const previous = collection[currentIndex - 1];
  const next = collection[currentIndex + 1];

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Molly House home">
          Molly House<span>Companion</span>
        </a>
        {(route.topic || route.hint) && (
          <button
            className="back-button"
            onClick={() => navigate(current ? route.topic : '')}
          >
            <span aria-hidden="true">←</span>{' '}
            {current && route.topic ? route.topic : 'All topics'}
          </button>
        )}
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        {invalidRoute ? (
          <section className="empty-state">
            <h1 ref={heading} tabIndex={-1}>
              Hint not found
            </h1>
            <p>This topic or hint is no longer available.</p>
            <button className="primary-button" onClick={() => navigate()}>
              Browse topics
            </button>
          </section>
        ) : current ? (
          <section className="reader" aria-label="Hint reader">
            <article
              className="hint-card"
              onTouchStart={(event) => {
                touch.current = {
                  x: event.touches[0].clientX,
                  y: event.touches[0].clientY,
                };
              }}
              onTouchCancel={() => {
                touch.current = null;
              }}
              onTouchEnd={(event) => {
                const start = touch.current;
                touch.current = null;
                if (!start) return;
                const dx = event.changedTouches[0].clientX - start.x;
                const dy = event.changedTouches[0].clientY - start.y;
                if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5)
                  step(dx < 0 ? 1 : -1);
              }}
              onKeyDown={(event) => {
                if (event.target instanceof HTMLAnchorElement) return;
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  step(1);
                }
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  step(-1);
                }
              }}
            >
              <h1 ref={heading} tabIndex={-1}>
                {current.title}
              </h1>
              <div className="markdown">
                <Markdown>{current.body}</Markdown>
              </div>
            </article>
            <nav className="reader-controls" aria-label="Hint navigation">
              {previous && (
                <button
                  className="hint-navigation previous"
                  onClick={() => step(-1)}
                >
                  <span className="navigation-label">
                    <span aria-hidden="true">←</span> Previous
                  </span>
                  <span className="navigation-title">{previous.title}</span>
                </button>
              )}
              {next && (
                <button
                  className="hint-navigation next"
                  onClick={() => step(1)}
                >
                  <span className="navigation-label">
                    Next <span aria-hidden="true">→</span>
                  </span>
                  <span className="navigation-title">{next.title}</span>
                </button>
              )}
            </nav>
            <p className="sr-only" aria-live="polite">
              {current.title}
            </p>
          </section>
        ) : (
          <section className="browser">
            <h1 ref={heading} tabIndex={-1}>
              {isHome ? 'Topics' : route.topic}
            </h1>
            <label className="search-field">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                ref={searchInput}
                aria-label={
                  route.topic ? 'Search this topic' : 'Search all hints'
                }
                type="search"
                placeholder={route.topic ? 'Search this topic' : 'Search hints'}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {isHome && !search ? (
              <div className="topic-list">
                {topics.map((topic) => (
                  <a
                    className="list-row topic-row"
                    key={topic}
                    href={`#topic=${encodeURIComponent(topic)}`}
                  >
                    <span>{topic}</span>
                    <span className="row-arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="hint-list">
                {results.map((hint) => (
                  <a
                    className="list-row"
                    key={hint.id}
                    href={`#${new URLSearchParams({ ...(route.topic ? { topic: route.topic } : {}), hint: hint.id })}`}
                  >
                    <span>{hint.title}</span>
                    <span className="row-arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                ))}
                {!results.length && (
                  <div className="empty-state">
                    <p>No hints found.</p>
                    <button
                      className="text-button"
                      onClick={() => setQuery('')}
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
