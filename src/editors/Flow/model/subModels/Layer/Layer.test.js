import Layer from "./Layer";

test("Smoke test", () => {
  const obj = new Layer();

  expect(obj).toBeInstanceOf(Layer);
});

test("Serialize OF db", () => {
  const data = { 0: { name: "layer1", on: true } };

  const expected = {
    id: "0",
    name: "layer1",
    enabled: true
  };

  expect(Layer.serializeOfDB(data)).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const data = {
    id: "0",
    name: "layer1",
    enabled: true
  };

  const expected = { name: "layer1", on: true };

  const obj = new Layer();
  obj.setData(data);

  expect(obj.serializeToDB()).toMatchObject(expected);
});
