import React from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Divider,
} from "@mov-ai/mov-fe-lib-react";
import { ExpandMoreIcon } from "@mov-ai/mov-fe-lib-react";

import { collapsibleHeaderStyles } from "./styles";

const CollapsibleHeader = props => {
  const {
    title,
    children,
    defaultExpanded,
    testId = "section_accordion"
  } = props;
  const classes = collapsibleHeaderStyles();

  return (
    <Typography data-testid={testId} component="div" className={classes.root}>
      <Accordion defaultExpanded={defaultExpanded}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="div" className={classes.column}>
            <Typography className={classes.heading}>{title}</Typography>
          </Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className={classes.details}>
          {children}
        </AccordionDetails>
      </Accordion>
    </Typography>
  );
};

CollapsibleHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  defaultExpanded: PropTypes.bool
};

CollapsibleHeader.defaultProps = {
  title: <div>Title</div>,
  defaultExpanded: false
};

export default CollapsibleHeader;
