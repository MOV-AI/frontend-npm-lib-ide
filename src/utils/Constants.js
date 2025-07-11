import { i18n } from "@mov-ai/mov-fe-lib-react";
import { TYPES } from "../editors/Flow/view/Constants/constants";

export const APP_DEFAULT_CONFIG = "app-ide-ce";
export const APP_CUSTOM_CONFIG = "app-custom-ide-ce";

export const MANAGER = "manager";

export const DEFAULT_VALUE = undefined;
export const DISABLED_VALUE = "None";

export const DATA_TYPES = {
  CONFIGURATION: "config",
  BOOLEAN: "boolean",
  STRING: "string",
  NUMBER: "number",
  OBJECT: "object",
  ARRAY: "array",
  ANY: "any",
};

export const SCOPES = {
  CALLBACK: "Callback",
  CONFIGURATION: "Configuration",
  NODE: "Node",
  FLOW: "Flow",
};

export const BOOKMARK_METHODS = {
  ADD_BOOKMARK: "addBookmark",
  SET_BOOKMARK: "setBookmark",
  REMOVE_BOOKMARK: "removeBookmark",
  RESET_BOOKMARKS: "resetBookmarks",
};

export const DRAWER = {
  VIEWS: {
    PLUGIN: "PLUGIN",
    BOOKMARK: "BOOKMARK",
  },
  METHODS: {
    OPEN: "open",
    CLOSE: "close",
    TOGGLE: "toggle",
    ACTIVATE_PLUGIN_VIEW: "activatePluginView",
    ACTIVATE_BOOKMARK_VIEW: "activateBookmarkView",
  },
};

export const HOSTS = {
  ABSTRACT_HOST: {
    NAME: "abstractHost",
  },
  TOP_BAR: {
    NAME: "topBar",
  },
  LEFT_PANEL: {
    NAME: "leftPanel",
  },
  MAIN_PANEL: {
    NAME: "mainPanel",
  },
  LEFT_DRAWER: {
    NAME: "leftDrawer",
    CALL: DRAWER.METHODS,
  },
  BOTTOM_BAR: {
    NAME: "bottomBar",
  },
};

export const PLUGINS = {
  APP_KEYBINDINGS: {
    NAME: "appKeybindings",
  },
  DOC_MANAGER: {
    NAME: "docManager",
    CALL: {
      READ: "read",
      SAVE: "save",
      BROADCAST: "broadcast",
      GET_STORE: "getStore",
      GET_DOC_FACTORY: "getDocFactory",
      GET_DOC_TYPES: "getDocTypes",
      SUBSCRIBE_TO_CHANGES: "subscribeToChanges",
      UNSUBSCRIBE_TO_CHANGES: "unSubscribeToChanges",
      GET_DOC_FROM_NAME_TYPE: "getDocFromNameType",
      CHECK_DOCUMENT_EXISTS: "checkDocumentExists",
      DISCARD_DOC_CHANGES: "discardDocChanges",
      RELOAD_DOC: "reloadDoc",
      COPY: "copy",
      DELETE: "delete",
      CREATE: "create",
      SAVE_ACTIVE_EDITOR: "saveActiveEditor",
      SAVE_DIRTIES: "saveDirties",
    },
    ON: {
      FLOW_EDITOR: "flowEditor",
      UPDATE_DOC_DIRTY: "updateDocDirty",
      DELETE_DOC: "deleteDoc",
      UPDATE_DOCS: "updateDocs",
      LOAD_DOCS: "loadDocs",
      SAVE_DOC: "saveDoc",
      BEFORE_SAVE_DOC: "beforeSaveDoc",
    },
  },
  TABS: {
    NAME: "tabs",
    CALL: {
      OPEN: "open",
      CLOSE: "close",
      FIND_TAB: "findTab",
      OPEN_EDITOR: "openEditor",
      UPDATE_TAB_ID: "updateTabId",
      FOCUS_ACTIVE_TAB: "focusActiveTab",
      FOCUS_EXISTING_TAB: "focusExistingTab",
      GET_ACTIVE_TAB: "getActiveTab",
    },
    ON: {
      OPEN_EDITOR: "openEditor",
      ACTIVE_TAB_CHANGE: "activeTabChange",
    },
  },
  LEFT_DRAWER: {
    NAME: "leftDrawer",
    CALL: {
      ...BOOKMARK_METHODS,
      ...DRAWER.METHODS,
    },
  },
  RIGHT_DRAWER: {
    NAME: "rightDrawer",
    CALL: {
      ...BOOKMARK_METHODS,
      ...DRAWER.METHODS,
    },
    ON: {
      CHANGE_BOOKMARK: "changeBookmark",
    },
  },
  DIALOG: {
    NAME: "dialog",
    CALL: {
      NEW_DOC: "newDocument",
      SAVE_OUTDATED_DOC: "saveOutdatedDocument",
      CONFIRMATION: "confirmation",
      COPY_DOC: "copyDocument",
      FORM_DIALOG: "formDialog",
      SELECT_SCOPE_MODAL: "selectScopeModal",
      CLOSE_DIRTY_DOC: "closeDirtyDocument",
      CUSTOM: "custom",
      CUSTOM_DIALOG: "customDialog",
      ALERT: "alert",
    },
  },
  ALERT: {
    NAME: "alert",
    CALL: {
      SHOW: "show",
    },
  },
  MAIN_MENU: {
    NAME: "mainMenu",
  },
  EXPLORER: {
    NAME: "explorer",
  },
  PLACEHOLDER: {
    NAME: "placeholder",
  },
  ORCHESTRATOR: {
    NAME: "orchestrator",
    CALL: {
      RENDER_MENUS: "renderMenus",
    },
  },
  FLOW_EXPLORER: {
    NAME: "FlowExplorer",
    CALL: {},
    ON: { ADD_NODE: "addNode" },
  },
  SYSTEM_BAR: {
    NAME: "systemBar",
  },
  // Exposed editor methods
  EDITOR: {
    FLOW: {
      CALL: {
        SET_FLOW_TO_DEFAULT: "setFlowsToDefault",
        SELECT_ROBOT: "onRobotChange",
      },
    },
  },
};

export const KEYBIND_SCOPES = {
  APP: "/",
  DIALOG: "dialog",
};

export const TABLE_KEYS_NAMES = {
  PARAMETERS: "parameters",
  ENVVARS: "envVars",
  CMDLINE: "commands",
  CONTAINERCONF: "containerConf",
};

export const EMPTY_MESSAGE = {
  PARAMETERS: "No Parameters",
  ENVVARS: "No Environment Variables",
  COMMANDS: "No Command Lines",
  CONTAINERCONF: "No Container Configurations",
};

export const DIALOG_TITLE = {
  PARAMETERS: "Parameter",
  ENVVARS: "EnvironmentVariable",
  COMMANDS: "Command Line",
  CONTAINERCONF: "Container Configuration",
};

export const SAVE_OUTDATED_DOC_ACTIONS = {
  UPDATE_DOC: "updateDoc",
  OVERWRITE_DOC: "overwriteDoc",
  CANCEL: "cancel",
};

export const DEFAULT_KEY_VALUE_DATA = {
  name: "",
  description: "",
  type: DATA_TYPES.ANY,
  value: "",
};

/**
 * Used for Port Names
 * We’re using a valid ROS validation which only allows for a name to begin with a letter, tilde (~) or a forward slash (/),
 * and then followed by any letters, numbers, underscores and forward slash (/),
 * but can’t have 2 underscores in a row;
 */
export const ROS_VALID_NAMES = new RegExp(
  /(?!.*__.*)^[a-zA-Z~/]{1}?[a-zA-Z0-9_/]*$/,
);

/**
 * Used for Parameters, Environment Variables and Command Line
 * We’re using a variation of the valid ROS validation which only allows for a name to begin with a letter,
 * tilde (~) or a forward slash (/), but also allowing the first character to be an underscore (_),
 * and then followed by any letters, numbers, underscores and forward slash (/),
 * but can’t have 2 underscores in a row;
 */
export const ROS_VALID_NAMES_VARIATION = new RegExp(
  /^[a-zA-Z_~/][a-zA-Z0-9_/]*$/,
);

export const ALERT_SEVERITIES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

export const LINK_DEPENDENCY = {
  ALL_DEPENDENCIES: {
    LABEL: "AllDependenciesLabel",
    VALUE: 0,
    COLOR: "white",
  },
  ONLY_FROM: {
    LABEL: "OnlyFromLabel",
    VALUE: 1,
    COLOR: "violet",
  },
  ONLY_TO: {
    LABEL: "OnlyToLabel",
    VALUE: 2,
    COLOR: "steelblue",
  },
  NO_DEPENDENCIES: {
    LABEL: "NoDependenciesLabel",
    VALUE: 3,
    COLOR: "darkseagreen",
  },
};

/**
 * Related to Flow Context Modes
 */
export const FLOW_CONTEXT_MODES = {
  NODE: TYPES.NODE,
  SUBFLOW: TYPES.CONTAINER,
  LINK: "Link",
  PORT: "Port",
  CANVAS: "Canvas",
};

//========================================================================================
/*                                                                                      *
 *                                   Layout Constants                                   *
 *                                                                                      */
//========================================================================================

export const DEFAULT_EXPLORER_ROW_HEIGHT = 40;

export const DOCK_POSITIONS = {
  DOCK: "dockbox",
  WINDOW: "windowbox",
  MAX: "maxbox",
  FLOAT: "floatbox",
};

export const DOCK_MODES = {
  MAXIMIZE: "maximize",
  REMOVE: "remove",
};

export const FLOW_EXPLORER_PROFILE = {
  name: "FlowExplorer",
  title: "AddNodeOrSubFlow",
};

export const HOMETAB_PROFILE = {
  name: "HomeTab",
  title: i18n.t("HomeTabTitle"),
};

export const SHORTCUTS_PROFILE = {
  name: "ShortcutsTab",
  title: i18n.t("ShortcutsTabTitle"),
};

export const DEFAULT_TABS = new Map(
  Object.entries({ [HOMETAB_PROFILE.name]: { id: HOMETAB_PROFILE.name } }),
);

export const DEFAULT_LAYOUT = {
  dockbox: {
    mode: "horizontal",
    children: [
      {
        tabs: [
          {
            id: HOMETAB_PROFILE.name,
          },
        ],
      },
    ],
  },
  windowbox: { children: [] },
  maxbox: { children: [] },
  floatbox: { children: [] },
};

//========================================================================================
/*                                                                                      *
 *                                 Flow/Nodes Constants                                 *
 *                                                                                      */
//========================================================================================

export const MOVAI_FLOW_TYPES = {
  NODES: {
    ROS1_NODELETE: "ROS1/Nodelet",
    ROS1_NODE: "ROS1/Node",
    ROS1_PLUGIN: "ROS1/Plugin",
    ROS1_STATEM: "ROS1/StateM",
    MOVAI_NODE: "MovAI/Node",
    MOVAI_STATE: "MovAI/State",
    MOVAI_SERVER: "MovAI/Server",
    MOVAI_FLOW: "MovAI/Flow",
    ROS2_NODE: "ROS2/Node",
    ROS2_LIFECYCLENODE: "ROS2/LifecycleNode",
  },
  LINKS: {
    TRANSITION: "movai_msgs/Transition",
    NODELET: "movai_msgs/Nodelet",
  },
};

//========================================================================================
/*                                                                                      *
 *                                 Robots Constants                                     *
 *                                                                                      */
//========================================================================================

export const ROBOT_BLACKLIST = window.SERVER_DATA?.RobotBlackList ?? [];
