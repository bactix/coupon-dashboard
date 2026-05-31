export interface CountryCode {
  name: string;
  dialCode: string;
  iso: string;
  flag: string;
}

// Lebanon is intentionally first so it can be used as the default.
export const COUNTRY_CODES: readonly CountryCode[] = [
  { name: "Lebanon", dialCode: "+961", iso: "LB", flag: "🇱🇧" },
  { name: "United Arab Emirates", dialCode: "+971", iso: "AE", flag: "🇦🇪" },
  { name: "Saudi Arabia", dialCode: "+966", iso: "SA", flag: "🇸🇦" },
  { name: "Qatar", dialCode: "+974", iso: "QA", flag: "🇶🇦" },
  { name: "Kuwait", dialCode: "+965", iso: "KW", flag: "🇰🇼" },
  { name: "Bahrain", dialCode: "+973", iso: "BH", flag: "🇧🇭" },
  { name: "Oman", dialCode: "+968", iso: "OM", flag: "🇴🇲" },
  { name: "Jordan", dialCode: "+962", iso: "JO", flag: "🇯🇴" },
  { name: "Syria", dialCode: "+963", iso: "SY", flag: "🇸🇾" },
  { name: "Iraq", dialCode: "+964", iso: "IQ", flag: "🇮🇶" },
  { name: "Egypt", dialCode: "+20", iso: "EG", flag: "🇪🇬" },
  { name: "France", dialCode: "+33", iso: "FR", flag: "🇫🇷" },
  { name: "Germany", dialCode: "+49", iso: "DE", flag: "🇩🇪" },
  { name: "United Kingdom", dialCode: "+44", iso: "GB", flag: "🇬🇧" },
  { name: "United States", dialCode: "+1", iso: "US", flag: "🇺🇸" },
  { name: "Turkey", dialCode: "+90", iso: "TR", flag: "🇹🇷" },
  { name: "Canada", dialCode: "+1", iso: "CA", flag: "🇨🇦" },
];

export const DEFAULT_DIAL_CODE = "+961";
