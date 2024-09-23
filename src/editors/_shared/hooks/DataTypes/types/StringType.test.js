import StringType from "./StringType";

test("Smoke test", () => {
  const obj = new StringType({});
  expect(obj).toBeInstanceOf(StringType);
});

test("Validation for real objects", () => {
  const type = new StringType({});

  type.validate({}).then(res => expect(res.success).toBe(false));
  type.validate([]).then(res => expect(res.success).toBe(false));
  type.validate(undefined).then(res => expect(res.success).toBe(true));
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
  const type = new StringType({ onlyStrings: true });

  type.validate({}).then(res => expect(res.success).toBe(false));
  type.validate([]).then(res => expect(res.success).toBe(false));
  type.validate(undefined).then(res => expect(res.success).toBe(true)); // change?
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

