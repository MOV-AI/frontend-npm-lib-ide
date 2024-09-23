import ObjectType from "./ObjectType";

test("Smoke test", () => {
  const obj = new ObjectType({});
  expect(obj).toBeInstanceOf(ObjectType);
});

test("Validation for real objects", () => {
  const type = new ObjectType({});

  type.validate({}).then(res => expect(res.success).toBe(true));
  type.validate([]).then(res => expect(res.success).toBe(false));
  type.validate(undefined).then(res => expect(res.success).toBe(true));
  type.validate(null).then(res => expect(res.success).toBe(false));
  type.validate(false).then(res => expect(res.success).toBe(false));
  type.validate(true).then(res => expect(res.success).toBe(false));
  type.validate(3).then(res => expect(res.success).toBe(false));
  type.validate({a: 1}).then(res => expect(res.success).toBe(true));
  type.validate({a: [1, 2]}).then(res => expect(res.success).toBe(true));
  type.validate({a: [1, 2], b: {}}).then(res => expect(res.success).toBe(true));
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
  const type = new ObjectType({ onlyStrings: true });

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

  type.validate("{}").then(res => expect(res.success).toBe(true));
  type.validate("[]").then(res => expect(res.success).toBe(false));
  type.validate("").then(res => expect(res.success).toBe(true));
  type.validate("null").then(res => expect(res.success).toBe(false));
  type.validate("False").then(res => expect(res.success).toBe(false));
  type.validate("True").then(res => expect(res.success).toBe(false));
  type.validate("3").then(res => expect(res.success).toBe(false));
  type.validate('{"a": 1}').then(res => expect(res.success).toBe(true));
  type.validate('{"a": [1, 2]}').then(res => expect(res.success).toBe(true));
  type.validate('{"a": [1, 2], "b": {}}').then(res => expect(res.success).toBe(true));
  type.validate("[1]").then(res => expect(res.success).toBe(false));
  type.validate("[[1, 2]]").then(res => expect(res.success).toBe(false));
  type.validate("[[1, 2], {}]").then(res => expect(res.success).toBe(false));
});
