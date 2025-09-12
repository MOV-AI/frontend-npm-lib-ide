import { WSSub } from "@mov-ai/mov-fe-lib-core";

const socket = new WSSub();
const cache = new Map();
const FLOW_CACHE = (() => {
  function loadData(data) {
    Object.values(data.value.Flow).forEach((flow) => {
      if (!cache.has(flow.Label)) {
        cache.set(flow.Label, flow);
      }
    });
  }

  // init cache
  socket.subscribe(
    {
      Scope: "Flow",
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

export default FLOW_CACHE;
