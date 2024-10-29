import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const collapsibleHeaderStyles = makeStyles((_theme) => ({
  root: {
    padding: "5px 0px 5px 0px",
    width: "100%",
  },
  heading: {
    fontSize: "1.5rem",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  column: {
    flexBasis: "90%",
  },
}));
