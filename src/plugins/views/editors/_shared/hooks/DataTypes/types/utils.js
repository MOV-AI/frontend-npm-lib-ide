import { DISABLED_VALUE } from "../../../../../../../utils/Constants";

/**
 * Checks if provided value is empty or DISABLED_VALUE
 * @param {string} value : value to be checked
 * @returns
 */
export function checkIfDefaultOrDisabled(value) {
  return value === "" || value === DISABLED_VALUE;
}
