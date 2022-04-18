import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";

import { shortcutsTableStyles } from "../styles";
import MaterialTable from "../../editors/_shared/MaterialTable/MaterialTable";
import { parseKeybinds } from "../../../../utils/Utils";

const ShortcutsTable = props => {
  const { data } = props;

  // Translation hook
  const { t } = useTranslation();
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
      // {
      //   title: t("Id"),
      //   field: "id",
      //   sorting: false
      // },
      {
        title: t("Label"),
        field: "label"
      },
      {
        title: t("Description"),
        field: "description"
      },
      {
        title: t("Shortcut"),
        field: "shortcut",
        render: rd => parseKeybinds(rd.shortcut, ", ")
      }
    ];
  }

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <Paper className={classes.paper}>
      <div className={classes.columnTitle}>{t("ShortcutsTabTitle")}</div>
      <Divider />
      <div className={classes.columnBody}>
        <MaterialTable columns={columns.current} data={data} />
      </div>
    </Paper>
  );
};

ShortcutsTable.propTypes = {
  call: PropTypes.func
};

export default ShortcutsTable;
