import React from "react";
import { Link } from "react-router-dom";
import "./SettingsList.sass";

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
    <div className="settings__crud">
      <h4 className="settings__subtitle">
        {isEditing ? `Editando - ${name}` : `Crear ${entityLabel}`}
      </h4>
    </div>
  );
}
