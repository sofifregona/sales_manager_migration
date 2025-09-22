import { useState, useRef, useMemo, useEffect } from "react";
import { normalizeText } from "~/utils/helpers/normalizeText";

type FilterableSelectProps = {
  name: string;
  options: { id: number; name: string; normalizedName: string }[];
  label: string;
  initialId?: number;
};

export function FilterableSelect({
  name,
  options,
  label,
  initialId,
}: FilterableSelectProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    initialId ?? null
  );
  const [input, setInput] = useState(
    options.find((opt) => opt.id === selectedId)?.name ?? ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState(options);

  const containerRef = useRef<HTMLDivElement>(null);

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
      <label className="block mb-1 text-sm font-medium text-gray-700">
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
        placeholder={`— Sin ${label.toLowerCase()} —`}
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
