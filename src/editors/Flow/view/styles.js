import { makeStyles } from "@material-ui/core/styles";

export const flowStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: "100%",
    flexGrow: 1,
    background: theme.terciaryBackground
  }
}));
