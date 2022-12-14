import { i18nHelper } from "@mov-ai/mov-fe-lib-react";
import translationEN from "./languages/en.json";
import translationPT from "./languages/pt.json";

const AVAILABLE_TRANSLATIONS = {
  ENGLISH: {
    ABBR: "en",
    LANGUAGE: "English",
    DESCRIPTION: "UK English",
    TRANSLATION: translationEN,
    ACTIVE: true
  },
  PORTUGUESE: {
    ABBR: "pt",
    LANGUAGE: "Português",
    DESCRIPTION: "Português de Portugal",
    TRANSLATION: translationPT,
    ACTIVE: true
  }
};
export const Translations = Object.values(AVAILABLE_TRANSLATIONS).reduce(
  (a, curr) => {
    const language = curr.ACTIVE ? { [curr.ABBR]: curr.TRANSLATION } : {};
    return { ...a, ...language };
  },
  {}
);

const i18n = i18nHelper.createInstance({
  en: translationEN,
  pt: translationPT
});

export default i18n;
