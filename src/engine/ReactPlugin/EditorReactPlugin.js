import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import { Utils } from "@mov-ai/mov-fe-lib-core";
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
      scope,
      addKeyBind,
      removeKeyBind,
      save,
      activateKeyBind,
      deactivateKeyBind
    } = props;

    const editorContainer = useRef();

    /**
     * Activate editor : activate editor's keybinds and update right menu
     */
    const activateEditor = useCallback(() => {
      activateKeyBind();
    }, [activateKeyBind]);

    /**
     * Triggers activateEditor if is this editor
     */
    const activateThisEditor = useCallback(
      data => {
        const { instance } = data;
        if (data.id === id || instance?.id === Utils.getNameFromURL(id))
          activateEditor();
      },
      [id, activateEditor]
    );

    /**
     * Component did mount
     */
    useEffect(() => {
      addKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS, save);
      on(
        PLUGINS.TABS.NAME,
        PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE,
        activateThisEditor
      );

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
    }, [id, addKeyBind, removeKeyBind, on, off, save, activateThisEditor]);

    return (
      <div
        tabIndex="-1"
        ref={editorContainer}
        onFocus={activateEditor}
        onBlur={deactivateKeyBind}
        className={`container-${scope}`}
      >
        <RefComponent
          {...props}
          activateEditor={activateEditor}
          saveDocument={save}
          deactivateKeyBind={deactivateKeyBind}
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
