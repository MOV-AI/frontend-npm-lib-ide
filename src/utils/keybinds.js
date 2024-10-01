import { useMemo } from "react";

const keybinds = { "/": {} };
let url = "/";

export
function useKeyBinds(url) {
  return useMemo(() => ({
    addKeyBind: addKeyBind.bind(null, url),
    removeKeyBind: removeKeyBind.bind(null, url),
  }), [url]);
}

export
function addKeyBind(url = '', keys, callback, scope = '') {
  const path = url + "/" + scope;
  const local = keybinds[path] ?? {};

  for (const name of Array.isArray(keys) ? keys : [keys])
    local[name] = { callback };

  keybinds[path] = local;
}

export
function removeKeyBind(url = '', keys, scope = '') {
  const path = url + "/" + scope;
  const local = keybinds[path] ?? {};

  for (const name of Array.isArray(keys) ? keys : [keys])
    delete local[name];

  keybinds[path] = local;
}

export
function setUrl(local_url = 'global', scope = '') {
  url = local_url + '/' + scope;
}

globalThis.addEventListener("keydown", (evt) => {
  const dataScope = evt.target.getAttribute("data-scope");
  const path = url + (dataScope ?? '');
  const kbs = { ...(keybinds[path] ?? {}), ...keybinds["/"] };

  if (evt.key === "Control" || evt.key === "Alt")
    return;

  for (const key of Object.keys(kbs)) {
    const splits = key.split("+").reduce((a, i) => ({
      ...a,
      [i]: true,
    }), {});

    if (!splits[evt.key]
      || (splits.Control && !evt.ctrlKey)
      || (splits.Alt && !evt.altKey)
    ) continue;

    kbs[key].callback(evt);
  }
});

window.keybinds = keybinds;
