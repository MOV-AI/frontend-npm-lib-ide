import NumberType from "./NumberType";

test("Smoke test", () => {
  const obj = new NumberType({});
  expect(obj).toBeInstanceOf(NumberType);
});

test("Validation for real objects", () => {
  const type = new NumberType({});

  type.validate({}).then(res => expect(res.success).toBe(false));
  type.validate([]).then(res => expect(res.success).toBe(false));
  type.validate(undefined).then(res => expect(res.success).toBe(true));
  type.validate(null).then(res => expect(res.success).toBe(false));
  type.validate(false).then(res => expect(res.success).toBe(false));
  type.validate(true).then(res => expect(res.success).toBe(false));
  type.validate(3).then(res => expect(res.success).toBe(true));
  type.validate({a: 1}).then(res => expect(res.success).toBe(false));
  type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(false));
  type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(false));
  type.validate([1]).then(res => expect(res.success).toBe(false));
  type.validate([[1, 2]]).then(res => expect(res.success).toBe(false));
  type.validate([[1, 2], {}]).then(res => expect(res.success).toBe(false));

  type.validate("{}").then(res => expect(res.success).toBe(false));
  type.validate("[]").then(res => expect(res.success).toBe(false));
  type.validate("").then(res => expect(res.success).toBe(false));
  type.validate("null").then(res => expect(res.success).toBe(false));
  type.validate("False").then(res => expect(res.success).toBe(false));
  type.validate("True").then(res => expect(res.success).toBe(false));
  type.validate("3").then(res => expect(res.success).toBe(false));
  type.validate("{a: 1}").then(res => expect(res.success).toBe(false));
  type.validate("{a: [1, 2]}").then(res => expect(res.success).toBe(false));
  type.validate("{a: [1, 2], b: {}}").then(res => expect(res.success).toBe(false));
  type.validate("[1]").then(res => expect(res.success).toBe(false));
  type.validate("[[1, 2]]").then(res => expect(res.success).toBe(false));
  type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(false));
});

test("Validation for onlyStrings", () => {
  const type = new NumberType({ onlyStrings: true });

  type.validate({}).then(res => expect(res.success).toBe(false));
  type.validate([]).then(res => expect(res.success).toBe(false));
  type.validate(undefined).then(res => expect(res.success).toBe(false));
  type.validate(null).then(res => expect(res.success).toBe(false));
  type.validate(false).then(res => expect(res.success).toBe(false));
  type.validate(true).then(res => expect(res.success).toBe(false));
  // the following happens because JSON.parse("3") => 3
  type.validate(3).then(res => expect(res.success).toBe(true));
  type.validate({a: 1}).then(res => expect(res.success).toBe(false));
  type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(false));
  type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(false));
  // the following happens because JSON.parse([1]) => 1
  type.validate([1]).then(res => expect(res.success).toBe(true));
  type.validate([[1, 2]]).then(res => expect(res.success).toBe(false));
  type.validate([[1, 2], {}]).then(res => expect(res.success).toBe(false));

  type.validate("{}").then(res => expect(res.success).toBe(false));
  type.validate("[]").then(res => expect(res.success).toBe(false));
  type.validate("").then(res => expect(res.success).toBe(true));
  type.validate("null").then(res => expect(res.success).toBe(false));
  type.validate("False").then(res => expect(res.success).toBe(false));
  type.validate("True").then(res => expect(res.success).toBe(false));
  type.validate("3").then(res => expect(res.success).toBe(true));
  type.validate('{"a": 1}').then(res => expect(res.success).toBe(false));
  type.validate('{"a": [1, 2]}').then(res => expect(res.success).toBe(false));
  type.validate('{"a": [1, 2], "b": {}}').then(res => expect(res.success).toBe(false));
  type.validate("[1]").then(res => expect(res.success).toBe(false));
  type.validate("[[1, 2]]").then(res => expect(res.success).toBe(false));
  type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(false));
});
