import { useState, useEffect } from "react";
import { PLUGINS } from "./Constants";

export
function easySub(defaultData) {
  const subs = new Map();
  const valueMap = { value: defaultData };

  function update(obj) {
    valueMap.value = obj;
    let allPromises = [];
    for (const [sub] of subs)
      allPromises.push(sub(obj));
    return Promise.all(allPromises);
  }

  function subscribe(sub) {
    subs.set(sub, true);
    return () => {
      subs.delete(sub);
    };
  }

  function easyEmit(cb) {
    return async (...args) => update(await cb(...args));
  }

  return { update, subscribe, data: valueMap, easyEmit };
}

export // currently unused
function useSub(sub, defaultData) {
  const [data, setData] = useState(sub.data.value ?? defaultData);
  useEffect(() => sub.subscribe(setData), []);
  return data;
}

export
const remixSub = easySub(null);

export
const remixEmit = remixSub.easyEmit(remix => remix);

export
function useRemix(props) {
  useEffect(() => {
    remixEmit({ on: props.on, off: props.off, call: props.call, emit: remixSub.data.value?.emit ?? {} });
  }, [props.on, props.off, props.call]);
}

export
function call(name, ...args) {
  return new Promise(
    resolve => setTimeout(async () => resolve(await remixSub.data.value.call(name, ...args)), 0)
  );
}

export
function emit(name, ...args) {
  return new Promise(
    resolve => setTimeout(() => resolve(remixSub.data.value.emit[name](...args)), 0)
  );
}

export
function subscribe(name, event, callback) {
  const p = new Promise(resolve => setTimeout(() => {
    remixSub.data.value.on(name, event, callback);
    resolve(() => remixSub.data.value.off(name, event));
  }, 0));
  return () => p.then(unsub => unsub());
}

export
function subscribeAll(arr) {
  const unsubs = arr.map(([ name, key, callback ]) => subscribe(name, key, callback));
  return () => unsubs.forEach(unsub => unsub());;
}

export
function useUpdate() {
  const [_count, setCount] = useState(0);
  return () => setCount(count => count + 1);
}

export
function register(self, name) {
  setTimeout(() => {
    const current = remixSub.data.value ?? {};
    return  remixEmit({
      ...current,
      emit: {
        ...(current.emit ?? {}),
        [self.name]: self.emit.bind(self),
      }
    });
  }, 0);
}
