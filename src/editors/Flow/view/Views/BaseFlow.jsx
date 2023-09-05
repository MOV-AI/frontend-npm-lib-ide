import React, { useEffect, useMemo, memo } from "react";
import PropTypes from "prop-types";
import Backdrop from "@material-ui/core/Backdrop";
import { PLUGINS, SCOPES } from "../../../../utils/Constants";
import { EVT_NAMES } from "../events";
import Loader from "../../../_shared/Loader/Loader";
import { useSub } from "../../../../utils/noremix";
import MainInterface, { flowSub } from "../Components/interface/MainInterface";
import Warnings from "../Components/Warnings/Warnings";
import DependencyInfo from "../Components/Debugging/DependencyInfo";
import { useRemix, call, subscribe, useUpdate } from "./../../../../utils/noremix";

import { baseFlowStyles } from "./styles";

const BaseFlow = props => {
  const {
    instance,
    id,
    name,
    type,
    model,
    dataFromDB,
    warnings,
    warningsVisibility,
    onReady,
    activateKeyBind,
    flowDebugging,
    loading
  } = props;
  const readOnly = false;
  const update = useUpdate();
  useRemix(props);

  // Other hooks
  const classes = baseFlowStyles();
  const mainInterface = useSub(flowSub)[name];
  const viewMode = mainInterface?.viewMode ?? "default";
  const containerId = useMemo(() => `Flow-${name}`, [viewMode, name]);

  if (!mainInterface) new MainInterface({
    classes, modelView: instance, id: name, data: dataFromDB,
    type, width: "400px", height: "200px", model, readOnly, call
  });

  useEffect(() => {
    if (mainInterface)
      mainInterface.majorUpdate();
    // the array is empty on purpose
  }, []);

  // Enter in add node/sub-flow mode
  useEffect(() => {
    const unsub = subscribe(PLUGINS.FLOW_EXPLORER.NAME, PLUGINS.FLOW_EXPLORER.ON.ADD_NODE, node => {
      // event emitter is latching thus we need to skip
      // it while flow is loading
      const currMode = mainInterface.mode.current.id ?? EVT_NAMES.LOADING;
      if (currMode === EVT_NAMES.LOADING) return;

      const scopes = {
        [SCOPES.NODE]: EVT_NAMES.ADD_NODE,
        [SCOPES.FLOW]: EVT_NAMES.ADD_FLOW
      };
      const templateId = node.name;
      const isSubFlow = node.scope === SCOPES.FLOW;
      // If user tries to add the flow as a sub-flow to itself,
      //  it's considered a forbidden operation
      if (dataFromDB.Label === templateId && isSubFlow) return;
      // Add interface mode to add node/sub-flow
      mainInterface.setMode(scopes[node.scope], { templateId }, true);
      update();
    });

    return unsub;
  }, [dataFromDB, mainInterface]);

  // because this sets mainInterface stuff, if we put it in dependencies, we cause infinite re-render.
  useEffect(() => { mainInterface && onReady(mainInterface); }, [onReady, mainInterface]);

  return (
    <div id={`${viewMode}-${id}`} className={classes.flowContainer}>
      {loading && (
        <Backdrop className={classes.backdrop} open={loading}>
          <Loader />
        </Backdrop>
      )}
      <div className={classes.flowCanvas} id={containerId} tabIndex="0">
        {warnings.length > 0 && (
          <Warnings warnings={warnings} isVisible={warningsVisibility} />
        )}
      </div>
      {flowDebugging && <DependencyInfo activateKeyBind={activateKeyBind} />}
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
  dataFromDB: PropTypes.object
};

BaseFlow.defaultProps = {
  onReady: () => console.warning("On ready prop not received")
};

export default memo(BaseFlow);
