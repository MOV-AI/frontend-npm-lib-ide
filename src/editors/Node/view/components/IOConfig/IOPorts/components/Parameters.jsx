import React, { useCallback } from "react";
import Grid from "@mui/material/Grid";
import Circle from "@mui/icons-material/FiberManualRecord";
import TextField from "@mui/material/TextField";

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
        <Circle className={classes.circle} />
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
