import React, { memo } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import { useTranslation } from "../../../_shared/mocks";

// Node colors: Each node type has one specific correspondent color
const NODE_COLORS = {
  "ROS1/Nodelet": "#ef5b5b",
  "ROS1/Node": "#684551",
  "ROS1/Plugin": "#20a39e",
  "ROS1/StateM": "#006494",
  "MovAI/Node": "#be2424",
  "MovAI/State": "#52528c",
  "MovAI/Server": "#dec5e3",
  "MovAI/Flow": "#252125",
  "ROS2/Node": "#f7b05b",
  "ROS2/LifecycleNode": "#a5907e"
};

const useStyles = makeStyles(theme => ({
  root: {
    padding: "5px 0px 5px 0px",
    width: "100%"
  },
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  input: {
    margin: theme.spacing(1),
    fontFamily: "inherit",
    width: "80%",
    fontWeight: "bold"
  },
  text: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  center: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  },
  nodeTypeMini: {
    width: "12px",
    height: "12px",
    marginRight: "6px",
    borderRadius: "3px"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  typeContainer: { display: "flex", alignItems: "center" },
  details: { display: "flex", flexDirection: "column" },
  row: { display: "flex", flexDirection: "row" },
  heading: { fontSize: "1.5rem" },
  column: { flexBasis: "90%" }
}));

const Description = props => {
  // Props
  const { onChangeDescription, value, nodeType, editable } = props;
  // Hooks
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Typography component="div" className={classes.root}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="div" className={classes.column}>
            <Typography component="div" className={classes.container}>
              <Typography className={classes.heading}>
                {t("Description")}
              </Typography>
              <Typography component="div" className={classes.typeContainer}>
                {nodeType && (
                  <>
                    <Typography
                      component="div"
                      className={classes.nodeTypeMini}
                      style={{ backgroundColor: NODE_COLORS[nodeType] }}
                    ></Typography>
                    <Typography>{nodeType}</Typography>
                  </>
                )}
              </Typography>
            </Typography>
          </Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className={classes.details}>
          {/* ---------------- Description -------------------*/}
          <TextField
            disabled={!editable}
            className={classes.textField}
            label={t("Description")}
            rows="4"
            multiline
            value={value}
            onChange={evt => onChangeDescription(evt.target.value)}
            margin="normal"
            variant="outlined"
          />
        </AccordionDetails>
      </Accordion>
    </Typography>
  );
};

Description.propTypes = {
  value: PropTypes.string,
  nodeType: PropTypes.string,
  onChangeDescription: PropTypes.func,
  editable: PropTypes.bool
};

Description.defaultProps = {
  nodeType: "",
  value: "",
  onChangeDescription: (evt, text) => console.log(evt.target.value, text),
  editable: false
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  const sameDescription = prevProps.value === nextProps.value;
  const sameType = prevProps.nodeType === nextProps.nodeType;
  return sameType && sameDescription;
}

export default memo(Description, arePropsEqual);