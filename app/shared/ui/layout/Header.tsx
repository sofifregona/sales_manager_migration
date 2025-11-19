import { NavLink } from "react-router-dom";
import "./Header.sass";

type NavItem = {
  label: string;
  to: string;
  end?: boolean;
};

const navItems: NavItem[] = [
  { label: "Órdenes", to: "/sale/order" },
  { label: "Registros", to: "/sale", end: true },
  { label: "Movimientos", to: "/transaction" },
];

function navLinkClassName(isActive: boolean, extra?: string) {
  return ["app-header__nav-link", extra, isActive ? "is-active" : undefined]
    .filter(Boolean)
    .join(" ");
}

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__branding">
        {/* <p className="app-header__eyebrow">Sales Manager</p> */}
        <h1 className="app-header__title">Panel</h1>
      </div>

      <nav className="app-header__nav" aria-label="Secciones principales">
        <div className="app-header__nav-pill">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navLinkClassName(isActive)}
            >
              {item.label}
            </NavLink>
          ))}

          {/* <span className="app-header__nav-sub" aria-live="polite">
            Mesa 1
          </span> */}

          <button
            type="button"
            className="app-header__nav-link is-disabled"
            disabled
            aria-disabled="true"
            title="Sección en construcción"
          >
            Stock
          </button>
        </div>
      </nav>

      <div className="app-header__actions">
        <button
          type="button"
          className="app-header__icon-btn"
          aria-label="Ver notificaciones"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <NavLink to="/settings" className="app-header__settings">
          <span className="material-symbols-outlined">settings</span>
          <span className="app-header__settings-label">Configuración</span>
        </NavLink>
      </div>
    </header>
  );
}
