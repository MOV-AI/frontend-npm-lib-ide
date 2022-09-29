import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { SHORTCUTS_PROFILE } from "../../utils/Constants";
import ShortcutsList from "./components/ShortcutsList";
import ShortcutsTable from "./components/ShortcutsTable";
import { KEYBINDINGS } from "../../utils/shortcuts";

import { shortcutsStyles } from "./styles";
import { withToolPlugin } from "../../engine";

const AppShortcuts = props => {
  // Hooks
  const shortcutsData = useRef(formatData(KEYBINDINGS));
  const [selectedScope, setSelectedScope] = useState(KEYBINDINGS.GENERAL.NAME);

  // Style hook
  const classes = shortcutsStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  function formatData(data) {
    const formattedData = {
      scopes: []
    };
    Object.values(data).forEach(value => {
      formattedData.scopes.push({
        id: value.NAME,
        label: value.LABEL,
        description: value.DESCRIPTION
      });
      formattedData[value.NAME] = [];

      Object.values(value.KEYBINDS).forEach(keybind => {
        formattedData[value.NAME].push({
          id: keybind.NAME,
          label: keybind.LABEL,
          description: keybind.DESCRIPTION,
          shortcut: keybind.SHORTCUTS
        });
      });
    });

    return formattedData;
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <div data-testid="section_shortcuts" className={classes.root}>
      <div className={classes.body}>
        <div className={classes.smallColumn}>
          <ShortcutsList
            scopes={shortcutsData.current.scopes}
            setSelectedScope={setSelectedScope}
            selectedScope={selectedScope}
          />
        </div>
        <div className={classes.bigColumn}>
          <ShortcutsTable
            scope={shortcutsData.current.scopes.find(
              s => s.id === selectedScope
            )}
            data={shortcutsData.current[selectedScope]}
          />
        </div>
      </div>
    </div>
  );
};

AppShortcuts.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired
};

const ShortcutsPlugin = withToolPlugin(AppShortcuts);

export default ShortcutsPlugin;

/**
 * Get welcome tab data
 * @returns {TabData} Data used to create tab
 */
export const getShortcutsTab = () => {
  return {
    ...SHORTCUTS_PROFILE,
    id: SHORTCUTS_PROFILE.name,
    name: SHORTCUTS_PROFILE.title,
    tabTitle: SHORTCUTS_PROFILE.title,
    scope: SHORTCUTS_PROFILE.name,
    extension: ""
  };
};
