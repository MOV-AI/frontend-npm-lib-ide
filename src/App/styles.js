import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const appStyles = (debugMode) =>
  makeStyles((theme) => ({
    app: {
      height: "100%",
    },
    leftPanel: {
      height: "100%",
      border: debugMode ? "solid 5px red" : "",
      borderRight: debugMode ? "" : `1px solid ${theme.background}`,
      display: "flex",
      position: "relative",
    },
    mainGrid: {
      height: "calc(100% - 26px)",
      "& > *": {
        height: "100%",
      },
      flexGrow: 1,
    },
    sidePanel: { height: "100%" },
    centralPanel: { flexGrow: 1, border: debugMode ? "solid 5px green" : "" },
    rightDrawer: {
      border: debugMode ? "solid 5px blue" : "",
      borderLeft: debugMode ? "" : `1px solid ${theme.background}`,
      position: "relative",
    },
    bottomBar: { border: debugMode ? "solid 5px orange" : "", width: "100%" },
  }));
