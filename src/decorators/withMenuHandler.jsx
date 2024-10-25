import React, { useCallback, useRef } from "react";
import { getRefComponent } from "../utils/Utils";

const RETRY_UPDATE_MENU_TIMEOUT = 100;
const MAXIMUM_RETRIES = 3;

/**
 * Handle actions to update right menu of each editor
 * @param {*} Component : Editor React Component
 * @returns {ReactComponent} React component that receives props to handle menu actions
 */
const withMenuHandler = (Component) => {
  const RefComponent = getRefComponent(Component);

  return (props, ref) => {
    const retryUpdateMenusCounter = useRef(0);

    /**
     * Reset menus : clear menus and close right drawer
     */
    const updateMenus = useCallback(() => {
      const editorRef = ref?.current;

      if (editorRef) {
        const renderMenus = editorRef.renderRightMenu || editorRef.renderMenus;
        return renderMenus();
      }

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
