import StringType from "./StringType";
import { testValidation, testStringInput } from "../testUtils";

testValidation(StringType, [
  false, false, true, false, false, false, false,
  false, false, false, false, false, false,
  true, true, true, true, true, true, true,
  true, true, true, true, true, true,
  // stringOutput
  false, false, true, false, false, false, false,
  false, false, false, false, false, false,
  true, true, true, true, true, true, true,
  true, true, true, true, true, true, true
], "hi", "hi");

testStringInput(StringType, 'hi', "hi");
