import React, { forwardRef, useEffect, useRef } from "react";
import withAlerts from "../../decorators/withAlerts";
import withMenuHandler from "../../decorators/withMenuHandler";
import withLoader from "../../decorators/withLoader";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
import { drawerSub } from "../../plugins/hosts/DrawerPanel/DrawerPanel";
import { KEYBINDINGS } from "../../utils/shortcuts";
import { PLUGINS } from "../../utils/Constants";
import { composeDecorators } from "../../utils/Utils";
import { ViewPlugin } from "./ViewReactPlugin";

/**
 * Decorate react component and handle shared behavior between editors
 * @param {ReactComponent} ReactComponent : Editor React Component
 * @param {Array<String>} methods : Methods to be exposed
 * @returns
 */
export function withEditorPlugin(ReactComponent, methods = []) {
  const RefComponent = forwardRef((props, ref) => ReactComponent(props, ref));

  /**
   * Component responsible to handle common editor lifecycle
   */
  const EditorComponent = forwardRef((props, ref) => {
    const {
      id,
      on,
      off,
      call,
      scope,
      save,
      updateRightMenu,
    } = props;

    useEffect(() => {
      updateRightMenu();
    }, []);

    const editorContainer = useRef();

    /**
     * Component did mount
     */
    useEffect(() => {
      drawerSub.addKeyBind(
        KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS,
        save,
        undefined,
        { global: true }
      );

      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, async data => {
        const validTab = await call(
          PLUGINS.TABS.NAME,
          PLUGINS.TABS.CALL.FIND_TAB,
          data.id
        );

        if (validTab && data.id === id) {
          updateRightMenu();
        }
      });

      // Remove key bind on component unmount
      return () => {
        drawerSub.removeKeyBind(
          KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS,
          { global: true },
        );
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [
      id,
      on,
      off,
      save,
      call,
      updateRightMenu,
    ]);

    return (
      <div
        tabIndex="-1"
        ref={editorContainer}
        className={`container-${scope}`}
      >
        <RefComponent
          {...props}
          saveDocument={save}
          ref={ref}
        />
      </div>
    );
  });

  // Decorate component
  const DecoratedEditorComponent = composeDecorators(EditorComponent, [
    withAlerts,
    withLoader,
    withDataHandler,
    withMenuHandler
  ]);

  /**
   * Return Plugin class rendering decorated editor component
   */
  return class extends ViewPlugin {
    constructor(profile, props = {}) {
      super(profile, props, methods);
    }

    render(otherProps) {
      return (
        <DecoratedEditorComponent
          {...otherProps}
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
