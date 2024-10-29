import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const parametersDialogStyles = makeStyles((_theme) => ({
  marginTop: { marginTop: "15px" },
  valueOptions: {
    flexDirection: "row",
  },
  disabledValue: {
    color: "grey",
    fontStyle: "italic",
  },
}));

export const keyValueEditorDialogStyles = makeStyles((_theme) => ({
  input: { fontSize: "13px" },
  label: {
    fontSize: "16px",
    transform: "translate(0, 1.5px) scale(0.75)",
    transformOrigin: "top left",
    color: "rgba(255, 255, 255, .7)",
  },
  paper: { minWidth: "50%" },
  container: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    gap: "16px",
  },
  codeContainer: {
    height: "200px",
    width: "100%",
  },
  accordion: {
    margin: "0px !important",
  },
  accordionSummary: {
    paddingLeft: "0px",
    paddingRight: "0px",
    minHeight: "auto !important",
    alignItems: "flex-end",

    "& > div": {
      margin: "0px !important",
      padding: "0px",
    },
  },
  noHorizontalPadding: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));
