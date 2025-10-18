import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import type { Flash } from "~/types/flash";
import { normalizeText } from "~/utils/strings/normalizeText";

export function FilterableSelect({
  name,
  options,
  label,
  url,
  initialId,
  editing,
}: {
  name: string;
  options: { id: number; name: string; normalizedName: string }[];
  label: [string, string];
  url: string;
  initialId?: number;
  editing?: number;
}) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedId, setSelectedId] = useState<number | null>(
    initialId ?? null
  );
  const [input, setInput] = useState(""); // que arranque vacío
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState(options);
  const [disabledSelection, setDisabledSelection] = useState(false);

  useEffect(() => {
    if (editing) {
      setSelectedId(initialId ?? null);
    } else if (!editing) {
      setSelectedId(null);
      setInput("");
    }
  }, [editing, initialId, location.key]);

  useEffect(() => {
    if (selectedId == null || selectedId === -1) {
      setInput("");
      return;
    }
    const found = options.find((o) => o.id === selectedId);
    setInput(found?.name ?? "");
  }, [selectedId, options]);

  useEffect(() => {
    const inputForm = input.trim();
    if (inputForm === "") {
      setFiltered(options);
    } else {
      const inputNorm = normalizeText(inputForm);
      setFiltered(
        options.filter((opt) => opt.normalizedName.startsWith(inputNorm))
      );
    }
  }, [input, options]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        if (input.trim() === "") {
          setSelectedId(null);
          setInput("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [input]);

  const handleBlur = () => {
    setIsOpen(false);
    const normalized_options = options.map((opt) => normalizeText(opt.name));
    if (input.trim() === "") {
      setSelectedId(null);
      setInput("");
    } else if (!normalized_options.includes(normalizeText(input).trim())) {
      setSelectedId(-1);
    }
  };

  return (
    <div className="relative mb-4" ref={containerRef}>
      {/* <p>{`No hay ${label[1]} disponibles`}</p>
      <Link className="btn btn--secondary" to={`../${label}`}>
        {`Ir al panel de ${label[1]}`}
      </Link> */}
      <label
        htmlFor={`${name}`}
        className="block mb-1 text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none"
        placeholder={`— Sin ${label[0].toLowerCase()} —`}
      />
      <input type="hidden" name={name} value={selectedId ?? ""} />

      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded shadow">
          {filtered.map((opt) => (
            <li
              key={opt.id}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              onMouseDown={() => {
                setSelectedId(opt.id);
                setInput(opt.name);
                setIsOpen(false);
              }}
              style={{ color: "black" }}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
