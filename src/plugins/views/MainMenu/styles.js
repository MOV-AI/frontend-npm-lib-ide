import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const mainMenuStyles = makeStyles((theme) => ({
  mainMenuHolder: {
    height: "100%",
  },
  appsHolder: {
    "& span[role='button']": {
      padding: "0",
      "&:hover": {
        outline: "6px solid rgba(54, 181, 230, 0.08)",
      },
    },
    "& hr": {
      borderColor: theme.border,
      borderRadius: "2px",
      margin: "15px 0",
    },
  },
  icon: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    "& svg": {
      color: theme.palette.primary.main,
    },
  },
  movaiIcon: {
    boxSizing: "border-box",
    padding: "10px",
    width: "50px",
    height: "50px",
  },
}));
