"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  label: string;
  value: string;
  options: string[] | SearchableOption[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
  onChange: (value: string) => void;
};

function toItem(option: string | SearchableOption): SearchableOption {
  return typeof option === "string"
    ? { value: option, label: option }
    : option;
}

export function SearchableSelect({
  label,
  value,
  options,
  placeholder = "Ketik untuk mencari...",
  required = false,
  full = false,
  onChange,
}: SearchableSelectProps) {
  const items = useMemo(() => options.map(toItem), [options]);
  const selected = items.find((item) => item.value === value);

  const [search, setSearch] = useState(selected?.label || "");
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) return;
    const match = items.find((item) => item.value === value);
    if (match) setSearch(match.label);
  }, [value, items]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        if (value) {
          const match = items.find((item) => item.value === value);
          if (match) setSearch(match.label);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value, items]);

  const query = search.trim().toLowerCase();
  const showAll = Boolean(selected && search === selected.label);
  const filteredOptions = items.filter((item) => {
    if (showAll || !query) return true;
    return item.label.toLowerCase().includes(query);
  });

  function handleSelect(item: SearchableOption) {
    setSearch(item.label);
    onChange(item.value);
    setOpen(false);
  }

  return (
    <div
      className={`field${full ? " full" : ""}`}
      ref={wrapperRef}
      style={{ position: "relative" }}
    >
      <label>{label}</label>

      <input
        type="text"
        value={search}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          onChange("");
        }}
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "0 0 8px 8px",
            maxHeight: "220px",
            overflowY: "auto",
            boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
          }}
        >
          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding: "12px",
                color: "#777",
              }}
            >
              Data tidak ditemukan
            </div>
          ) : (
            filteredOptions.map((item) => (
              <div
                key={item.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  background:
                    item.value === value ? "var(--satria-green-soft)" : "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    item.value === value ? "var(--satria-green-soft)" : "#fff";
                }}
              >
                {item.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
