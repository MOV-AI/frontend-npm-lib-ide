import { makeStyles } from "@material-ui/styles";

export const appDialogStyles = makeStyles((_theme) => ({
  loadingContainer: {
    height: "100px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dialogContent: { minWidth: 450 },
  textfield: { width: "100%" },
}));
