import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const baseFlowStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer - 1,
    color: theme.textColor,
    backgroundColor: theme.palette.background.secondary,
    position: "absolute",
    height: "100%",
    width: "100%",
    opacity: 0
  },
  flowContainer: {
    height: "calc(100% - 75px)",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  },
  flowCanvas: {
    width: "100%",
    height: "100%",
    flexGrow: 1
  },
  flowEditor: {
    interfaceColor: theme.palette.background.primary
  }
}));
