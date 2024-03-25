import { i18n } from "@mov-ai/mov-fe-lib-react";
import translationEN from "./languages/en.js";
import translationPT from "./languages/pt.js";

export const Translations = {
  pt: translationPT,
  en: translationEN
};

i18n.addResourceBundle("en", "translation", Translations.en, true, true);
i18n.addResourceBundle("pt", "translation", Translations.pt, true, true);
