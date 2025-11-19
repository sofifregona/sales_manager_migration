import { useMemo } from "react";

const placeholderShortcuts = [
  { label: "Productos", path: "/product" },
  { label: "Categorías", path: "/category" },
  { label: "Marcas", path: "/brand" },
  { label: "Proveedores", path: "/provider" },
  { label: "Mesas", path: "/bartable" },
  { label: "Empleados", path: "/employee" },
  { label: "Cuentas", path: "/account" },
  { label: "Métodos de pago", path: "/payment" },
  { label: "Usuarios", path: "/user" },
];

export function SettingsScreen() {
  const shortcuts = useMemo(() => placeholderShortcuts, []);

  return (
    <section className="settings">
      <h2 className="settings__title">Configuración</h2>
      <ul className="settings__list">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.path} className="settings__item">
            {shortcut.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
