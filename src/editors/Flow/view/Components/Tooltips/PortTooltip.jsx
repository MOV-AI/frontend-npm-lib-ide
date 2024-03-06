import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { Divider } from "@mui/material";
import PortTooltipContent from "./PortTooltipContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";

const ITEMS_INDEX = "tooltip-fragment-row";

const useStyles = makeStyles(() => ({
  root: {
    padding: "5px",
    position: "absolute"
  },
  item: {
    lineHeight: "22px",
    fontSize: "1rem"
  }
}));

const PortTooltip = props => {
  const classes = useStyles();
  const { anchorPosition, port } = props;
  const title = i18n.t("Port");

  const itemTextProps = {
    color: "primary",
    className: classes.item
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
      style={{ ...anchorPosition }}
      className={classes.root}
      elevation={14}
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
    top: PropTypes.number
  }).isRequired,
  port: PropTypes.object.isRequired
};

PortTooltip.defaultProps = {};

export default PortTooltip;
