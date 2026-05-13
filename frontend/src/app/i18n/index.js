import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

const LANG_KEY = "dhrs_web_lang";

function getSaved() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === "en" || v === "zh") return v;
  } catch {}
  if (typeof navigator !== "undefined") {
    const lang = navigator.language?.slice(0, 2);
    if (lang === "zh") return "zh";
  }
  return "en";
}

export function toggleLang() {
  const next = i18n.language === "en" ? "zh" : "en";
  localStorage.setItem(LANG_KEY, next);
  i18n.changeLanguage(next);
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh } },
  lng: getSaved(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
