import { makeStyles } from "@mui/styles";

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
