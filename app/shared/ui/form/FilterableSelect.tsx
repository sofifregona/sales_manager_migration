import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useLocation } from "react-router-dom";
import { normalizeText } from "~/utils/strings/normalizeText";

type Option = { id: number; name: string; normalizedName: string };

type Props = {
  name: string;
  options: Option[];
  label: [string, string];
  url: string;
  initialId?: number;
  editing?: number;
};

export function FilterableSelect({
  name,
  options,
  label,
  url,
  initialId,
  editing,
}: Props) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialId ?? null
  );
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const filteredOptions = useMemo(() => {
    const trimmed = input.trim();
    if (trimmed === "") return options;
    const normalized = normalizeText(trimmed);
    return options.filter((opt) => opt.normalizedName.startsWith(normalized));
  }, [input, options]);

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
    const found = options.find((opt) => opt.id === selectedId);
    setInput(found?.name ?? "");
  }, [selectedId, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (input.trim() === "") {
          setSelectedId(null);
          setInput("");
        }
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [input]);

  useEffect(() => {
    if (highlightIndex >= filteredOptions.length) {
      setHighlightIndex(filteredOptions.length - 1);
    }
  }, [filteredOptions, highlightIndex]);

  const handleBlur = () => {
    setIsOpen(false);
    const normalized = options.map((opt) => opt.normalizedName);
    if (input.trim() === "") {
      setSelectedId(null);
      setInput("");
    } else if (!normalized.includes(normalizeText(input).trim())) {
      setSelectedId(-1);
    }
    setHighlightIndex(-1);
  };

  const handleOptionSelect = (opt: Option) => {
    setSelectedId(opt.id);
    setInput(opt.name);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev + 1;
        return next >= filteredOptions.length
          ? filteredOptions.length - 1
          : next;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((prev) => {
        if (prev <= 0) return -1;
        return prev - 1;
      });
    } else if (event.key === "Enter" && highlightIndex >= 0) {
      event.preventDefault();
      const opt = filteredOptions[highlightIndex];
      if (opt) {
        handleOptionSelect(opt);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div
      className={`form-pill-select pill-${url} filterable-input`}
      ref={containerRef}
    >
      <label className={`form-pill-select__label label-${url}-product`}>
        {label[0]}
      </label>
      <input
        type="text"
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`form-pill__input input-${url}-product`}
        placeholder={`— Sin ${label[0].toLowerCase()} —`}
      />
      <input type="hidden" name={name} value={selectedId ?? ""} />

      {isOpen && filteredOptions.length > 0 && (
        <ul className="form-pill-select__ul">
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.id}
              className={
                highlightIndex === index
                  ? "form-pill-select__li form-pill-select__li--active"
                  : "form-pill-select__li"
              }
              onMouseDown={() => handleOptionSelect(opt)}
              onMouseEnter={() => setHighlightIndex(index)}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
