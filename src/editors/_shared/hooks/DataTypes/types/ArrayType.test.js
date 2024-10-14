import ArrayType from "./ArrayType";
import { testValidation, testStringInput } from "../testUtils";

testValidation(ArrayType, [
  false, true, true, false, false, false, false,
  false, false, false, true, true, true,
  false, false, false, false, false, false, false,
  false, false, false, false, false, false,
  // stringOutput
  false, false, false, false, false, false, false,
  false, false, false, false, false, false,
  false, true, true, false, false, false, false,
  false, false, false, true, true, true, true
], "[1]", [1]);

testStringInput(ArrayType, '[1, 2,', null);
testStringInput(ArrayType, '[1, 2, 3]', [1, 2, 3]);
