"use client";

import { useEffect, useRef, useState } from "react";

type SearchableSelectProps = {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
};

export function SearchableSelect({
  label,
  value,
  options,
  placeholder = "Ketik untuk mencari...",
  required = false,
  onChange,
}: SearchableSelectProps) {
  const [search, setSearch] = useState(value);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sinkronkan jika value berubah dari luar
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Tutup dropdown ketika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(option: string) {
    setSearch(option);
    onChange(option);
    setOpen(false);
  }

  return (
    <div
      className="field"
      ref={wrapperRef}
      style={{ position: "relative" }}
    >
      <label>{label}</label>

      <input
        type="text"
        value={search}
        placeholder={placeholder}
        required={required}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);

          // Kosongkan value jika user mengetik ulang
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
            filteredOptions.map((option) => (
              <div
                key={option}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
              >
                {option}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}