import React, { useEffect, useRef } from "react";
import hotkeys from "hotkeys-js";
import { KEYBINDINGS } from "../utils/shortcuts";
import {
  getRefComponent,
  addKeyBind as utilsAddKeyBind,
  removeKeyBind as utilsRemoveKeyBind,
  activateKeyBind,
  deactivateKeyBind
} from "../utils/Utils";

/**
 * By default hotkeys are not enabled for INPUT SELECT TEXTAREA elements.
 * Hotkeys.filter to return to the true shortcut keys set to play a role, false shortcut keys set up failure.
 */
hotkeys.filter = function () {
  return true;
};

hotkeys(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS, event => {
  event.preventDefault();
});

/**
 * Manage Key binds
 * @param {*} Component
 * @returns
 */
const withKeyBinds = Component => {
  const RefComponent = getRefComponent(Component);

  return (props, ref) => {
    // Props
    const { id } = props;
    // Refs
    const scopeRef = useRef();

    /**
     * Activate Editor's Keybinds
     * @param {*} keys
     * @param {*} callback
     */
    const activateEditorKeybind = (scope = scopeRef.current) => {
      activateKeyBind(scope);
    };

    /**
     * Add Key bind to its scope
     * @param {*} keys
     * @param {*} callback
     */
    const addKeyBind = (keys, callback, scope = scopeRef.current) => {
      utilsAddKeyBind(keys, callback, scope);
    };

    /**
     * Remove key bind from scope
     * @param {*} key
     */
    const removeKeyBind = (keys, scope = scopeRef.current) => {
      utilsRemoveKeyBind(keys, scope);
    };

    /**
     * Component initialization : set scope id
     */
    useEffect(() => {
      scopeRef.current = id;
      // Delete scope to unbind keys when component is unmounted
      return () => {
        hotkeys.deleteScope(scopeRef.current);
      };
    }, [id]);

    return (
      <RefComponent
        {...props}
        ref={ref}
        addKeyBind={addKeyBind}
        removeKeyBind={removeKeyBind}
        activateKeyBind={activateEditorKeybind}
        deactivateKeyBind={deactivateKeyBind}
      />
    );
  };
};

export default withKeyBinds;
