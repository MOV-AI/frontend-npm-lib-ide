import { useState, useEffect } from "react";
import { makeSub } from "@tty-pt/sub";

export
const remixSub = makeSub(null);

export
const remixEmit = remixSub.makeEmitNow();

export
function useRemix(props) {
  console.log("noremix.useRemix", props);
  remixEmit({ on: props.on, off: props.off, call: props.call, emit: remixSub.data.value?.emit ?? {} });
  // useEffect(() => {
  //   remixEmit({ on: props.on, off: props.off, call: props.call, emit: remixSub.data.value?.emit ?? {} });
  // }, [props.on, props.off, props.call]);
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
  console.log("noremix.register", self, name);
  const current = remixSub.data.value ?? {};
  const { on, off, call } = self;
  return remixEmit({
    ...{ on, off, call },
    ...current,
    emit: {
      ...(current.emit ?? {}),
      [self.name]: self.emit.bind(self),
    }
  });
}
