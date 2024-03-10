import React, { useCallback } from "react";
import { Grid, TextField } from "@mov-ai/mov-fe-lib-react";
import { FiberManualRecordIcon } from "@mov-ai/mov-fe-lib-react";

import { parametersStyles } from "./styles";

const Parameters = props => {
  // Props
  const {
    param,
    paramValue,
    direction,
    ioPort,
    editable,
    handleIOPortsInputs,
    rowData: { name: rowDataName }
  } = props;
  // Hooks
  const classes = parametersStyles();

  const handleOnChange = useCallback(
    evt => {
      handleIOPortsInputs(
        evt.target.value,
        rowDataName,
        direction,
        ioPort,
        param
      );
    },
    [rowDataName, direction, ioPort, param, handleIOPortsInputs]
  );

  return (
    <Grid className={classes.gridContainer}>
      <Grid item xs={3} className={classes.titleColumn}>
        <FiberManualRecordIcon className={classes.circle} />
        {`${param}:`}
      </Grid>
      <Grid item xs={9}>
        <TextField
          inputProps={{ "data-testid": "input_parameter" }}
          disabled={!editable}
          defaultValue={paramValue}
          className={classes.input}
          onChange={handleOnChange}
        />
      </Grid>
    </Grid>
  );
};

export default Parameters;
