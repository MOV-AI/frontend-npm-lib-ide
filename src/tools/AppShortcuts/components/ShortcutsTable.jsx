import React, { useRef } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import { Paper, Divider } from "@mov-ai/mov-fe-lib-react";

import { shortcutsTableStyles } from "../styles";
import MaterialTable from "../../../editors/_shared/MaterialTable/MaterialTable";
import { parseKeybinds } from "../../../utils/Utils";

const ShortcutsTable = (props) => {
  const { data, scope } = props;

  // Style hook
  const classes = shortcutsTableStyles();
  const columns = useRef(getColumns());

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  function getColumns() {
    return [
      {
        title: i18n.t("Label"),
        field: "label",
      },
      {
        title: i18n.t("Description"),
        field: "description",
      },
      {
        title: i18n.t("Shortcut"),
        field: "shortcut",
        render: (rd) => parseKeybinds(rd.shortcut, ", "),
      },
    ];
  }

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <Paper className={classes.paper}>
      <div className={classes.columnTitle}>
        <strong>{scope.label}</strong> - {i18n.t("ShortcutsTabTitle")}
      </div>
      <Divider />
      <div className={classes.columnBody}>
        <p className={classes.description}>{scope.description}</p>
        <MaterialTable columns={columns.current} data={data} />
      </div>
    </Paper>
  );
};

ShortcutsTable.propTypes = {
  call: PropTypes.func,
};

export default ShortcutsTable;
