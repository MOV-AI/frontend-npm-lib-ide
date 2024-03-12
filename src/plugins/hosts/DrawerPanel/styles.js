import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const drawerPanelStyles = (isLeft, isOpen) =>
  makeStyles(theme => ({
    content: {
      background: theme.palette.background.primary,
      color: theme.backdrop?.color,
      height: "100%",
      display: "flex",
      flexDirection: "column"
    },
    drawer: {
      overflow: "hidden",
      position: "relative",
      [isLeft ? "marginRight" : "marginLeft"]: "auto",
      width: isOpen ? 340 : "auto",
      height: "100%",
      "& > *": {
        width: 340,
        position: "absolute",
        transition: "none !important"
      }
    }
  }));
