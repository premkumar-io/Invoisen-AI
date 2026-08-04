import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { createPortal } from "react-dom";

export interface CountryCode {
  code: string;
  flag: string;
  name: string;
  iso: string;
}

export const countryCodes: CountryCode[] = [
  { code: "+91", flag: "🇮🇳", name: "India", iso: "IN" },
  { code: "+1", flag: "🇺🇸", name: "United States", iso: "US" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom", iso: "GB" },
  { code: "+971", flag: "🇦🇪", name: "United Arab Emirates", iso: "AE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore", iso: "SG" },
  { code: "+61", flag: "🇦🇺", name: "Australia", iso: "AU" },
  { code: "+49", flag: "🇩🇪", name: "Germany", iso: "DE" },
  { code: "+33", flag: "🇫🇷", name: "France", iso: "FR" },
  { code: "+81", flag: "🇯🇵", name: "Japan", iso: "JP" },
  { code: "+86", flag: "🇨🇳", name: "China", iso: "CN" },
  { code: "+55", flag: "🇧🇷", name: "Brazil", iso: "BR" },
  { code: "+7", flag: "🇷🇺", name: "Russia", iso: "RU" },
  { code: "+27", flag: "🇿🇦", name: "South Africa", iso: "ZA" },
  { code: "+82", flag: "🇰🇷", name: "South Korea", iso: "KR" },
  { code: "+39", flag: "🇮🇹", name: "Italy", iso: "IT" },
  { code: "+34", flag: "🇪🇸", name: "Spain", iso: "ES" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands", iso: "NL" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland", iso: "CH" },
  { code: "+46", flag: "🇸🇪", name: "Sweden", iso: "SE" },
  { code: "+47", flag: "🇳🇴", name: "Norway", iso: "NO" },
  { code: "+45", flag: "🇩🇰", name: "Denmark", iso: "DK" },
  { code: "+358", flag: "🇫🇮", name: "Finland", iso: "FI" },
  { code: "+32", flag: "🇧🇪", name: "Belgium", iso: "BE" },
  { code: "+43", flag: "🇦🇹", name: "Austria", iso: "AT" },
  { code: "+353", flag: "🇮🇪", name: "Ireland", iso: "IE" },
  { code: "+48", flag: "🇵🇱", name: "Poland", iso: "PL" },
  { code: "+351", flag: "🇵🇹", name: "Portugal", iso: "PT" },
  { code: "+30", flag: "🇬🇷", name: "Greece", iso: "GR" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic", iso: "CZ" },
  { code: "+36", flag: "🇭🇺", name: "Hungary", iso: "HU" },
  { code: "+40", flag: "🇷🇴", name: "Romania", iso: "RO" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine", iso: "UA" },
  { code: "+90", flag: "🇹🇷", name: "Turkey", iso: "TR" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", iso: "SA" },
  { code: "+974", flag: "🇶🇦", name: "Qatar", iso: "QA" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait", iso: "KW" },
  { code: "+968", flag: "🇴🇲", name: "Oman", iso: "OM" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain", iso: "BH" },
  { code: "+962", flag: "🇯🇴", name: "Jordan", iso: "JO" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon", iso: "LB" },
  { code: "+20", flag: "🇪🇬", name: "Egypt", iso: "EG" },
  { code: "+212", flag: "🇲🇦", name: "Morocco", iso: "MA" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria", iso: "NG" },
  { code: "+254", flag: "🇰🇪", name: "Kenya", iso: "KE" },
  { code: "+233", flag: "🇬🇭", name: "Ghana", iso: "GH" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan", iso: "PK" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh", iso: "BD" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka", iso: "LK" },
  { code: "+977", flag: "🇳🇵", name: "Nepal", iso: "NP" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia", iso: "ID" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia", iso: "MY" },
  { code: "+63", flag: "🇵🇭", name: "Philippines", iso: "PH" },
  { code: "+66", flag: "🇹🇭", name: "Thailand", iso: "TH" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam", iso: "VN" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand", iso: "NZ" },
  { code: "+52", flag: "🇲🇽", name: "Mexico", iso: "MX" },
  { code: "+57", flag: "🇨🇴", name: "Colombia", iso: "CO" },
  { code: "+56", flag: "🇨🇱", name: "Chile", iso: "CL" },
  { code: "+51", flag: "🇵🇪", name: "Peru", iso: "PE" },
  { code: "+54", flag: "🇦🇷", name: "Argentina", iso: "AR" },
  { code: "+98", flag: "🇮🇷", name: "Iran", iso: "IR" },
  { code: "+964", flag: "🇮🇶", name: "Iraq", iso: "IQ" },
  { code: "+972", flag: "🇮🇱", name: "Israel", iso: "IL" },
  { code: "+370", flag: "🇱🇹", name: "Lithuania", iso: "LT" },
  { code: "+371", flag: "🇱🇻", name: "Latvia", iso: "LV" },
  { code: "+372", flag: "🇪🇪", name: "Estonia", iso: "EE" },
  { code: "+354", flag: "🇮🇸", name: "Iceland", iso: "IS" },
  { code: "+356", flag: "🇲🇹", name: "Malta", iso: "MT" },
  { code: "+357", flag: "🇨🇾", name: "Cyprus", iso: "CY" },
  { code: "+359", flag: "🇧🇬", name: "Bulgaria", iso: "BG" },
  { code: "+385", flag: "🇭🇷", name: "Croatia", iso: "HR" },
  { code: "+381", flag: "🇷🇸", name: "Serbia", iso: "RS" },
  { code: "+386", flag: "🇸🇮", name: "Slovenia", iso: "SI" },
  { code: "+389", flag: "🇲🇰", name: "North Macedonia", iso: "MK" },
  { code: "+355", flag: "🇦🇱", name: "Albania", iso: "AL" },
  { code: "+373", flag: "🇲🇩", name: "Moldova", iso: "MD" },
  { code: "+374", flag: "🇦🇲", name: "Armenia", iso: "AM" },
  { code: "+994", flag: "🇦🇿", name: "Azerbaijan", iso: "AZ" },
  { code: "+995", flag: "🇬🇪", name: "Georgia", iso: "GE" },
  { code: "+976", flag: "🇲🇳", name: "Mongolia", iso: "MN" },
  { code: "+855", flag: "🇰🇭", name: "Cambodia", iso: "KH" },
  { code: "+856", flag: "🇱🇦", name: "Laos", iso: "LA" },
  { code: "+95", flag: "🇲🇲", name: "Myanmar", iso: "MM" },
  { code: "+673", flag: "🇧🇳", name: "Brunei", iso: "BN" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong", iso: "HK" },
  { code: "+886", flag: "🇹🇼", name: "Taiwan", iso: "TW" },
  { code: "+853", flag: "🇲🇴", name: "Macau", iso: "MO" },
  { code: "+992", flag: "🇹🇯", name: "Tajikistan", iso: "TJ" },
  { code: "+993", flag: "🇹🇲", name: "Turkmenistan", iso: "TM" },
  { code: "+998", flag: "🇺🇿", name: "Uzbekistan", iso: "UZ" },
  { code: "+7", flag: "🇰ℤ", name: "Kazakhstan", iso: "KZ" },
  { code: "+996", flag: "🇰🇬", name: "Kyrgyzstan", iso: "KG" },
  { code: "+255", flag: "🇹ℤ", name: "Tanzania", iso: "TZ" },
  { code: "+256", flag: "🇺🇬", name: "Uganda", iso: "UG" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda", iso: "RW" },
  { code: "+260", flag: "🇿🇲", name: "Zambia", iso: "ZM" },
  { code: "+263", flag: "🇿🇼", name: "Zimbabwe", iso: "ZW" },
  { code: "+258", flag: "🇲ℤ", name: "Mozambique", iso: "MZ" },
  { code: "+244", flag: "🇦🇴", name: "Angola", iso: "AO" },
  { code: "+237", flag: "🇨🇲", name: "Cameroon", iso: "CM" },
  { code: "+221", flag: "🇸🇳", name: "Senegal", iso: "SN" },
  { code: "+225", flag: "🇨🇮", name: "Ivory Coast", iso: "CI" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador", iso: "EC" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay", iso: "PY" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay", iso: "UY" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela", iso: "VE" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia", iso: "BO" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala", iso: "GT" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador", iso: "SV" },
  { code: "+504", flag: "🇭🇳", name: "Honduras", iso: "HN" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua", iso: "NI" },
  { code: "+1", flag: "🇯🇲", name: "Jamaica", iso: "JM" },
  { code: "+1", flag: "🇹🇹", name: "Trinidad & Tobago", iso: "TT" },
  { code: "+1", flag: "🇧🇧", name: "Barbados", iso: "BB" },
  { code: "+1", flag: "🇧🇸", name: "Bahamas", iso: "BS" },
  { code: "+1", flag: "🇩🇴", name: "Dominican Republic", iso: "DO" },
  { code: "+1", flag: "🇵🇷", name: "Puerto Rico", iso: "PR" },
];

export const PhoneInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { defaultCode?: string }
>(({ className = "", defaultCode = "+91", placeholder = "98765 43210", onChange, value, name, ...props }, ref) => {
  const [selectedCode, setSelectedCode] = useState(defaultCode);
  const [internalValue, setInternalValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const isControlled = value !== undefined && value !== null;
  const currentVal = isControlled ? String(value) : internalValue;

  let rawValue = currentVal;
  let activeCountryCode = selectedCode;

  if (rawValue.startsWith("+")) {
    const matched = countryCodes.find((c) => rawValue.startsWith(c.code));
    if (matched) {
      activeCountryCode = matched.code;
      rawValue = rawValue.slice(matched.code.length).trim();
    }
  }

  const activeCountry = countryCodes.find((c) => c.code === activeCountryCode) || countryCodes[0];

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const renderAbove = spaceBelow < 280 && spaceAbove > 280;
        setPopoverPos({
          top: renderAbove ? Math.max(10, rect.top - 275) : rect.bottom + 6,
          left: Math.min(Math.max(10, rect.left), window.innerWidth - 275),
        });
      }
    };

    updatePosition();

    const handleScroll = (e: Event) => {
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countryCodes;
    const q = searchQuery.toLowerCase().trim();
    return countryCodes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typedVal = e.target.value;
    let cleanNumber = typedVal;
    let newCode = selectedCode;

    if (typedVal.startsWith("+")) {
      const matched = countryCodes.find((c) => typedVal.startsWith(c.code));
      if (matched) {
        newCode = matched.code;
        setSelectedCode(matched.code);
        cleanNumber = typedVal.slice(matched.code.length).trim();
      }
    }

    const fullVal = cleanNumber ? `${newCode} ${cleanNumber}` : "";

    if (!isControlled) {
      setInternalValue(fullVal);
    }

    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name,
          value: fullVal,
        },
      };
      onChange(syntheticEvent as any);
    }
  };

  const handleSelectCountry = (c: CountryCode) => {
    setSelectedCode(c.code);
    setIsOpen(false);
    setSearchQuery("");

    const fullVal = rawValue ? `${c.code} ${rawValue}` : "";

    if (!isControlled) {
      setInternalValue(fullVal);
    }

    if (onChange) {
      const event = {
        target: {
          name,
          value: fullVal,
        },
      };
      onChange(event as any);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center h-10 rounded-2xl border border-border/80 bg-card/60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden shadow-sm">
        {/* Country Code Selector Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 pl-3 pr-2 h-full bg-muted/40 hover:bg-muted/70 border-r border-border/60 text-xs font-mono font-bold text-foreground transition-colors shrink-0 outline-none cursor-pointer select-none"
        >
          <span className="text-sm">{activeCountry.flag}</span>
          <span>{activeCountry.code}</span>
          <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Local Phone Number Input */}
        <input
          ref={ref}
          type="tel"
          name={name}
          placeholder={placeholder}
          className={`w-full h-full bg-transparent px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none border-none ${className}`}
          {...props}
          value={rawValue}
          onChange={handleInputChange}
        />
      </div>

      {/* Render Country Dropdown via React Portal */}
      {isOpen && typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop Dismiss */}
            <div className="fixed inset-0 z-[99998]" onClick={() => setIsOpen(false)} />

            {/* Floating Popover Container */}
            <div
              ref={popoverRef}
              style={{
                position: "fixed",
                top: `${popoverPos.top}px`,
                left: `${popoverPos.left}px`,
                width: "260px",
              }}
              className="z-[99999] rounded-2xl border border-border/80 bg-card/98 p-2.5 shadow-2xl backdrop-blur-2xl animate-in fade-in-50 slide-in-from-top-1 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input Box */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or code..."
                  autoFocus
                  className="w-full rounded-xl bg-muted/70 pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none border border-border/60 focus:border-primary/60"
                />
              </div>

              {/* Countries List */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                {filteredCountries.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                    No matching country found
                  </div>
                ) : (
                  filteredCountries.map((c, index) => (
                    <button
                      key={`${c.code}-${c.name}-${index}`}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                        c.code === activeCountry.code && c.name === activeCountry.name
                          ? "bg-primary/15 text-primary font-bold"
                          : "hover:bg-muted/70 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-sm shrink-0">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground shrink-0">{c.code}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";
