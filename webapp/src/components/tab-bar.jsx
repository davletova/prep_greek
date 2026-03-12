export default function TabBar({ tab, onChange }) {
  return (
    <nav className="tabbar" aria-label="Основная навигация">
      <button
        className={`tabbar__item ${
          tab === "theory" ? "tabbar__item--active" : ""
        }`}
        type="button"
        onClick={() => onChange("theory")}
        aria-label="Теория"
      >
        <svg className="tabbar__icon" viewBox="0 0 24 24">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19a2 2 0 0 1 2 2v13.5a1.5 1.5 0 0 1-1.5 1.5H7.5A2.5 2.5 0 0 0 5 22V5.5Z" />
          <path d="M5 6h10.5a1 1 0 0 1 1 1v12.5" />
          <path d="M9 7.5h6.5" />
        </svg>
      </button>
      <button
        className={`tabbar__item ${
          tab === "practice" ? "tabbar__item--active" : ""
        }`}
        type="button"
        onClick={() => onChange("practice")}
        aria-label="Практика"
      >
        <svg className="tabbar__icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12 2.5 2.5 4.5-5" />
        </svg>
      </button>
      <button
        className={`tabbar__item ${
          tab === "profile" ? "tabbar__item--active" : ""
        }`}
        type="button"
        onClick={() => onChange("profile")}
        aria-label="Профиль"
      >
        <svg className="tabbar__icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="9" r="3" />
          <path d="M7.5 19a4.5 4.5 0 0 1 9 0" />
        </svg>
      </button>
    </nav>
  );
}
