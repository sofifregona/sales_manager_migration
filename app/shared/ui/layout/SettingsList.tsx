import { useMemo } from "react";
import { Link } from "react-router-dom";
import "./SettingsList.sass";

const placeholderShortcuts = [
  { name: "product", label: "Productos", path: "/product" },
  { name: "category", label: "Categorías", path: "/category" },
  { name: "brand", label: "Marcas", path: "/brand" },
  { name: "provider", label: "Proveedores", path: "/provider" },
  { name: "bartable", label: "Mesas", path: "/bartable" },
  { name: "employee", label: "Empleados", path: "/employee" },
  { name: "account", label: "Cuentas", path: "/account" },
  { name: "paymentMethod", label: "Métodos de pago", path: "/payment-method" },
  { name: "user", label: "Usuarios", path: "/user" },
];

export function SettingsList({ actual }: { actual: string }) {
  const shortcuts = useMemo(() => placeholderShortcuts, []);

  return (
    <section className="settings-menu">
      <h2 className="settings-menu__title">Menú</h2>
      <ul className="settings-menu__list">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.path}>
            <Link
              to={`/settings${shortcut.path}`}
              className={
                shortcut.name === actual
                  ? "settings-menu__item settings-menu__item--selected"
                  : "settings-menu__item"
              }
            >
              {shortcut.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
