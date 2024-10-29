import { makeStyles } from "@mov-ai/mov-fe-lib-react";

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
