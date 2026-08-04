import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRY_CODES } from "@/lib/country-codes";

export interface PhoneCapsuleInputProps {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
  actionButton?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PhoneCapsuleInput({
  countryCode = "+91",
  onCountryCodeChange,
  value,
  onChange,
  onBlur,
  name = "phone",
  placeholder = "98765 43210",
  actionButton,
  className = "",
  disabled = false,
}: PhoneCapsuleInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCountry =
    COUNTRY_CODES.find((c) => c.dialCode === countryCode) || COUNTRY_CODES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  const getDisplayValue = (val: string, code: string) => {
    if (!val) return "";
    let clean = val.trim();
    if (code && clean.startsWith(code)) {
      clean = clean.slice(code.length).trim();
    } else {
      const matched = COUNTRY_CODES.find((c) => clean.startsWith(c.dialCode));
      if (matched) {
        clean = clean.slice(matched.dialCode.length).trim();
      } else if (clean.startsWith("+")) {
        clean = clean.replace(/^\+\d{1,4}/, "").trim();
      }
    }
    return clean;
  };

  const displayValue = getDisplayValue(value || "", countryCode);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal.startsWith("+")) {
      const matched = COUNTRY_CODES.find((c) => rawVal.startsWith(c.dialCode));
      if (matched) {
        onCountryCodeChange(matched.dialCode);
        const stripped = rawVal.slice(matched.dialCode.length).trim();
        e.target.value = stripped;
        onChange(e);
        return;
      }
    }
    onChange(e);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative flex items-center rounded-2xl border border-border/80 bg-background text-foreground shadow-inner focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all ${className}`}
    >
      {/* Left Country Code Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center gap-1.5 pl-3.5 pr-3 py-3 border-r border-border/60 shrink-0 select-none bg-muted/20 hover:bg-muted/40 transition-colors rounded-l-2xl cursor-pointer disabled:cursor-not-allowed"
      >
        <span className="text-lg leading-none">{activeCountry.flag}</span>
        <span className="text-xs font-mono font-extrabold text-foreground">
          {activeCountry.dialCode}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Custom Theme Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-h-72 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          {/* Search Input */}
          <div className="relative flex items-center px-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full rounded-xl bg-background/80 border border-border/60 text-xs text-foreground font-mono pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
            />
          </div>

          {/* Scrollable List */}
          <div className="overflow-y-auto max-h-52 space-y-0.5 custom-scrollbar pr-0.5">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.dialCode === countryCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onCountryCodeChange(c.dialCode);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors text-left ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold border border-primary/20"
                        : "text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-base leading-none shrink-0">{c.flag}</span>
                      <span className="font-extrabold text-foreground shrink-0">
                        {c.dialCode}
                      </span>
                      <span className="text-muted-foreground font-sans truncate text-[11px]">
                        {c.name}
                      </span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No matching countries found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone Number Input Field */}
      <input
        type="tel"
        name={name}
        value={displayValue}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-transparent font-mono text-sm px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none border-none disabled:opacity-50"
      />

      {/* Action Button */}
      {actionButton && <div className="pr-2 shrink-0">{actionButton}</div>}
    </div>
  );
}
