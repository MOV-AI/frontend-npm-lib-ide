import React, { forwardRef, useCallback, useLayoutEffect, useRef } from "react";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { makeStyles } from "@material-ui/core";
import withAlerts from "../../decorators/withAlerts";
import { composeDecorators } from "../../utils/Utils";
import { setUrl } from "../../utils/keybinds";
import { PLUGINS } from "../../utils/Constants";
import { ViewPlugin } from "./ViewReactPlugin";

export const useStyles = makeStyles(() => ({
  root: {
    height: "100%",
  },
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
    const { profile, call } = props;

    const toolRef = useRef();

    /**
     * Activate tool : activate tool's keybinds and update right menu
     */
    const activateTool = useCallback(async () => {
      const activeTab = await call(
        PLUGINS.TABS.NAME,
        PLUGINS.TABS.CALL.GET_ACTIVE_TAB,
      );

      setUrl(profile.name);
      const id = toolRef.current.closest("div[role='tabpanel']").id;

      if (activeTab?.id !== id) {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.FOCUS_EXISTING_TAB, id);
      }
    }, [call, profile.name]);

    /**
     * Component did mount
     */
    useLayoutEffect(() => {
      const id = toolRef.current.closest("div[role='tabpanel']").id;

      // This only happens on component mount,
      // So, only when the tool is first loaded.
      call(PLUGINS.ORCHESTRATOR.NAME, PLUGINS.ORCHESTRATOR.CALL.RENDER_MENUS, {
        id,
        ref,
      });
      call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.FOCUS_EXISTING_TAB, id);
      activateTool();
    }, [ref, call, activateTool]);

    return (
      <div
        ref={toolRef}
        tabIndex="-1"
        style={{ height: "100%" }}
        onClick={activateTool}
      >
        <RefComponent {...props} ref={ref} />
      </div>
    );
  });

  // Decorate component
  const DecoratedToolComponent = composeDecorators(ToolComponent, [
    withTheme,
    withAlerts,
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
