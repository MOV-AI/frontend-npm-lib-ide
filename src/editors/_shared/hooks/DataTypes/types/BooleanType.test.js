import BooleanType from "./BooleanType";
import { boolToPython, pythonToBool } from "../../../../../utils/Utils";

test("Smoke test", () => {
  const obj = new BooleanType({ theme: {} });

  expect(obj).toBeInstanceOf(BooleanType);
});

test("Convert Python string to boolean", () => {
  expect(pythonToBool("True")).toBe(true);
  expect(pythonToBool("False")).toBe(false);
  expect(pythonToBool(undefined)).toBe(undefined);
  expect(pythonToBool(null)).toBe(undefined);
  expect(pythonToBool("")).toBe(undefined);
  expect(pythonToBool([])).toBe(undefined);
  expect(pythonToBool({})).toBe(undefined);
});

test("Convert boolean to Python string", () => {
  expect(boolToPython(true)).toBe("True");
  expect(boolToPython(false)).toBe("False");
  expect(boolToPython(undefined)).toBe("False");
  expect(boolToPython(null)).toBe("False");
  expect(boolToPython("")).toBe("False");
  expect(boolToPython("True")).toBe("False");
  expect(boolToPython("False")).toBe("False");
  expect(boolToPython([])).toBe("False");
  expect(boolToPython({})).toBe("False");
});

test("Validation", () => {
  const type = new BooleanType({ theme: {} });
  const strType = new BooleanType({ theme: {}, onlyStrings: true });

  type.validate(true).then(res => expect(res.success).toBe(true));
  type.validate(false).then(res => expect(res.success).toBe(true));
  strType.validate(strType.parse("True")).then(
    res => expect(res.success).toBe(true)
  );
  strType.validate(strType.parse("False")).then(
    res => expect(res.success).toBe(true)
  );
  type.validate().then(res => expect(res.success).toBe(false));
  type.validate(0).then(res => expect(res.success).toBe(false));
  type.validate("").then(res => expect(res.success).toBe(false));
  type.validate(null).then(res => expect(res.success).toBe(false));
});
