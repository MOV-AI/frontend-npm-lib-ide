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
  const obj = new BooleanType({ theme: {} });

  const validate = (values, expected) => {
    values.forEach(async value => {
      const result = await obj.validate(value);
      expect(result.success).toBe(expected);
    });
  };

  const jsBool = [true, false];
  const pyBool = ["True", "False"];
  const jsFalsy = [undefined, 0, "", null];

  validate(jsBool, true);
  validate(pyBool, true);
  validate(jsFalsy, false);
});
