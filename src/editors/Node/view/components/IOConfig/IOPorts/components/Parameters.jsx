import React, { useCallback } from "react";
import Grid from "@material-ui/core/Grid";
import Circle from "@material-ui/icons/FiberManualRecord";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";

import { parametersStyles } from "./styles";

const Parameters = (props) => {
  // Props
  const {
    param,
    paramValue,
    direction,
    ioPort,
    editable,
    handleIOPortsInputs,
    rowData: { name: rowDataName },
  } = props;
  // Hooks
  const classes = parametersStyles();

  const handleOnChange = useCallback(
    (evt) => {
      handleIOPortsInputs(evt.target, rowDataName, direction, ioPort, param);
    },
    [rowDataName, direction, ioPort, param, handleIOPortsInputs],
  );

  const inputType = () => {
    // TODO: Ports data should provide which type the frontend should render
    // and not this harcoded string
    if (["latch", "Oneshot"].includes(param)) {
      return (
        <Checkbox
          type={"checkbox"}
          defaultChecked={paramValue}
          onChange={handleOnChange}
        />
      );
    } else {
      return (
        <TextField
          type={["Frequency", "queue_size"].includes(param) ? "number" : "text"}
          inputProps={{ "data-testid": "input_parameter" }}
          disabled={!editable}
          defaultValue={paramValue}
          className={classes.input}
          onChange={handleOnChange}
        />
      );
    }
  };

  return (
    <Grid className={classes.gridContainer}>
      <Grid item xs={3} className={classes.titleColumn}>
        <Circle className={classes.circle} />
        {`${param}:`}
      </Grid>
      <Grid item xs={9}>
        {inputType()}
      </Grid>
    </Grid>
  );
};

export default Parameters;
