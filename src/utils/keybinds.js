import { useMemo } from "react";
import { KEYBIND_SCOPES } from "./Constants";

const keybinds = { "/": {} };
let url = "/";

/**
 * get url-bound addKeyBind and removeKeyBind functions
 */
export function useKeyBinds(url) {
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
export function addKeyBind(keys, callback, scope = "", url = "") {
  const path = url + "/" + scope;
  const local = keybinds[path] ?? {};

  for (const name of Array.isArray(keys) ? keys : [keys])
    local[name] = { callback };

  keybinds[path] = local;
}

/**
 * remove a keyBind
 */
export function removeKeyBind(keys, scope = "", url = "") {
  const path = url + "/" + scope;
  const local = keybinds[path] ?? {};

  for (const name of Array.isArray(keys) ? keys : [keys]) delete local[name];

  keybinds[path] = local;
}

/**
 * set the current url so that we can trigger
 * the right callbacks when the user presses key combinations
 */
export function setUrl(local_url = KEYBIND_SCOPES.APP, scope = "") {
  url = local_url + "/" + scope;
}

export function getCurrentUrl() {
  return url;
}

/**
 * this handles calling callbacks that correspond
 * to user key combinations
 */
globalThis.addEventListener("keydown", (evt) => {
  const dataScope = evt.target.getAttribute("data-scope");
  const path = url + (dataScope ?? "");
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

window.keybinds = keybinds;
