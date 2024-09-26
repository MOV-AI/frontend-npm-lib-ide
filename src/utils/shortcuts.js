import { i18n } from "@mov-ai/mov-fe-lib-react";

export const KEYBINDINGS = {
  GENERAL: {
    NAME: "appShortcuts",
    LABEL: i18n.t("AppKeybindLabel"),
    DESCRIPTION: i18n.t("AppKeybindDescription"),
    KEYBINDS: {
      OPEN_WELCOME_TAB: {
        NAME: "openWelcomeTab",
        LABEL: i18n.t("HomeTabTitle"),
        DESCRIPTION: i18n.t("HomeTabKeybindDescription"),
        SHORTCUTS: "Control+Alt+Home",
        DEFAULT_CALLBACK: "openWelcomeTab"
      },
      OPEN_SHORTCUTS_TAB: {
        NAME: "openShortcutsTab",
        LABEL: i18n.t("ShortcutsTabTitle"),
        DESCRIPTION: i18n.t("ShortcutsTabKeybindDescription"),
        SHORTCUTS: "Control+Alt+k",
        DEFAULT_CALLBACK: "openShortcutsTab"
      },
      SAVE_ALL: {
        NAME: "saveAll",
        LABEL: i18n.t("SaveAllDocs"),
        DESCRIPTION: i18n.t("SaveAllDocsKeybindDescription"),
        SHORTCUTS: "Control+Alt+s",
        DEFAULT_CALLBACK: "saveAllDocument"
      }
    }
  },
  EDITOR_GENERAL: {
    NAME: "editorGeneral",
    LABEL: i18n.t("EditorGeneralKeybindLabel"),
    DESCRIPTION: i18n.t("EditorGeneralKeybindDescription"),
    KEYBINDS: {
      SAVE: {
        NAME: "save",
        LABEL: i18n.t("SaveDoc"),
        DESCRIPTION: i18n.t("SaveDocKeybindDescription"),
        SHORTCUTS: "Control+s"
      },
      // TODO Add later when we have a working UNDO / REDO engine
      // UNDO: {
      //   NAME: "undo",
      //   LABEL: i18n.t("Undo"),
      //   DESCRIPTION: i18n.t("UndoKeybindDescription"),
      //   SHORTCUTS: "Control+z"
      // },
      // REDO: {
      //   NAME: "redo",
      //   LABEL: i18n.t("Redo"),
      //   DESCRIPTION: i18n.t("RedoKeybindDescription"),
      //   SHORTCUTS: ["Control+shift+z", "Control+y"]
      // },
      // COPY: {
      //   NAME: "copy",
      //   LABEL: i18n.t("Copy"),
      //   DESCRIPTION: i18n.t("CopyKeybindDescription"),
      //   SHORTCUTS: "Control+c"
      // },
      // PASTE: {
      //   NAME: "paste",
      //   LABEL: i18n.t("Paste"),
      //   DESCRIPTION: i18n.t("PasteKeybindDescription"),
      //   SHORTCUTS: "Control+v"
      // },
      CANCEL: {
        NAME: "cancel",
        LABEL: i18n.t("Cancel"),
        DESCRIPTION: i18n.t("CancelKeybindDescription"),
        SHORTCUTS: "Escape"
      },
      DELETE: {
        NAME: "delete",
        LABEL: i18n.t("Delete"),
        DESCRIPTION: i18n.t("DeleteKeybindDescription"),
        SHORTCUTS: ["Delete", "Backspace"]
      }
    }
  },
  MONACO_SPECIFIC: {
    NAME: "monacoCodeEditor",
    LABEL: i18n.t("EditorMonacoKeybindLabel"),
    DESCRIPTION: i18n.t("EditorMonacoKeybindDescription"),
    KEYBINDS: {
      CHANGE_ALL_OCURRENCES: {
        NAME: "changeAllOcurrences",
        LABEL: i18n.t("ChangeAllOcurrencesKeybindLabel"),
        DESCRIPTION: i18n.t("ChangeAllOcurrencesKeybindDescription"),
        SHORTCUTS: "Control+F2"
      },
      COMMAND_PALETTE: {
        NAME: "commandPalette",
        LABEL: i18n.t("CommandPaletteKeybindLabel"),
        DESCRIPTION: i18n.t("CommandPaletteKeybindDescription"),
        SHORTCUTS: "F1"
      },
      UNDO: {
        NAME: "undo",
        LABEL: i18n.t("Undo"),
        DESCRIPTION: i18n.t("UndoKeybindDescription"),
        SHORTCUTS: "Control+z"
      },
      REDO: {
        NAME: "redo",
        LABEL: i18n.t("Redo"),
        DESCRIPTION: i18n.t("RedoKeybindDescription"),
        SHORTCUTS: ["Control+shift+z", "Control+y"]
      },
      CUT: {
        NAME: "monacoEditorCutCode",
        LABEL: i18n.t("CutCode"),
        DESCRIPTION: i18n.t("CutCodeKeybindDescription"),
        SHORTCUTS: "Control+x"
      },
      COPY: {
        NAME: "monacoEditorCopyCode",
        LABEL: i18n.t("CopyCode"),
        DESCRIPTION: i18n.t("CopyCodeKeybindDescription"),
        SHORTCUTS: "Control+c"
      },
      PASTE: {
        NAME: "monacoEditorPasteCode",
        LABEL: i18n.t("PasteCode"),
        DESCRIPTION: i18n.t("PasteCodeKeybindDescription"),
        SHORTCUTS: "Control+v"
      }
    }
  },
  FLOW: {
    NAME: "editorFlow",
    LABEL: i18n.t("EditorFlowKeybindLabel"),
    DESCRIPTION: i18n.t("EditorFlowKeybindDescription"),
    KEYBINDS: {
      COPY_NODE: {
        NAME: "copyNode",
        LABEL: i18n.t("CopyNode"),
        DESCRIPTION: i18n.t("CopyNodeKeybindDescription"),
        SHORTCUTS: "Control+c"
      },
      PASTE_NODE: {
        NAME: "pasteNode",
        LABEL: i18n.t("PasteNode"),
        DESCRIPTION: i18n.t("PasteNodeKeybindDescription"),
        SHORTCUTS: "Control+v"
      },
      MOVE_NODE: {
        NAME: "moveNode",
        LABEL: i18n.t("MoveNode"),
        DESCRIPTION: i18n.t("MoveNodeKeybindDescription"),
        SHORTCUTS: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
      },
      SEARCH_NODE: {
        NAME: "searchNode",
        LABEL: i18n.t("SearchNode"),
        DESCRIPTION: i18n.t("SearchNodeKeybindDescription"),
        SHORTCUTS: "Control+f"
      },
      RESET_ZOOM: {
        NAME: "resetZoom",
        LABEL: i18n.t("ResetZoom"),
        DESCRIPTION: i18n.t("ResetZoomKeybindDescription"),
        SHORTCUTS: "Control+i"
      }
    }
  },
  MODAL: {
    NAME: "dialogModal",
    LABEL: i18n.t("DialogModalKeybindLabel"),
    DESCRIPTION: i18n.t("DialogModalKeybindDescription"),
    KEYBINDS: {
      CANCEL: {
        NAME: "cancel",
        LABEL: i18n.t("Cancel"),
        DESCRIPTION: i18n.t("CancelKeybindDescription"),
        SHORTCUTS: "Escape"
      },
      CONFIRM: {
        NAME: "confirm",
        LABEL: i18n.t("Confirm"),
        DESCRIPTION: i18n.t("ConfirmKeybindDescription"),
        SHORTCUTS: "Enter"
      }
    }
  },
  MISC: {
    NAME: "miscellaneous",
    LABEL: i18n.t("MiscellaneousKeybindLabel"),
    DESCRIPTION: i18n.t("MiscellaneousKeybindDescription"),
    KEYBINDS: {
      SEARCH_INPUT_PREVENT_SEARCH: {
        NAME: "searchInputPreventSearch",
        SCOPE: "flowSearchInput",
        LABEL: i18n.t("SearchInputPreventSearch"),
        DESCRIPTION: i18n.t("SearchInputPreventSearchKeybindDescription"),
        SHORTCUTS: "Control+f"
      },
      SEARCH_INPUT_CLOSE: {
        NAME: "searchInputClose",
        SCOPE: "flowSearchInput",
        LABEL: i18n.t("SearchInputClose"),
        DESCRIPTION: i18n.t("SearchInputCloseKeybindDescription"),
        SHORTCUTS: "Escape"
      }
    }
  }
};
