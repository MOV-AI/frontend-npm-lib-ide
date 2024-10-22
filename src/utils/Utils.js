import { forwardRef } from "react";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import BuildIcon from "@material-ui/icons/Build";
import CodeIcon from "@material-ui/icons/Code";
import DescriptionIcon from "@material-ui/icons/Description";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import KeyboardIcon from "@material-ui/icons/Keyboard";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import movaiIcon from "../Branding/movai-logo-white.png";
import { ERROR_MESSAGES } from "./Messages";
import { KEYBIND_SCOPES } from "./Constants";

/**
 * Export a non implemented empty function
 * @param {String} name : function name
 * @returns console.warn call with the function name
 */
export const defaultFunction = (name, logToConsole = true) => {
  if (logToConsole) console.warn(`${name} not implemented`);
};

/**
 * Tries to find the next increment on an array of numbers
 * @param {Number[]} numArray
 */
export const findNextIncrement = numArray => {
  if (!numArray || numArray.length < 2)
    return numArray[0] ? numArray[0] + 1 : 1;

  const max = Math.max(...numArray);
  const min = 1;

  for (let i = min; i <= max; i++) {
    if (!numArray.includes(i)) {
      return i;
    }
  }

  return max + 1;
};

/**
 * Returns a given icon with props in a method
 * @param {SvgIcon} Icon
 * @returns {function} Icon with props
 */
export const getIconFn = Icon => props => <Icon {...props}></Icon>;

/**
 * Checks if it's a React Component or Functional Component to return it's ref
 * @param {*} Component
 * @returns {Component} RefComponent
 */
export const getRefComponent = Component => {
  let RefComponent = Component;
  if (typeof Component === "function")
    RefComponent = forwardRef((props, ref) => Component(props, ref));

  return RefComponent;
};

/**
 * Get tab icon color for each document type
 * @param {string} scope : Document type (Callback, Configuration, ...)
 * @returns {string} Color by document type
 */
export const getTabIconColor = scope => {
  const TAB_ICON_COLORS = {
    Callback: "cadetblue",
    Layout: "darkred",
    Flow: "orchid",
    Node: "khaki",
    Configuration: "goldenrod"
  };
  // Return color by scope
  return scope in TAB_ICON_COLORS ? TAB_ICON_COLORS[scope] : "inherit";
};

/**
 * Get icon for each document type
 * @param {string} scope : Document type (Callback, Configuration, ...)
 * @returns {component} Icon by document type
 */
export const getIconByScope = (scope, style) => {
  scope = scope || "Default";
  const color = getTabIconColor(scope);
  const homeTabIcon = (
    <img src={movaiIcon} alt="MOV.AI Logo" style={{ maxWidth: 13, ...style }} />
  );
  const icon = {
    Callback: <CodeIcon style={{ color, ...style }} />,
    Layout: <i className={`icon-Layouts`} style={{ color, ...style }}></i>,
    Flow: <AccountTreeIcon style={{ color, ...style }} />,
    Annotation: <DescriptionIcon style={{ color, ...style }} />,
    GraphicScene: <DeviceHubIcon style={{ color, ...style }} />,
    Node: <i className={`icon-Nodes`} style={{ color, ...style }}></i>,
    Configuration: <BuildIcon style={{ color, ...style }} />,
    HomeTab: homeTabIcon,
    ShortcutsTab: <KeyboardIcon style={{ color, ...style }} />,
    Default: <></>
  };

  return icon[scope];
};

/**
 * Validate document name and throw error if validation doesn't pass
 * @param {string} name : Document name
 * @returns {boolean}
 */
export function validateDocumentName(name = "") {
  if (!Utils.validateEntityName(name)) {
    throw new Error(ERROR_MESSAGES.INVALID_NAME);
  } else {
    return true;
  }
}

export function parseKeybinds(shortcuts, sep = ",") {
  let parsedShortcuts = shortcuts;
  if (Array.isArray(parsedShortcuts)) parsedShortcuts = shortcuts.join(sep);

  return parsedShortcuts;
}

/**
 * Simple Event to Stop Propagation
 * @param e: event to stop the propagation
 */
export function stopPropagation(e) {
  e?.stopPropagation();
}

/**
 * Trigger a simulated mouse click (react element)
 * @param {*} element
 */
export function simulateMouseClick(element) {
  ["mousedown", "click", "mouseup"].forEach(mouseEventType =>
    element.dispatchEvent(
      new MouseEvent(mouseEventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1
      })
    )
  );
}

/**
 * Trigger callback before unload app
 * @param {function} callback
 */
export function runBeforeUnload(callback, ...args) {
  // Previous beforeunload method
  const onAppUnload = window.onbeforeunload;
  // Set new beforeunload method with given callback
  window.onbeforeunload = event => {
    callback?.(event, ...args);
    return onAppUnload(event);
  };
}

/**
 * Add decorators to Component always forwarding ref
 * @param {ReactComponent} Component : Component to be decorated
 * @param {Array<decorators>} decorators : Array of decorators to be added to component
 * @returns Fully decorated component
 */
export const composeDecorators = (Component, decorators) => {
  if (!decorators.length) return Component;

  const [withFirstDecorator, ...otherDecorators] = decorators;
  const composed = forwardRef((props, ref) =>
    withFirstDecorator(Component)(props, ref)
  );
  if (otherDecorators.length)
    return composeDecorators(composed, otherDecorators);
  else return composed;
};

/**
 * Inserts new entries on an array if condition is met
 * @param {boolean} condition
 * @param  {...any} elements
 * @returns {boolean} elements or empty array
 */
export function insertIf(condition, ...elements) {
  return condition ? elements : [];
}

/**
 * Receives a string and returns a string that
 * doesn't contain spaces and is all lower case
 * @param {string} text
 * @returns
 */
export function convertToValidString(text) {
  return text?.toString().replaceAll(" ", "_").toLowerCase();
}

export function openLink(link) {
  window.open(link, "_blank");
}
