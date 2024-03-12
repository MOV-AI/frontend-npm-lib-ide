import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const nodeStyles = makeStyles(_theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  container: {
    flexGrow: 1,
    padding: "15px",
    overflowY: "auto"
  }
}));
