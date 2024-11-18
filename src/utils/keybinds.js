import { useMemo } from "react";
import { KEYBIND_SCOPES } from "./Constants";

const keybinds = { "/": {} };
let globalUrl = "";

/**
 * Composes a path given an url and a scope.
 * If we don't have a scope we just return the url
 * @param {string} url
 * @param {string} scope
 * @returns
 */
function composePath(url, scope) {
  return url + "/" + scope;
}

/**
 * get url-bound addKeyBind and removeKeyBind functions
 */
export function useKeyBinds(url = globalUrl) {
  return useMemo(
    () => ({
      addKeyBind: (keys, callback, scope) =>
        addKeyBind(keys, callback, scope, url),
      removeKeyBind: (keys, scope) => removeKeyBind(keys, scope, url),
    }),
    [url],
  );
}

/**
 * add a keyBind
 * provide a scope and/or a url to have that keybind apply only
 * in a certain context
 */
export function addKeyBind(
  keys,
  callback,
  scope = "",
  url = KEYBIND_SCOPES.APP,
) {
  const path = composePath(url, scope);
  const local = keybinds[path] ?? {};

  for (const name of Array.isArray(keys) ? keys : [keys])
    local[name] = { callback };

  keybinds[path] = local;
}

/**
 * remove a keyBind
 */
export function removeKeyBind(keys, scope = "", url = KEYBIND_SCOPES.APP) {
  const path = composePath(url, scope);
  const local = keybinds[path] ?? {};

  for (const name of Array.isArray(keys) ? keys : [keys]) delete local[name];

  keybinds[path] = local;
}

/**
 * set the current url so that we can trigger
 * the right callbacks when the user presses key combinations
 */
export function setUrl(url = KEYBIND_SCOPES.APP) {
  globalUrl = url;
}

export function getCurrentUrl() {
  return globalUrl;
}

/**
 * this handles calling callbacks that correspond
 * to user key combinations
 */
globalThis.addEventListener("keydown", (evt) => {
  const dataScope = evt.target.getAttribute("data-scope");
  const path = composePath(globalUrl, dataScope ?? "");
  const kbs = { ...(keybinds[path] ?? {}), ...keybinds["/"] };

  if (evt.key === "Control" || evt.key === "Alt") return;

  for (const key of Object.keys(kbs)) {
    const splits = key.split("+").reduce(
      (a, i) => ({
        ...a,
        [i]: true,
      }),
      {},
    );

    if (
      !splits[evt.key] ||
      (splits.Control && !evt.ctrlKey) ||
      (splits.Alt && !evt.altKey)
    )
      continue;

    kbs[key].callback(evt);
  }
});

globalThis.keybinds = keybinds;
globalThis.getCurrentUrl = getCurrentUrl;
