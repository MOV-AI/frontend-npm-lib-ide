import React, { forwardRef, useCallback, useEffect } from "react";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { makeStyles } from "@material-ui/core";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
import withAlerts from "../../decorators/withAlerts";
import withMenuHandler from "../../decorators/withMenuHandler";
import { PLUGINS } from "../../utils/Constants";
import { composeDecorators } from "../../utils/Utils";
import { setUrl } from "../../utils/keybinds";
import { ViewPlugin } from "./ViewReactPlugin";

export const useStyles = makeStyles(() => ({
  root: {
    height: "100%"
  }
}));

/**
 * Decorate react component and handle shared behavior between editors
 * @param {ReactComponent} ReactComponent : Editor React Component
 * @param {Array<String>} methods : Methods to be exposed
 * @returns
 */
export function withToolPlugin(ReactComponent, methods = []) {
  const RefComponent = forwardRef((props, ref) => ReactComponent(props, ref));

  const ToolComponent = forwardRef((props, ref) => {
    const { on, off, profile, updateRightMenu } = props;

    /**
     * Activate tool : activate tool's keybinds and update right menu
     */
    const activateTool = useCallback(() => {
      setUrl(profile.name);
      resetAndUpdateMenus();
    }, [profile.name, resetAndUpdateMenus]);

    const resetAndUpdateMenus = useCallback(() => {
      // We should reset bookmarks when changing tabs. Right? And Left too :D
      PluginManagerIDE.resetBookmarks();
      updateRightMenu?.();
    }, [updateRightMenu]);

    /**
     * Component did mount
     */
    useEffect(() => {
      PluginManagerIDE.resetBookmarks();
      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, async () => {
        PluginManagerIDE.resetBookmarks();
      });

      return () => {
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [off, on, profile.name]);

    return (
      <div
        tabIndex="-1"
        className={`container-${profile.name}`}
        onFocus={activateTool}
      >
        <RefComponent {...props} ref={ref} />
      </div>
    );
  });

  // Decorate component
  const DecoratedToolComponent = composeDecorators(ToolComponent, [
    withTheme,
    withAlerts,
    withMenuHandler
  ]);

  /**
   * Return Plugin class rendering decorated editor component
   */
  return class extends ViewPlugin {
    constructor(profile, props = {}) {
      super(profile, props, methods);
    }

    render() {
      return (
        <DecoratedToolComponent
          {...this.props}
          ref={this.ref}
          call={this.call}
          profile={this.profile}
          emit={this.emit}
          on={this.on}
          off={this.off}
          onTopic={this.onTopic}
        />
      );
    }
  };
}
