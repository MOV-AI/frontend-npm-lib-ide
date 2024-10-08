import AnyType from "./AnyType";
import { testValidation, testStringInput } from "../testUtils";

testValidation(AnyType, [
  true, true, true, true, true, true, true,
  true, true, true, true, true, true,
  true, true, true, true, true, true, true,
  true, true, true, true, true, true,
  // stringOutput
  true, true, true, true, true, true, true,
  true, true, true, true, true, true,
  true, true, true, true, true, true, true,
  true, true, true, true, true, true, true
], "[1]", "[1]");

testStringInput(AnyType, '[1, 2, 3]', "[1, 2, 3]");