import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import withAlerts from "../../decorators/withAlerts";
import withKeyBinds from "../../decorators/withKeyBinds";
import withMenuHandler from "../../decorators/withMenuHandler";
import { PLUGINS } from "../../utils/Constants";
import { composeDecorators } from "../../utils/Utils";
import { ViewPlugin } from "./ViewReactPlugin";

export const useStyles = makeStyles(_theme => ({
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

  /**
   * Component responsible to handle common editor lifecycle
   */
  const ToolComponent = forwardRef((props, ref) => {
    const { profile, on, off, deactivateKeyBind, call } = props;
    const classes = useStyles();

    const toolContainer = useRef();

    /**
     * Reset right/left bookmarks
     */
    const resetBookmarks = useCallback(() => {
      call(
        PLUGINS.RIGHT_DRAWER.NAME,
        PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS
      );
      call(PLUGINS.LEFT_DRAWER.NAME, PLUGINS.LEFT_DRAWER.CALL.RESET_BOOKMARKS);
    }, [call]);

    /**
     * Component did mount
     */
    useEffect(() => {
      resetBookmarks();
      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, data => {
        if (data.id === profile.name) {
          resetBookmarks();
        }
      });
      return () => {
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [on, off, profile, resetBookmarks]);

    return (
      <div
        tabIndex="-1"
        ref={toolContainer}
        onBlur={deactivateKeyBind}
        className={classes.root}
      >
        <RefComponent
          {...props}
          deactivateKeyBind={deactivateKeyBind}
          ref={ref}
        />
      </div>
    );
  });

  // Decorate component
  const DecoratedToolComponent = composeDecorators(ToolComponent, [
    withMenuHandler,
    withKeyBinds,
    withAlerts
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
