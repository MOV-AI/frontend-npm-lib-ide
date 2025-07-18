import { MasterDB } from "@mov-ai/mov-fe-lib-core";

const cache = new Map();
const NODE_CACHE = (() => {
  function loadData(data) {
    Object.values(data.value.Node).forEach((node) => {
      if (!cache.has(node.Label)) {
        cache.set(node.Label, node);
      }
    });
  }

  // init cache
  MasterDB.subscribe(
    {
      Scope: "Node",
      Name: "*",
    },
    (_) => {},
    (data) => loadData(data),
  );

  return {
    get: (name) => cache.get(name),
    set: (name, value) => cache.set(name, value),
    has: (name) => cache.has(name),
    clear: () => cache.clear(),
  };
})();

export default NODE_CACHE;
