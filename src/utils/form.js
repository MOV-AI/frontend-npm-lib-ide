function camelCaseKey(key) {
  return key.replace(/_([a-z0-9])/g, function (g) { return g[1].toUpperCase(); });
}

const hiddenHandlers = {
  json: value => JSON.parse(value),
};

const typeHandlers = {
  hidden: (value, el) => {
    return (hiddenHandlers[el.getAttribute("data-hidden-type")] || (value => value))(value);
  },
  text: value => value,
  checkbox: value => value !== undefined,
};

export default
function formJson(form) {
  const fd = new FormData(form);
  let obj = {};

  fd.forEach((value, key) => {
    const el = form.querySelector(`[name=${key}]`);
    console.assert(el);
    const handler = typeHandlers[el.getAttribute("type") ?? "text"];
    console.assert(handler);
    obj[camelCaseKey(key)] = handler(value, el);
  });

  return obj;
}
