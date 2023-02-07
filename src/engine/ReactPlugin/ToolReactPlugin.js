import React, { forwardRef, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import withAlerts from "../../decorators/withAlerts";
import withKeyBinds from "../../decorators/withKeyBinds";
import withMenuHandler from "../../decorators/withMenuHandler";
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

  // Decorate component
  const DecoratedToolComponent = composeDecorators(RefComponent, [
    withAlerts,
    withKeyBinds,
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
