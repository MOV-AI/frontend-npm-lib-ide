import { makeStyles } from "@mui/styles";

export const appDialogTitleStyles = makeStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    textAlign: "left",
  },
  flexGrow: {
    flexGrow: 1,
  },
  closeButton: {
    color: theme.palette.grey[500]
  }
}));
export const appDialogStyles = makeStyles(_theme => ({
  dialogContent: { minWidth: 450 }
}));
