import { makeStyles } from "@material-ui/styles";

export const buttonStyles = makeStyles((_theme) => ({
  buttonPill: {
    borderRadius: "99px",
    padding: "4px",
  },
}));

export const flowTopBarStyles = makeStyles((theme) => ({
  flowLink: {
    textDecoration: "underline",
    cursor: "pointer",
  },
  defaultRobot: {
    fontWeight: "bold",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 170,
    maxWidth: 350,
    "& i": {
      marginRight: 15,
    },
  },
  whichFlowText: {
    marginLeft: theme.spacing(5),
    fontSize: "15px",
    flexGrow: 1,
  },
  searchFlowArea: {
    marginRight: theme.spacing(3),
  },
  searchInputText: {
    width: "400px",
  },
  searchPopup: {
    width: "fit-content",
  },
  visualizationToggle: {
    marginRight: "10px",
  },
  grow: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
  },
  treeIcon: {
    fontSize: "1.2rem",
  },
}));
