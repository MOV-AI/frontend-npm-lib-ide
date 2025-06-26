import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { Divider } from "@material-ui/core";
import PortTooltipContent from "./PortTooltipContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";

const ITEMS_INDEX = "tooltip-fragment-row";

const useStyles = makeStyles(() => ({
  root: {
    padding: "5px",
    position: "absolute",
  },
  item: {
    lineHeight: "22px",
    fontSize: "1rem",
  },
}));

const PortTooltip = (props) => {
  const classes = useStyles();
  const { anchorPosition, port, handleCloseTooltip } = props;
  const title = i18n.t("Port");

  const itemTextProps = {
    color: "primary",
    className: classes.item,
  };

  const getItems = useCallback(() => {
    const { name, message, template, callback } = port.data;

    return (
      <PortTooltipContent
        name={name}
        message={message}
        template={template}
        callback={callback}
      />
    );
  }, [port]);

  return (
    <Paper
      id={`${port.data.name}_tooltip`}
      style={{ ...anchorPosition }}
      className={classes.root}
      elevation={14}
      onMouseOver={() => handleCloseTooltip(`${port.data.name}_tooltip`)}
      onMouseOut={() => handleCloseTooltip(null, 300)}
    >
      <List
        dense={true}
        subheader={
          <>
            <ListItem key={`${ITEMS_INDEX}-subheader`}>
              <ListItemText
                primary={title}
                primaryTypographyProps={itemTextProps}
              />
            </ListItem>
            <Divider />
          </>
        }
      >
        {getItems()}
      </List>
    </Paper>
  );
};

PortTooltip.propTypes = {
  anchorPosition: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
  }).isRequired,
  port: PropTypes.object.isRequired,
  handleCloseTooltip: PropTypes.function.isRequired,
};

PortTooltip.defaultProps = {};

export default PortTooltip;
