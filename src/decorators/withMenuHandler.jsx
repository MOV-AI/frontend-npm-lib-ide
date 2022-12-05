import React, { useCallback, useEffect, useRef } from "react";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import { PLUGINS } from "../utils/Constants";
import { getRefComponent } from "../utils/Utils";

const RETRY_UPDATE_MENU_TIMEOUT = 100;
const MAXIMUM_RETRIES = 3;
let lastActiveTabName = undefined;

/**
 * Handle actions to update right menu of each editor
 * @param {*} Component : Editor React Component
 * @returns {ReactComponent} React component that receives props to handle menu actions
 */
const withMenuHandler = Component => {
  const RefComponent = getRefComponent(Component);

  return (props, ref) => {
    const { call, on, off, profile } = props;
    const retryUpdateMenusCounter = useRef(0);

    /**
     * Component did mount
     */
    useEffect(() => {
      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, async data => {
        const validTab = await call(
          PLUGINS.TABS.NAME,
          PLUGINS.TABS.CALL.FIND_TAB,
          data.id
        );

        if (
          !validTab ||
          (data.id === profile.name && lastActiveTabName !== data.id)
        ) {
          updateMenus();
          lastActiveTabName = data.id;
        }
      });
      return () => {
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [on, off, profile]);

    /**
     * Reset menus : clear menus and close right drawer
     */
    const updateMenus = useCallback(() => {
      PluginManagerIDE.resetBookmarks();
      const editorRef = ref?.current;

      if (editorRef) return editorRef.renderRightMenu();

      // If some tool or editor doesn't have a ref, let's just
      // Try the MAXIMUM_RETRIES, and then stop trying.
      if (retryUpdateMenusCounter.current < MAXIMUM_RETRIES) {
        retryUpdateMenusCounter.current++;
        // This setTimeout is needed because on first load
        // We might not have an editorRef yet.
        setTimeout(() => {
          updateMenus();
        }, RETRY_UPDATE_MENU_TIMEOUT);
      }
    }, [ref]);

    return <RefComponent {...props} ref={ref} updateRightMenu={updateMenus} />;
  };
};

export default withMenuHandler;
