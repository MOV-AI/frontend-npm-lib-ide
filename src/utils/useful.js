export
function getIndex(state = {}) {
  return (state.url ?? "initial") + "/" + (state.suffix ?? "right");
}

/*
function popIndex(index) {
  const splits = index.split("/");
  const butLast = [ ...splits ];
  butLast.splice(-1, 1)
  return { url: butLast.join("/"), suffix: splits[splits.length - 1] };
}
*/

export
function getOpen(state = {}) {
  return state.shared ? state[state.suffix] : state[getIndex(state)]?.open;
}

export
function makeSiteSet(set) {
  return (path, callback = a => a) => {
    if (!path)
      return set((state = {}) => {
        const index = getIndex(state);
        const current = state[index] ?? {};
        const value = callback(current, state);

        if (value === current)
          return state;

        return {
          ...state,
          [index]: Object.assign(current, value),
        }
      });
    else
      return set((state = {}) => {
        const index = getIndex(state);
        const current = state[index] ?? {};
        const value = callback(current[path], state);

        if (current[path] === value)
          return state;

        return {
          ...state,
          [index]: Object.assign(current, { [path]: value }),
        };
      });
  };
}

export
function makeUseful(set) {
  const siteSet = makeSiteSet(set);

  return {
    url: "initial",
    suffix: "right",
    siteSet,
    setUrl: url => set((state) => {
      console.log("setUrl", url, state.url);
      if (url === state.url)
        return state;
      return { url };
    }),
    setSuffix: suffix => set((state) => suffix === state.suffix ? state : { suffix }),
  };
}

export
function makeUsefulOpen(set, shared) {
  const useful = makeUseful(set);

  return {
    ...useful,
    shared,
    setOpen: open => set(state => {
      if (open === getOpen(state))
        return state;

      const index = getIndex(state);

      return {
        ...state,
        [index]: { ...state[index] ?? {}, open },
        [state.suffix]: open,
        url: state.url,
      };
    }),
  }
}

export
function useUseful(useBase, anchor) {
  const state = useBase();
  const side = state[state.url + "/" + anchor] ?? {};
  const sharedOpen = state[anchor];
  return { sharedOpen, side, state };
}
