import React from "react";
import { useTranslation } from "react-i18next";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography  from "@mui/material/Typography";
import { detailsMenuStyles } from "./styles";

const DetailsMenu = ({ name, details }) => {
  // Style hook
  const classes = detailsMenuStyles();
  // Translation hook
  const { t } = useTranslation();

  return (
    <div>
      <h2 className={classes.detailsName}>{name}</h2>
      <List sx={{ width: "100%" }} component="nav">
        <ListItem>
          <ListItemText primary={t("Name-Colon")} />
          <Typography>{name}</Typography>
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={t("LastUpdate-Colon")} />
          <Typography>{details.date || "N/A"}</Typography>
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={t("User-Colon")} />
          <Typography>{details.user || "N/A"}</Typography>
        </ListItem>
      </List>
    </div>
  );
};

export default DetailsMenu;
