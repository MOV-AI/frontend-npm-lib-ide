import { i18nHelper } from "@mov-ai/mov-fe-lib-react";
import translationEN from "./languages/en.json";
import translationPT from "./languages/pt.json";

const i18n = i18nHelper.createInstance({
  en: translationEN,
  pt: translationPT
});

export default i18n;
