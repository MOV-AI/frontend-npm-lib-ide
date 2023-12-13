import { makeStyles } from "@mui/styles";

export const materialTableStyles = makeStyles(_theme => ({
  tableContainer: {
    "& .MuiPaper-root": {
      boxShadow: "none",
      justifyContent: "center"
    }
  }
}));
