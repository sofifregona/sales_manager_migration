import "./Footer.sass";

export function Footer() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date();

  return (
    <footer className="app-footer" aria-label="Información del sistema">
      <div className="app-footer__brand">
        <span className="app-footer__title">Sales Manager</span>
        <span className="app-footer__version">Panel</span>
      </div>

      <div className="app-footer__meta">
        <span className="app-footer__meta-item">
          Zona horaria: {timezone}
        </span>
        <span className="app-footer__meta-item">
          Fecha: {today.toLocaleDateString()}
        </span>
      </div>

      <div className="app-footer__links">
        <a className="app-footer__link" href="/settings">
          Configuración
        </a>
        <span className="app-footer__support">
          Soporte: consultá al administrador
        </span>
      </div>
    </footer>
  );
}
