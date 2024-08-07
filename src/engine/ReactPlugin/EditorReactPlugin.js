import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
import withAlerts from "../../decorators/withAlerts";
import withKeyBinds from "../../decorators/withKeyBinds";
import withMenuHandler from "../../decorators/withMenuHandler";
import withLoader from "../../decorators/withLoader";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
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
      addKeyBind,
      removeKeyBind,
      save,
      updateRightMenu,
      activateKeyBind,
      deactivateKeyBind
    } = props;

    const editorContainer = useRef();
    const lastFocusTabId = useRef('');

    /**
     * Activate editor : activate editor's keybinds and update right menu
     */
    const activateEditor = useCallback(() => {
      activateKeyBind();
    }, [activateKeyBind]);

    /**
     * Activate editor : activate editor's keybinds and update right menu
     */
    const deactivateEditor = useCallback(() => {
      deactivateKeyBind();
    }, [deactivateKeyBind]);

    /**
     * Triggers activateEditor if is this editor
     */
    const activateThisEditor = useCallback(
      (data = {}) => {
        const { instance } = data;

        if (lastFocusTabId.current === id || instance?.id === Utils.getNameFromURL(id))
          activateEditor();
      },
      [id, activateEditor]
    );

    /**
     * Triggers activateEditor if is this editor
     */
    const deactivateThisEditor = useCallback(
      (data = {}) => {
        const { instance } = data;

        if (lastFocusTabId.current !== id || instance?.id !== Utils.getNameFromURL(id))
          deactivateEditor();
      },
      [id, deactivateEditor]
    );

    /**
     * Component did mount
     */
    useEffect(() => {
      addKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS, save);

      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, async data => {
        const validTab = await call(
          PLUGINS.TABS.NAME,
          PLUGINS.TABS.CALL.FIND_TAB,
          data.id
        );

        lastFocusTabId.current = data.id;

        // This check goes through every open tab checking it's id
        // towards data.id (which comes from the ACTIVE_TAB_CHANGE broadcast)
        // When we find the tab with the id that we want to reset, we reset it
        if (validTab && data.id === id) {
          // We should reset bookmarks when changing tabs. Right? And Left too :D
          PluginManagerIDE.resetBookmarks();
          updateRightMenu();
          activateEditor();
        }
      });

      on(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.ON.UPDATE_DOC_DIRTY,
        activateThisEditor
      );

      // Remove key bind on component unmount
      return () => {
        removeKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS);
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
        off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.UPDATE_DOC_DIRTY);
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
      activateThisEditor,
      activateEditor
    ]);

    return (
      <div
        tabIndex="-1"
        ref={editorContainer}
        onFocus={activateThisEditor}
        onBlur={deactivateKeyBind}
        className={`container-${scope}`}
      >
        <RefComponent
          {...props}
          activateEditor={activateThisEditor}
          deactivateEditor={deactivateThisEditor}
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
    withKeyBinds,
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
