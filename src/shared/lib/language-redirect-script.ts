import { homePath } from "@/shared/config/routes";
import { FALLBACK_LOCALE, LOCALES } from "@/shared/contracts/locale";
import { STORAGE_KEYS } from "@/shared/contracts/state";

/**
 * Source of the inline script of the `/` page (SYS-R08). It runs before React, so it reads the
 * stored preference by itself, and sends the visitor to the home of: (1) the stored language, if
 * valid; (2) the first language of the site, other than the fallback, that the browser asks for;
 * (3) the fallback language. Everything it contains comes from constants of the project (QLT-R48).
 */
export function buildLanguageRedirectScript(): string {
  const paths = JSON.stringify(
    Object.fromEntries(LOCALES.map((locale) => [locale, homePath(locale)])),
  );
  const candidates = JSON.stringify(LOCALES.filter((locale) => locale !== FALLBACK_LOCALE));
  const key = JSON.stringify(STORAGE_KEYS.prefs);
  const fallback = JSON.stringify(FALLBACK_LOCALE);
  return [
    "(function(){",
    `var p=${paths},c=${candidates},l;`,
    `try{var s=JSON.parse(localStorage.getItem(${key})||"null");`,
    'if(s&&typeof s.locale==="string"&&Object.prototype.hasOwnProperty.call(p,s.locale))l=s.locale}catch(e){}',
    'if(!l){var n=navigator.languages||[navigator.language||""];',
    "for(var i=0;i<n.length&&!l;i++)for(var j=0;j<c.length;j++)",
    "if(String(n[i]).toLowerCase().indexOf(c[j])===0){l=c[j];break}}",
    `location.replace(p[l||${fallback}])`,
    "})();",
  ].join("");
}
