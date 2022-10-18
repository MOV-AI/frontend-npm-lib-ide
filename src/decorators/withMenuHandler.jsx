import React, { useCallback, useEffect, useRef } from "react";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import { PLUGINS } from "../utils/Constants";
import { getRefComponent } from "../utils/Utils";

let lastActiveTabName = undefined;

/**
 * Handle actions to update right menu of each editor
 * @param {*} Component : Editor React Component
 * @returns {ReactComponent} React component that receives props to handle menu actions
 */
const withMenuHandler = Component => {
  const RefComponent = getRefComponent(Component);

  return (props, ref) => {
    const { on, off, profile } = props;

    /**
     * Component did mount
     */
     useEffect(() => {
      PluginManagerIDE.resetBookmarks();
      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, data => {
        console.log("debug on tab change profile name", profile.name);
        console.log("debug on tab change data id", data.id);
        console.log("debug on tab change lastActiveTabName", lastActiveTabName);
        if (data.id === profile.name) {
          lastActiveTabName !== data.id && PluginManagerIDE.resetBookmarks();
        }
        lastActiveTabName = data.id;
      });
      return () => {
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [on, off, profile]);


    /**
     * Reset right menu : clear menu and close right drawer
     */
    const resetMenus = useCallback(() => {
      // PluginManagerIDE.resetBookmarks();
    }, []);

    // Update right menu Ref (should be initialized with the 'resetRightMenu' method)
    const updateRightMenuRef = useRef(resetMenus);

    /**
     * Render components menu if any and bind events of active tab to trigger the component's renderRightMenu method
     * @returns
     */
    const initRightMenu = useCallback(() => {
      // render component menus (if any)
      const editorRef = ref?.current;
      if (!editorRef) return;
      const _updateRightMenu = editorRef.renderRightMenu ?? resetMenus;
      // Render (or close) right menu details
      _updateRightMenu();
      updateRightMenuRef.current = _updateRightMenu;
    }, [ref, resetMenus]);

    /**
     * Update Right menu
     */
    const updateRightMenu = useCallback(() => {
      console.log("debug menu handler props", props);
      // resetMenus();
      if (!updateRightMenuRef.current) initRightMenu();
      updateRightMenuRef.current();
    }, [initRightMenu]);

    return (
      <RefComponent
        {...props}
        ref={ref}
        initRightMenu={initRightMenu}
        updateRightMenu={updateRightMenu}
      />
    );
  };
};

export default withMenuHandler;
