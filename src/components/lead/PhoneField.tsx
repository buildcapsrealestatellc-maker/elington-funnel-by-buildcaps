"use client";

import { type CountryCode, getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { useMemo } from "react";

const PRIORITY: CountryCode[] = [
  "AE",
  "SA",
  "QA",
  "KW",
  "BH",
  "OM",
  "IN",
  "PK",
  "GB",
  "RU",
  "CN",
  "US",
  "EG",
  "LB",
  "JO",
  "DE",
  "FR",
];

type PhoneValue = { country: CountryCode; national: string };

export function toE164({ country, national }: PhoneValue) {
  const digits = national.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `+${getCountryCallingCode(country)}${digits}` : "";
}

export function PhoneField({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  value: PhoneValue;
  onChange: (v: PhoneValue) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const options = useMemo(() => {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    const rest = getCountries()
      .filter((c) => !PRIORITY.includes(c))
      .sort((a, b) => (names.of(a) ?? a).localeCompare(names.of(b) ?? b));
    return [...PRIORITY, ...rest].map((c) => ({ code: c, label: `${names.of(c) ?? c} +${getCountryCallingCode(c)}` }));
  }, []);

  return (
    <div
      className={`flex h-14 items-stretch overflow-hidden border bg-paper transition focus-within:border-accent/60 ${
        invalid ? "border-[#d0342c]/60" : "border-ink/12"
      }`}
    >
      <label className="sr-only" htmlFor={`${id}-country`}>
        Country code
      </label>
      <select
        id={`${id}-country`}
        value={value.country}
        onChange={(e) => onChange({ ...value, country: e.target.value as CountryCode })}
        className="numerals w-[6.5rem] shrink-0 cursor-pointer appearance-none border-r border-ink/10 bg-mist pl-4 pr-2 text-[0.95rem] text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.code === value.country ? `${o.code} +${getCountryCallingCode(o.code)}` : o.label}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={value.national}
        onChange={(e) => onChange({ ...value, national: e.target.value.replace(/[^\d\s-]/g, "").slice(0, 18) })}
        placeholder="50 123 4567"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="numerals min-w-0 flex-1 bg-transparent px-4 text-[1rem] text-ink outline-none placeholder:text-stone/50"
      />
    </div>
  );
}
