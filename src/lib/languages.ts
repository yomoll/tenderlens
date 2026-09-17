export type LanguageOption = {
  code: string;
  name: string;
  nativeName: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
];
