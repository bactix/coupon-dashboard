"use client";

import { Combobox } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  COUNTRY_CODES,
  DEFAULT_DIAL_CODE,
  type CountryCode,
} from "@/lib/country-codes";

interface PhoneInputProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Splits a stored phone value (e.g. "+961 03395854") into its dial code and
 * local number. Falls back to the default dial code when none is present.
 */
function parsePhone(value: string | undefined): { dialCode: string; number: string } {
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    return { dialCode: DEFAULT_DIAL_CODE, number: "" };
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex >= 0) {
    return {
      dialCode: trimmed.slice(0, spaceIndex),
      number: trimmed.slice(spaceIndex + 1).replace(/\D/g, ""),
    };
  }

  // No space: either a bare dial code ("+961") or a bare number ("03395854").
  if (trimmed.startsWith("+")) {
    return { dialCode: trimmed, number: "" };
  }
  return { dialCode: DEFAULT_DIAL_CODE, number: trimmed.replace(/\D/g, "") };
}

function findCountry(dialCode: string): CountryCode {
  return (
    COUNTRY_CODES.find((c) => c.dialCode === dialCode) ??
    COUNTRY_CODES.find((c) => c.dialCode === DEFAULT_DIAL_CODE)!
  );
}

export function PhoneInput({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = "03 395 854",
}: PhoneInputProps) {
  const { dialCode, number } = parsePhone(value);
  const selected = findCountry(dialCode);

  const emit = (nextDialCode: string, nextNumber: string) => {
    onChange(`${nextDialCode} ${nextNumber}`);
  };

  return (
    <div className="flex gap-2">
      <Combobox.Root
        items={COUNTRY_CODES as CountryCode[]}
        value={selected}
        onValueChange={(country: CountryCode | null) => {
          if (country) emit(country.dialCode, number);
        }}
        itemToStringLabel={(country: CountryCode) => `${country.name} ${country.dialCode}`}
        disabled={disabled}
      >
        <Combobox.Trigger
          className={cn(
            "flex h-9 w-28 shrink-0 items-center justify-between gap-1.5 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <Combobox.Value>
            {(country: CountryCode) => (
              <span className="flex items-center gap-1.5">
                <span>{country.flag}</span>
                <span>{country.dialCode}</span>
              </span>
            )}
          </Combobox.Value>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </Combobox.Trigger>

        <Combobox.Portal>
          <Combobox.Positioner side="bottom" align="start" sideOffset={4} className="z-50">
            <Combobox.Popup className="w-64 origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 border-b px-3">
                <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                <Combobox.Input
                  placeholder="Search country..."
                  className="h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                No country found.
              </Combobox.Empty>
              <Combobox.List className="max-h-60 overflow-y-auto p-1">
                {(country: CountryCode) => (
                  <Combobox.Item
                    key={country.iso}
                    value={country}
                    className={cn(
                      "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none",
                      "data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                    )}
                  >
                    <span>{country.flag}</span>
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="text-muted-foreground">{country.dialCode}</span>
                    <Combobox.ItemIndicator className="absolute right-2 flex items-center">
                      <CheckIcon className="size-4" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        disabled={disabled}
        value={number}
        onChange={(e) => emit(dialCode, e.target.value.replace(/\D/g, ""))}
      />
    </div>
  );
}
