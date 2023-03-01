import { useState, useMemo, useEffect, useCallback } from "react";
import { RobotManager } from "@mov-ai/mov-fe-lib-core";
import { FLOW_VIEW_MODE } from "../../../Constants/constants";
import { compareDocumentPaths } from "../../../Utils/utils";
import _isEqual from "lodash/isEqual";

const DEBOUNCE_TIME = 600; // ms
const ROBOT_OFFLINE_TIME = 8; // sec

function useBound(callback, ...bound) {
    return useCallback((...args) => callback.apply(null, bound.concat(args)), bound);
}

/**
 * @private Show online Alert
 * @param {*} isOnline
 */
function _onlineAlert(alert, robotStatus, /* bound */ isOnline) {
  const msg = isOnline
    ? { text: "Robot is online", type: "info" }
    : { text: "Robot is offline", type: "warning" };

  if (isOnline !== robotStatus.isOnline) {
    alert({ message: msg.text, severity: msg.type });
  }
}

/**
 * @private Reset node status
 */
function _resetNodeStatus(
  [nodeStatus, setNodeStatus],
  [allNodeStatus, setAllNodeStatus],
  nodeStatusUpdated, nodeCompleteStatusUpdated,
  // bound end
) {
  const emptyNodeStatus = {};
  const emptyAllNodeStatus = {};
  // Reset node_status
  Object.keys(nodeStatus).forEach(node => {
    emptyNodeStatus[node] = 0;
  });
  // Reset all_nodes_status
  Object.keys(allNodeStatus).forEach(node => {
    emptyAllNodeStatus[node] = 0;
  });
  // Update local variables
  setNodeStatus(emptyNodeStatus);
  setAllNodeStatus(emptyNodeStatus);
  // Send updates to canvas
  nodeStatusUpdated(emptyNodeStatus);
  nodeCompleteStatusUpdated(emptyAllNodeStatus);
}

/**
 * Format flow path
 * @returns
 */
function _getFlowPath(id, version) {
  const _version = ["-", ""].includes(version) ? "__UNVERSIONED__" : version;
  return `${id}/${_version}`;
}

/**
 * Check if flow is running
 * @param {string} flowName : Flow to validate if is running
 * @returns {boolean} True if flowName is running and False otherwise
 */
function _isFlowRunning(getFlowPath, /* bound */ flowName) {
  return getFlowPath() === flowName;
}

/**
 * @private Check if robot is online based on last timestamp
 * @param {*} timestamp
 * @returns {boolean} True if robot is online and False otherwise
 */
function isRobotOnline(timestamp) {
  return Date.now() * 0.001 - timestamp <= ROBOT_OFFLINE_TIME;
}

/**
 * @private Get running nodes
 * @param {*} robotStatusData
 * @returns
 */
function getNodesRunning(robotStatusData) {
  const nodesLchd = robotStatusData.nodes_lchd || [];
  const nodesPersistent = robotStatusData.persistent_nodes_lchd
    ? robotStatusData.persistent_nodes_lchd
    : [];
  return nodesLchd.concat(nodesPersistent);
}

/**
 * @private Update node Status
 * @param {*} key
 * @param {*} targetValue
 * @param {*} data
 * @param {*} forceUpdate
 * @returns
 */
function _updateNodeStatus(
  [nodeStatus, setNodeStatus],
  [allNodeStatus, setAllNodeStatus],
  [debounceDelta, setDebounceDelta],
  [nodeStatusViewMode, setNodeStatusViewMode],
  nodeStatusUpdated, alert, onlineAlert,
  viewMode, isFlowRunning, onStartStopFlow,
  // bound end
  key, targetValue, data, forceUpdate,
) {
  if (Date.now() - debounceDelta <= DEBOUNCE_TIME && !forceUpdate)
    return;

  let isOnline = true;
  let activeFlow = "";

  // get robot status
  const robotStatusData = data[key].Robot?.[targetValue]?.Status;

  if (robotStatusData) {
    isOnline = isRobotOnline(robotStatusData.timestamp);
    activeFlow = robotStatusData.active_flow;

    const running = isOnline && isFlowRunning(robotStatusData.active_flow);
    const runningNodes = running ? getNodesRunning(robotStatusData) : [];
    const innerNodeStatus = getNodesToUpdate(
      nodeStatus,
      runningNodes
    );
    const innerAllNodesStatus = getNodesToUpdate(
      allNodeStatus,
      runningNodes,
      false
    );

    if (
      (!_isEqual(allNodeStatus, innerAllNodesStatus) &&
        isFlowRunning(activeFlow)) ||
      nodeStatusViewMode !== viewMode
    ) {
      setNodeStatus(innerNodeStatus);
      setAllNodeStatus(innerAllNodesStatus);
      setNodeStatusViewMode(viewMode);
      nodeStatusUpdated(innerAllNodesStatus, { isOnline, activeFlow });
    }

    activeFlow = isOnline ? robotStatusData.active_flow : "";
    onStartStopFlow(activeFlow);
  }
  // Robot doesn't have "Status" key in Redis
  else {
    if (isOnline) {
      alert({
        message: "Robot has no 'Status' information",
        severity: "warning"
      });
    }
  }

  onlineAlert(isOnline);
  setRobotStatus({ isOnline, activeFlow });
  setDebounceDelta(Date.now());
}

/**
 * Subscribe to changes in robot status
 * @param {*} robotId
 */
function _robotSubscribe(
  robotManager, onStartStopFlow, updateNodeStatus,
  setRobotStatus, selectedRobot,
  // bound
  robotId
) {
  const robot = robotManager.getRobot(robotId);
  const robotStatusData = robot.data?.Status;
  // Set robot status from robot manager data (if any)
  if (robotStatusData) {
    onStartStopFlow(robotStatusData.active_flow);
    setRobotStatus(prevState => {
      return {
        ...prevState,
        activeFlow: robotStatusData.active_flow
      };
    });
  }
  // Subscribe to status change
  robot.subscribe({
    property: "Status",
    onLoad: data => {
      updateNodeStatus("value", robotId, data);
    },
    onUpdate: updateData => {
      if (updateData.event === "hset") {
        if (robotId !== selectedRobot) return;
        updateNodeStatus("key", robotId, updateData);
      }
    }
  });
}

/**
 * Unsubscribe to changes in robot status
 */
function _robotUnsubscribe(resetNodeStatus, robotManager, selectedRobot) {
  if (selectedRobot) {
    resetNodeStatus();
    robotManager
      .getRobot(selectedRobot)
      .unsubscribe({ property: "Status" });
  }
}

/**
 * @private Get nodes to update
 * @param {*} prevNodesStatus
 * @param {*} runningNodes
 * @param {*} splitContainer
 * @returns Nodes to update
 */
function getNodesToUpdate(prevNodesStatus, runningNodes, splitContainer = true) {
  // {<node name> :< status>, ...} where status can be 1 (running) or 0 (stopped and to be removed in the next ui update)
  const nextNodesStatus = {};

  // remove nodes with status = 0 and set status to 0 of the remaining ones (previously 1)
  Object.entries(prevNodesStatus)
    .filter(obj => obj[1] === 1) // remove already stopped nodes
    .forEach(obj => (nextNodesStatus[obj[0]] = 0)); // set all nodes to stopped

  runningNodes
    .map(el => {
      // nodes running in subFlows are named as <subFlow inst name>__<node name>
      // ex.: node running as ctest__test => subFlow is ctest and the node name is test
      const [node] = el.split(/__/);
      return splitContainer ? node : el;
    })
    .forEach(node => (nextNodesStatus[node] = 1)); // set node state to running

  return nextNodesStatus;
}

const useNodeStatusUpdate = (props, robotSelected, viewMode) => {
  // Props
  const {
    id,
    version,
    alert,
    nodeStatusUpdated,
    nodeCompleteStatusUpdated,
    onStartStopFlow
  } = props;
  // State hooks
  const [robotStatus, setRobotStatus] = useState({
    activeFlow: "",
    isOnline: true
  });
  // Manager
  const robotManager = useMemo(() => new RobotManager(), []);
  // Refs
  const [ selectedRobot, setSelectedRobot ] = useState(robotSelected);
  const usedDebounceDelta = useState(Date.now());
  const usedNodeStatusViewMode = useState(FLOW_VIEW_MODE.default);
  const usedNodeStatus = useState({});
  const usedAllNodeStatus = useState({});

  const onlineAlert = useBound(_onlineAlert, alert, robotStatus);
  const resetNodeStatus = useBound(
    _resetNodeStatus,
    usedNodeStatus,
    usedAllNodeStatus,
    nodeStatusUpdated,
    nodeCompleteStatusUpdated
  );
  const getFlowPath = useBound(_getFlowPath, id, version);
  const isFlowRunning = useBound(_isFlowRunning, getFlowPath);
  const updateNodeStatus = useBound(
    _updateNodeStatus,
    usedNodeStatus, usedAllNodeStatus,
    usedDebounceDelta, usedNodeStatusViewMode,
    nodeStatusUpdated, alert, onlineAlert,
    viewMode, isFlowRunning, onStartStopFlow,
  );
  const robotSubscribe = useBound(
    _robotSubscribe,
    robotManager, onStartStopFlow, updateNodeStatus,
    setRobotStatus, selectedRobot,
  );
  const robotUnsubscribe = useBound(
    _robotUnsubscribe,
    resetNodeStatus, robotManager, selectedRobot
  );

  // Update selected robot ref
  useEffect(() => {
    setSelectedRobot(robotSelected);
  }, [robotSelected]);

  // Reset node status when flow stop running
  useEffect(() => {
    const isSameFlow = compareDocumentPaths(robotStatus.activeFlow, id);
    if (!isSameFlow) resetNodeStatus();
  }, [robotStatus.activeFlow, id, resetNodeStatus]);

  return {
    robotSubscribe,
    robotUnsubscribe,
    getFlowPath,
    robotStatus
  };
};

export default useNodeStatusUpdate;
