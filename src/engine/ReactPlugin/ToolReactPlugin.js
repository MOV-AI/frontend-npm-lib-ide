import React, { forwardRef, useEffect } from "react";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { makeStyles } from "@mov-ai/mov-fe-lib-react";
import { drawerSub } from "../../plugins/hosts/DrawerPanel/DrawerPanel";
import withAlerts from "../../decorators/withAlerts";
import withMenuHandler from "../../decorators/withMenuHandler";
import { PLUGINS } from "../../utils/Constants";
import { composeDecorators } from "../../utils/Utils";
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
    const { on, off, profile } = props;

    /**
     * Component did mount
     */
    useEffect(() => {
      drawerSub.url = profile.name;
      on(
        PLUGINS.TABS.NAME,
        PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE,
        async ({ id }) => {
          if (profile.name === id)
            drawerSub.url = profile.name;
        }
      );

      return () => {
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [profile.name]);

    return <RefComponent {...props} ref={ref} />;
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
