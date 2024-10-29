import React, { forwardRef, useEffect } from "react";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { makeStyles } from "@mov-ai/mov-fe-lib-react";
import withAlerts from "../../decorators/withAlerts";
import withMenuHandler from "../../decorators/withMenuHandler";
import { composeDecorators } from "../../utils/Utils";
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
    return <RefComponent {...props} ref={ref} />;
  });

  // Decorate component
  const DecoratedToolComponent = composeDecorators(ToolComponent, [
    withTheme,
    withAlerts,
    withMenuHandler,
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
