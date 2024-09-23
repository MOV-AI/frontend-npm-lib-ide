import BooleanType from "./BooleanType";

test("Smoke test", () => {
  const obj = new BooleanType({});
  expect(obj).toBeInstanceOf(BooleanType);
});

test("Validation for real objects", () => {
  const type = new BooleanType({});

  type.validate({}).then(res => expect(res.success).toBe(false));
  type.validate([]).then(res => expect(res.success).toBe(false));
  type.validate(undefined).then(res => expect(res.success).toBe(true));
  type.validate(null).then(res => expect(res.success).toBe(false));
  type.validate(false).then(res => expect(res.success).toBe(true));
  type.validate(true).then(res => expect(res.success).toBe(true));
  type.validate(3).then(res => expect(res.success).toBe(false));
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
  const type = new BooleanType({ onlyStrings: true });
  // boolType does parsing in reverse, since it only
  // wants to parse values when we're in onlyStrings.

  type.validate({}).then(res => expect(res.success).toBe(false));
  type.validate([]).then(res => expect(res.success).toBe(false));
  type.validate(undefined).then(res => expect(res.success).toBe(false));
  type.validate(null).then(res => expect(res.success).toBe(false));
  type.validate(false).then(res => expect(res.success).toBe(false));
  type.validate(true).then(res => expect(res.success).toBe(false));
  type.validate(3).then(res => expect(res.success).toBe(false));
  type.validate({a: 1}).then(res => expect(res.success).toBe(false));
  type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(false));
  type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(false));
  type.validate([1]).then(res => expect(res.success).toBe(false));
  type.validate([[1, 2]]).then(res => expect(res.success).toBe(false));
  type.validate([[1, 2], {}]).then(res => expect(res.success).toBe(false));

  type.validate("{}").then(res => expect(res.success).toBe(false));
  type.validate("[]").then(res => expect(res.success).toBe(false));
  type.validate("").then(res => expect(res.success).toBe(true));
  type.validate("null").then(res => expect(res.success).toBe(false));
  type.validate("False").then(res => expect(res.success).toBe(true));
  type.validate("True").then(res => expect(res.success).toBe(true));
  type.validate("3").then(res => expect(res.success).toBe(false));
  type.validate('{"a": 1}').then(res => expect(res.success).toBe(false));
  type.validate('{"a": [1, 2]}').then(res => expect(res.success).toBe(false));
  type.validate('{"a": [1, 2], "b": {}}').then(res => expect(res.success).toBe(false));
  type.validate("[1]").then(res => expect(res.success).toBe(false));
  type.validate("[[1, 2]]").then(res => expect(res.success).toBe(false));
  type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(false));
});
