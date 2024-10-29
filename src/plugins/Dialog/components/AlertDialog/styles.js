import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const alertBeforeActionStyles = makeStyles((_theme) => ({
  icon: {
    float: "left",
    marginRight: 20,
  },
  message: {
    whiteSpace: "pre-wrap",
  },
}));

export const alertDialogStyles = makeStyles((_theme) => ({
  container: {
    whiteSpace: "pre-wrap",
  },
}));
