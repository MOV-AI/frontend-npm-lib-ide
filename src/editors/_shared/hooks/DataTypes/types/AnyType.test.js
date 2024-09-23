import AnyType from "./AnyType";

test("Smoke test", () => {
  const obj = new AnyType({});
  expect(obj).toBeInstanceOf(AnyType);
});

test("Validation for real objects", () => {
  const type = new AnyType({});

  type.validate({}).then(res => expect(res.success).toBe(true));
  type.validate([]).then(res => expect(res.success).toBe(true));
  type.validate(undefined).then(res => expect(res.success).toBe(true));
  type.validate(null).then(res => expect(res.success).toBe(true));
  type.validate(false).then(res => expect(res.success).toBe(true));
  type.validate(true).then(res => expect(res.success).toBe(true));
  type.validate(3).then(res => expect(res.success).toBe(true));
  type.validate({a: 1}).then(res => expect(res.success).toBe(true));
  type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(true));
  type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(true));
  type.validate([1]).then(res => expect(res.success).toBe(true));
  type.validate([[1, 2]]).then(res => expect(res.success).toBe(true));
  type.validate([[1, 2], {}]).then(res => expect(res.success).toBe(true));

  type.validate("{}").then(res => expect(res.success).toBe(true));
  type.validate("[]").then(res => expect(res.success).toBe(true));
  type.validate("").then(res => expect(res.success).toBe(true));
  type.validate("null").then(res => expect(res.success).toBe(true));
  type.validate("False").then(res => expect(res.success).toBe(true));
  type.validate("True").then(res => expect(res.success).toBe(true));
  type.validate("3").then(res => expect(res.success).toBe(true));
  type.validate("{a: 1}").then(res => expect(res.success).toBe(true));
  type.validate("{a: [1, 2]}").then(res => expect(res.success).toBe(true));
  type.validate("{a: [1, 2], b: {}}").then(res => expect(res.success).toBe(true));
  type.validate("[1]").then(res => expect(res.success).toBe(true));
  type.validate("[[1, 2]]").then(res => expect(res.success).toBe(true));
  type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(true));
});

test("Validation for onlyStrings", () => {
  const type = new AnyType({ onlyStrings: true });
  // anyType doesn't do parsing, and anything is valid,
  // even in onlyStrings mode. Although we never get
  // any real Objects actually.

  type.validate({}).then(res => expect(res.success).toBe(true));
  type.validate([]).then(res => expect(res.success).toBe(true));
  type.validate(undefined).then(res => expect(res.success).toBe(true));
  type.validate(null).then(res => expect(res.success).toBe(true));
  type.validate(false).then(res => expect(res.success).toBe(true));
  type.validate(true).then(res => expect(res.success).toBe(true));
  type.validate(3).then(res => expect(res.success).toBe(true));
  type.validate({a: 1}).then(res => expect(res.success).toBe(true));
  type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(true));
  type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(true));
  type.validate([1]).then(res => expect(res.success).toBe(true));
  type.validate([[1, 2]]).then(res => expect(res.success).toBe(true));
  type.validate([[1, 2], {}]).then(res => expect(res.success).toBe(true));

  type.validate("{}").then(res => expect(res.success).toBe(true));
  type.validate("[]").then(res => expect(res.success).toBe(true));
  type.validate("").then(res => expect(res.success).toBe(true));
  type.validate("null").then(res => expect(res.success).toBe(true));
  type.validate("False").then(res => expect(res.success).toBe(true));
  type.validate("True").then(res => expect(res.success).toBe(true));
  type.validate("3").then(res => expect(res.success).toBe(true));
  type.validate('{"a": 1}').then(res => expect(res.success).toBe(true));
  type.validate('{"a": [1, 2]}').then(res => expect(res.success).toBe(true));
  type.validate('{"a": [1, 2], "b": {}}').then(res => expect(res.success).toBe(true));
  type.validate("[1]").then(res => expect(res.success).toBe(true));
  type.validate("[[1, 2]]").then(res => expect(res.success).toBe(true));
  type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(true));
});

