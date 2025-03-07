import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import withAlerts from "../../decorators/withAlerts";
import withLoader from "../../decorators/withLoader";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
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
export function withEditorPlugin(ReactComponent) {
  const RefComponent = forwardRef((props, ref) => ReactComponent(props, ref));

  /**
   * Component responsible to handle common editor lifecycle
   */
  const EditorComponent = forwardRef((props, ref) => {
    const { id, call, scope, save } = props;

    const editorContainer = useRef();

    /**
     * Activate editor : activate editor's keybinds and update right menu
     */
    const activateEditor = useCallback(async () => {
      const activeTab = await call(
        PLUGINS.TABS.NAME,
        PLUGINS.TABS.CALL.GET_ACTIVE_TAB,
      );

      setUrl(id);
      addKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS, save);

      if (activeTab?.id !== id) {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.FOCUS_EXISTING_TAB, id);
      }
    }, [call, id, save]);

    /**
     * Component did mount
     */
    useEffect(() => {
      // This only happens on component mount,
      // So, only when the editor is first loaded.
      call(PLUGINS.ORCHESTRATOR.NAME, PLUGINS.ORCHESTRATOR.CALL.RENDER_MENUS, {
        id,
        ref,
      });
      call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.FOCUS_EXISTING_TAB, id);
      activateEditor();
    }, [id, ref, call, activateEditor, save]);

    return (
      <div
        tabIndex="-1"
        ref={editorContainer}
        className={`container-${scope}`}
        onClick={activateEditor}
      >
        <RefComponent
          {...props}
          saveDocument={save}
          ref={ref}
          activateEditor={activateEditor}
        />
      </div>
    );
  });

  // Decorate component
  const DecoratedEditorComponent = composeDecorators(EditorComponent, [
    withAlerts,
    withLoader,
    withDataHandler,
  ]);

  /**
   * Return Plugin class rendering decorated editor component
   */
  return class extends ViewPlugin {
    constructor(profile, props = {}) {
      const editorExposedMethods = [
        ...Object.values(PLUGINS.EDITOR[props.scope.toUpperCase()]?.CALL ?? {}),
      ];
      super(profile, props, editorExposedMethods);
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
