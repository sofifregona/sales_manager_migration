import React from "react";
import { Link } from "react-router-dom";

type Props = {
  isEditing: boolean;
  entityLabel: string; // e.g., "cuenta"
  name?: string | null;
  cancelHref: string;
};

export function CrudHeader({
  isEditing,
  entityLabel,
  name,
  cancelHref,
}: Props) {
  return (
    <>
      <h2>{isEditing ? `Editar ${entityLabel}` : `Crear ${entityLabel}`}</h2>
      {isEditing && (
        <p className="muted">
          Editando: <strong>{name ?? "-"}</strong>{" "}
          <Link to={cancelHref} replace className="btn">
            Cancelar edición
          </Link>
        </p>
      )}
    </>
  );
}
