"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface AddressSuggestion {
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

interface AddressData {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressInputProps {
  value?: AddressData;
  onChange: (address: AddressData) => void;
  className?: string;
}

export function AddressInput({ value, onChange, className = "" }: AddressInputProps) {
  const [query, setQuery] = useState(value?.addressLine1 || "");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const [address, setAddress] = useState<AddressData>(
    value || {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    }
  );

  const updateField = useCallback(
    (field: keyof AddressData, val: string) => {
      const updated = { ...address, [field]: val };
      setAddress(updated);
      onChange(updated);
    },
    [address, onChange]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function searchAddress(q: string) {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    updateField("addressLine1", val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 400);
  }

  function selectSuggestion(s: AddressSuggestion) {
    const addr = s.address;
    const line1 = [addr.house_number, addr.road].filter(Boolean).join(" ") || s.display_name.split(",")[0];
    const city = addr.city || addr.town || addr.village || "";
    const state = addr.state || "";
    const zip = addr.postcode || "";
    const country = addr.country || "";

    const updated: AddressData = {
      addressLine1: line1,
      addressLine2: "",
      city,
      state,
      zipCode: zip,
      country,
    };

    setQuery(line1);
    setAddress(updated);
    onChange(updated);
    setShowSuggestions(false);
  }

  return (
    <div className={`space-y-3 ${className}`} ref={containerRef}>
      {/* Street address with autocomplete */}
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={handleQueryChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Start typing an address..."
            className="h-10 pl-10"
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            </div>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 flex items-start gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Address Line 2 */}
      <Input
        value={address.addressLine2}
        onChange={(e) => updateField("addressLine2", e.target.value)}
        placeholder="Apt, suite, unit (optional)"
        className="h-10"
      />

      {/* City + State row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={address.city}
          onChange={(e) => updateField("city", e.target.value)}
          placeholder="City"
          className="h-10"
        />
        <Input
          value={address.state}
          onChange={(e) => updateField("state", e.target.value)}
          placeholder="State / Province"
          className="h-10"
        />
      </div>

      {/* Zip + Country row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          value={address.zipCode}
          onChange={(e) => updateField("zipCode", e.target.value)}
          placeholder="ZIP / Postal code"
          className="h-10"
        />
        <Input
          value={address.country}
          onChange={(e) => updateField("country", e.target.value)}
          placeholder="Country"
          className="h-10"
        />
      </div>
    </div>
  );
}
