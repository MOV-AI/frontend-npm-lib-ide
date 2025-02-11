const EDITORS = {};

export const addEditor = ({ scope, store, plugin, props }) => {
  EDITORS[scope] = { store, plugin, props };
};

/**
 * Returns a list of interfaces
 * @param {string} workspace : The workspace where to load the documents from
 * @returns {Array<{store: Store, plugin: ViewPlugin}>}
 */

const factory = (workspace, observer, docManager) => {
  Object.keys(EDITORS).forEach((scope) => {
    const editor = EDITORS[scope];
    const Store = editor.store;
    EDITORS[scope] = {
      store: new Store(workspace, observer, docManager),
      plugin: editor.plugin,
      props: editor.props,
    };
  });
  return EDITORS;
};

export default factory;
