import React from "react";
import { Typography } from "@mov-ai/mov-fe-lib-react";
import { getRefComponent } from "../utils/Utils";
import Loader from "../editors/_shared/Loader/Loader";

import { loaderStyles } from "./styles";

/**
 * Render loader before document is ready
 * @param {*} Component
 * @returns
 */
const withLoader = Component => {
  const RefComponent = getRefComponent(Component);

  return (props, ref) => {
    const { loading } = props;
    const classes = loaderStyles();

    return (
      <Typography component="div" className={classes.root}>
        {loading ? <Loader /> : <RefComponent {...props} ref={ref} />}
      </Typography>
    );
  };
};

export default withLoader;
