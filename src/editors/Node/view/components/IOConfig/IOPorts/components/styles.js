import { makeStyles } from "@mov-ai/mov-fe-lib-react";

const sharedStyles = {
  gridContainer: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    boxSizing: "border-box",
    padding: "10px",
    alignItems: "center",
  },
  titleColumn: {
    margin: "auto",
  },
  circle: {
    width: "0.25em",
    height: "0.25em",
    margin: "5px",
  },
};

export const callbackStyles = makeStyles((theme) => ({
  ...sharedStyles,
  actionColumn: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  iconPadding: {
    paddingRight: "5px",
  },
  icon: {
    color: theme.icon.color,
    "&:hover": {
      color: theme.icon.hoverColor,
    },
  },
}));

export const parametersStyles = makeStyles((_theme) => ({
  ...sharedStyles,
  input: {
    width: "100%",
    fontSize: "0.875rem",
    padding: "0px 8px 0px 8px",
  },
}));
