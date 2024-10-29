import React from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mov-ai/mov-fe-lib-react";

import { detailsMenuStyles } from "./styles";

const DetailsMenu = ({ name, details }) => {
  // Style hook
  const classes = detailsMenuStyles();

  return (
    <div>
      <h2 className={classes.detailsName}>{name}</h2>
      <List sx={{ width: "100%", bgcolor: "background.paper" }} component="nav">
        <ListItem>
          <ListItemText primary={i18n.t("Name-Colon")} />
          <Typography>{name}</Typography>
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={i18n.t("LastUpdate-Colon")} />
          <Typography>{details.date || "N/A"}</Typography>
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={i18n.t("User-Colon")} />
          <Typography>{details.user || "N/A"}</Typography>
        </ListItem>
      </List>
    </div>
  );
};

export default DetailsMenu;
