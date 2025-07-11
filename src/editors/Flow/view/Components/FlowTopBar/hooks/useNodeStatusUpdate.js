import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { RobotManager } from "@mov-ai/mov-fe-lib-core";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { compareDocumentPaths } from "../../../Utils/utils";

const DEBOUNCE_TIME = 600; // ms
const ROBOT_OFFLINE_TIME = 8; // sec

const useNodeStatusUpdate = (props, robotSelected, viewMode) => {
  // Props
  const { id, version, alert, onStartStopFlow, mainInterface } = props;
  // State hooks
  const [robotStatus, setRobotStatus] = useState({
    activeFlow: "",
    isOnline: true,
  });
  // Manager
  const robotManager = useMemo(() => new RobotManager(), []);
  // Refs
  const selectedRobotRef = useRef(robotSelected);
  const debounceDeltaRef = useRef(Date.now());
  const nodeStatusRef = useRef({});
  const allNodeStatusRef = useRef({});
  const lastMessage = useRef("");

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Check if robot is online based on last timestamp
   * @param {*} timestamp
   * @returns {boolean} True if robot is online and False otherwise
   */
  const isRobotOnline = useCallback((timestamp) => {
    return Date.now() * 0.001 - timestamp <= ROBOT_OFFLINE_TIME;
  }, []);

  /**
   * @private Get running nodes
   * @param {*} robotStatusData
   * @returns
   */
  const getNodesRunning = useCallback((robotStatusData) => {
    const nodesLchd = robotStatusData.nodes_lchd || [];
    const nodesPersistent = robotStatusData.persistent_nodes_lchd
      ? robotStatusData.persistent_nodes_lchd
      : [];
    return nodesLchd.concat(nodesPersistent);
  }, []);

  /**
   * @private Show online Alert
   * @param {*} isOnline
   */
  const onlineAlert = useCallback(
    (isOnline) => {
      const msg = isOnline
        ? { text: i18n.t("RobotOnline"), type: "info" }
        : { text: i18n.t("RobotOffline"), type: "warning" };

      if (
        isOnline !== robotStatus.isOnline &&
        lastMessage.current !== msg.text
      ) {
        lastMessage.current = msg.text;
        alert({ message: msg.text, severity: msg.type });
      }
    },
    [alert, robotStatus.isOnline],
  );

  /**
   * @private Reset node status
   */
  const resetNodeStatus = useCallback(() => {
    const emptyNodeStatus = {};
    const emptyAllNodeStatus = {};
    // Reset node_status
    Object.keys(nodeStatusRef.current).forEach((node) => {
      emptyNodeStatus[node] = 0;
    });
    // Reset all_nodes_status
    Object.keys(allNodeStatusRef.current).forEach((node) => {
      emptyAllNodeStatus[node] = 0;
    });
    // Update local variables
    nodeStatusRef.current = emptyNodeStatus;
    allNodeStatusRef.current = emptyAllNodeStatus;
    // Send updates to canvas
    mainInterface.current?.resetAllNodeStatus();
  }, [mainInterface]);

  /**
   * Format flow path
   * @returns
   */
  const getFlowPath = useCallback(() => {
    const _version = ["-", ""].includes(version) ? "__UNVERSIONED__" : version;

    return `${id}/${_version}`;
  }, [id, version]);

  /**
   * Check if flow is running
   * @param {string} flowName : Flow to validate if is running
   * @returns {boolean} True if flowName is running and False otherwise
   */
  const isFlowRunning = useCallback(
    (flowName) => {
      return getFlowPath() === flowName;
    },
    [getFlowPath],
  );

  /**
   * @private Update node Status
   * @param {*} key
   * @param {*} targetValue
   * @param {*} data
   * @param {*} forceUpdate
   * @returns
   */
  const updateNodeStatus = useCallback(
    (key, targetValue, data, forceUpdate) => {
      if (
        !mainInterface ||
        (Date.now() - debounceDeltaRef.current <= DEBOUNCE_TIME && !forceUpdate)
      )
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

        activeFlow = isOnline ? robotStatusData.active_flow : "";
        onStartStopFlow(activeFlow);
        mainInterface.current?.nodeStatusUpdated(
          running
            ? runningNodes.reduce(
                (a, key) => ({
                  ...a,
                  [mainInterface.current?.id + "__" + key]: 1,
                }),
                {},
              )
            : { [mainInterface.current?.id]: 0 },
          { isOnline, activeFlow },
        );
      }
      // Robot doesn't have "Status" key in Redis
      else {
        if (isOnline) {
          alert({
            message: "Robot has no 'Status' information",
            severity: "warning",
          });
        }
      }

      onlineAlert(isOnline);
      setRobotStatus({ isOnline, activeFlow });
      debounceDeltaRef.current = Date.now();
    },
    [
      alert,
      getNodesRunning,
      isFlowRunning,
      isRobotOnline,
      onStartStopFlow,
      onlineAlert,
      mainInterface,
      viewMode,
    ],
  );

  //========================================================================================
  /*                                                                                      *
   *                                    Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Subscribe to changes in robot status
   * @param {*} robotId
   */
  const robotSubscribe = useCallback(
    (robotId) => {
      const robot = robotManager.getRobot(robotId);
      const robotStatusData = robot.data?.Status;
      // Set robot status from robot manager data (if any)
      if (robotStatusData) {
        onStartStopFlow(robotStatusData.active_flow);
        setRobotStatus((prevState) => {
          return {
            ...prevState,
            activeFlow: robotStatusData.active_flow,
          };
        });
      }
      // Subscribe to status change
      robot.subscribe({
        property: "Status",
        onLoad: (data) => {
          updateNodeStatus("value", robotId, data);
        },
        onUpdate: (updateData) => {
          if (updateData.event === "hset") {
            if (robotId !== selectedRobotRef.current) return;
            updateNodeStatus("key", robotId, updateData);
          }
        },
      });
    },
    [onStartStopFlow, robotManager, updateNodeStatus],
  );

  /**
   * Unsubscribe to changes in robot status
   */
  const robotUnsubscribe = useCallback(() => {
    if (selectedRobotRef.current) {
      resetNodeStatus();
      robotManager
        .getRobot(selectedRobotRef.current)
        .unsubscribe({ property: "Status" });
    }
  }, [resetNodeStatus, robotManager]);

  //========================================================================================
  /*                                                                                      *
   *                                    Hook Lifecycle                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Update selected robot ref
   */
  useEffect(() => {
    selectedRobotRef.current = robotSelected;
  }, [robotSelected]);

  /**
   * Reset node status when flow stop running
   */
  useEffect(() => {
    const isSameFlow = compareDocumentPaths(robotStatus.activeFlow, id);
    if (!isSameFlow) resetNodeStatus();
  }, [robotStatus.activeFlow, id, resetNodeStatus]);

  return {
    robotSubscribe,
    robotUnsubscribe,
    getFlowPath,
    robotStatus,
  };
};

export default useNodeStatusUpdate;
