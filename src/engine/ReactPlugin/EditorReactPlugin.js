import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
import withAlerts from "../../decorators/withAlerts";
import withMenuHandler from "../../decorators/withMenuHandler";
import withLoader from "../../decorators/withLoader";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
import { KEYBINDINGS } from "../../utils/shortcuts";
import { PLUGINS } from "../../utils/Constants";
import { useKeyBinds, setUrl } from "../../utils/keybinds";
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

    const { addKeyBind, removeKeyBind } = useKeyBinds(id);

    /**
     * Activate editor : activate editor's keybinds and update right menu
     */
    const activateEditor = useCallback(() => {
      setUrl(id);
      updateMenusOnTabOrEditorChange();
    }, [id]);

    const updateMenusOnTabOrEditorChange = async (tabId) => {
      const validTab = await call(
        PLUGINS.TABS.NAME,
        PLUGINS.TABS.CALL.FIND_TAB,
        tabId,
      );

      // This check goes through every open tab checking it's id
      // towards tabId (which comes from the ACTIVE_TAB_CHANGE broadcast)
      // When we find the tab with the id that we want to reset, we reset it
      if (!validTab || (validTab && tabId === id)) {
        // We should reset bookmarks when changing tabs. Right? And Left too :D
        PluginManagerIDE.resetBookmarks();
        updateRightMenu();

        // We only need to activate the editor when it's an Active Tab Change
        if (tabId) activateEditor();
      }
    };

    /**
     * Component did mount
     */
    useEffect(() => {
      addKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS, save);

      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, async (data) => {
        updateMenusOnTabOrEditorChange(data.id);
      });

      // Remove key bind on component unmount
      return () => {
        removeKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS);
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [
      id,
      addKeyBind,
      removeKeyBind,
      on,
      off,
      save,
      call,
      updateRightMenu,
      activateEditor,
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
