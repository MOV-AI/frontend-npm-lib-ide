import React, { useCallback } from "react";
import { Link } from "@material-ui/core";
import menuStyles from "../styles";

/**
 * Node Link Component
 * @param {*} props: Component props
 * @returns {ReactElement}
 */
const NodeLink = props => {
  const { scope, name, openDoc, children } = props;
  const classes = menuStyles();

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On click link : open document
   * @param {Event} event : Click event
   */
  const onClickLink = useCallback(
    event => {
      openDoc({
        name,
        scope,
        ctrlKey: event.ctrlKey
      });
    },
    [openDoc, name, scope]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Link
      data-testid="input_link"
      component="button"
      className={classes.link}
      onClick={onClickLink}
    >
      {children}
    </Link>
  );
};

export default NodeLink;
