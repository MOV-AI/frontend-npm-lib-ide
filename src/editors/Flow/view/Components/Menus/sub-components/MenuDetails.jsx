import React from "react";
import PropTypes from "prop-types";
import { t } from "../../../../../../i18n/i18n";
import { ListItem, ListItemText, Typography } from "@material-ui/core";
import { defaultFunction } from "../../../../../../utils/Utils";
import NodeLink from "./NodeLink";

import { menuDetailsStyles } from "../styles";

const MenuDetails = props => {
  // Props
  const { id, name, template, model, type, openDoc, label } = props;
  // Other hooks
  const classes = menuDetailsStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <>
      <Typography component="h2" variant="h2" className={classes.header}>
        {name ?? id}
      </Typography>
      <ListItem divider>
        <ListItemText primary={t(label)} className={classes.label} />
        <NodeLink
          data-testid="section_node-link"
          name={template}
          scope={model}
          openDoc={openDoc}
        >
          {template}
        </NodeLink>
      </ListItem>
      <ListItem divider>
        <ListItemText primary={t("Scope-Colon")} />
        <Typography>{model}</Typography>
      </ListItem>
      <ListItem divider>
        <ListItemText primary={t("Type-Colon")} />
        <Typography>{type}</Typography>
      </ListItem>
    </>
  );
};

MenuDetails.propTypes = {
  id: PropTypes.string,
  template: PropTypes.string,
  label: PropTypes.string,
  model: PropTypes.string,
  type: PropTypes.string,
  openDoc: PropTypes.func
};

MenuDetails.defaultProps = {
  id: "",
  template: "-",
  model: "-",
  type: "-",
  label: "NameColon",
  openDoc: () => defaultFunction("openDoc")
};

export default MenuDetails;
