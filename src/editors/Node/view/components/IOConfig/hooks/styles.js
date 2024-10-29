import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const configColumnsStyles = makeStyles((theme) => ({
  formHolder: {
    width: "100%",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: "120px",
  },
  control: {
    fontSize: "0.875rem",
  },
}));
