import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const materialTableStyles = makeStyles((_theme) => ({
  tableContainer: {
    "& .MuiPaper-root": {
      boxShadow: "none",
      justifyContent: "center",
    },
  },
}));
