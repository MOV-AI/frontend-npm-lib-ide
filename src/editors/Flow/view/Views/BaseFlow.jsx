import React, { useEffect, memo } from "react";
import PropTypes from "prop-types";
import Backdrop from "@material-ui/core/Backdrop";
import { PLUGINS, SCOPES } from "../../../../utils/Constants";
import { EVT_NAMES } from "../events";
import Loader from "../../../_shared/Loader/Loader";
import Warnings from "../Components/Warnings/Warnings";
import DependencyInfo from "../Components/Debugging/DependencyInfo";

import { baseFlowStyles } from "./styles";

const BaseFlow = (props) => {
  const {
    mainInterface,
    state,
    id,
    dataFromDB,
    off,
    on,
    warnings,
    warningsVisibility,
    flowDebugging,
    viewMode,
  } = props;
  // Other hooks
  const classes = baseFlowStyles();

  // Enter in add node/sub-flow mode
  useEffect(() => {
    on(
      PLUGINS.FLOW_EXPLORER.NAME,
      PLUGINS.FLOW_EXPLORER.ON.ADD_NODE,
      (node) => {
        // event emitter is latching thus we need to skip
        // it while flow is loading
        const currMode = mainInterface.mode.current.id ?? EVT_NAMES.LOADING;
        if (currMode === EVT_NAMES.LOADING) return;

        const scopes = {
          [SCOPES.NODE]: EVT_NAMES.ADD_NODE,
          [SCOPES.FLOW]: EVT_NAMES.ADD_FLOW,
        };
        const templateId = node.name;
        const isSubFlow = node.scope === SCOPES.FLOW;
        // If user tries to add the flow as a sub-flow to itself,
        //  it's considered a forbidden operation
        if (dataFromDB.Label === templateId && isSubFlow) return;
        // Add interface mode to add node/sub-flow
        mainInterface.setMode(scopes[node.scope], { templateId }, true);
      },
    );

    return () =>
      off(PLUGINS.FLOW_EXPLORER.NAME, PLUGINS.FLOW_EXPLORER.ON.ADD_NODE);
  }, [off, on, dataFromDB]);

  return (
    <div id={`${viewMode}-${id}`} className={classes.flowContainer}>
      {state.loading && (
        <Backdrop className={classes.backdrop} open={state.loading}>
          <Loader />
        </Backdrop>
      )}
      <div
        onClick={() => mainInterface.state.onNodeSelected(null)}
        className={classes.flowCanvas}
        id={mainInterface.containerId}
        tabIndex="0"
      >
        {warnings.length > 0 && (
          <Warnings warnings={warnings} isVisible={warningsVisibility} />
        )}
      </div>
      {flowDebugging && <DependencyInfo />}
    </div>
  );
};

BaseFlow.propTypes = {
  call: PropTypes.func.isRequired,
  instance: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  model: PropTypes.string,
  dataFromDB: PropTypes.object,
};

export default memo(BaseFlow);
