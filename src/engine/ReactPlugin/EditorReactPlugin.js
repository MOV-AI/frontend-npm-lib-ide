import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import withAlerts from "../../decorators/withAlerts";
import withMenuHandler from "../../decorators/withMenuHandler";
import withLoader from "../../decorators/withLoader";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
import { drawerSub } from "../../plugins/hosts/DrawerPanel/DrawerPanel";
import { KEYBINDINGS } from "../../utils/shortcuts";
import { PLUGINS } from "../../utils/Constants";
import { addKeyBind, setUrl } from "../../utils/keybinds";
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
    const { id, on, off, call, scope, save, updateRightMenu } = props;

    const editorContainer = useRef();

    /**
     * Activate editor : activate editor's keybinds and update right menu
     */
    const activateEditor = useCallback(() => {
      setUrl(id);
      drawerSub.url = id;
      resetAndUpdateMenus();
      addKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS, save);
    }, [id, resetAndUpdateMenus]);

    const resetAndUpdateMenus = useCallback(() => {
      // We should reset bookmarks when changing tabs. Right? And Left too :D
      PluginManagerIDE.resetBookmarks();
      updateRightMenu();
    }, [updateRightMenu]);

    /**
     * Component did mount
     */
    useEffect(() => {
      activateEditor();
      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, async (data) => {
        const validTab = await call(
          PLUGINS.TABS.NAME,
          PLUGINS.TABS.CALL.FIND_TAB,
          data.id,
        );

        // This check goes through every open tab checking it's id
        // towards tabId (which comes from the ACTIVE_TAB_CHANGE broadcast)
        // When we find the tab with the id that we want to reset, we reset it
        if (!validTab || (validTab && data.id === id)) {
          resetAndUpdateMenus();
          activateEditor();
        }
      });

      // Remove key bind on component unmount
      return () => {
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [
      activateEditor,
      addKeyBind,
      call,
      id,
      off,
      on,
      resetAndUpdateMenus,
      save,
    ]);

    return (
      <div
        tabIndex="-1"
        ref={editorContainer}
        className={`container-${scope}`}
        onFocus={activateEditor}
      >
        <RefComponent {...props} saveDocument={save} ref={ref} />
      </div>
    );
  });

  // Decorate component
  const DecoratedEditorComponent = composeDecorators(EditorComponent, [
    withAlerts,
    withLoader,
    withDataHandler,
    withMenuHandler,
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
