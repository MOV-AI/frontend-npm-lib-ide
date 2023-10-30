import { makeStyles } from "@material-ui/styles";

export const materialTableStyles = makeStyles(_theme => ({
  tableContainer: {
    "& .MuiPaper-root": {
      boxShadow: "none",
      justifyContent: "center"
    }
  }
}));
