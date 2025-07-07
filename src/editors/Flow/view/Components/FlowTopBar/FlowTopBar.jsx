import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { RobotManager, CONSTANTS } from "@mov-ai/mov-fe-lib-core";
import {
  Typography,
  Tooltip,
  Button,
  CircularProgress,
} from "@material-ui/core";
import GrainIcon from "@material-ui/icons/Grain";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import Workspace from "../../../../../utils/Workspace";
import {
  SCOPES,
  PLUGINS,
  ALERT_SEVERITIES,
  ROBOT_BLACKLIST,
} from "../../../../../utils/Constants";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../../../../../utils/Messages";
import { defaultFunction } from "../../../../../utils/Utils";
import { FLOW_VIEW_MODE } from "../../Constants/constants";
import useNodeStatusUpdate from "./hooks/useNodeStatusUpdate";

import { buttonStyles, flowTopBarStyles } from "./styles";
import FlowSearch from "./FlowSearch";

const BACKEND_CALLBACK_NAME = "backend.FlowTopBar";

const ButtonTopBar = forwardRef((props, ref) => {
  const { disabled, onClick, children, testId = "input_top-bar" } = props;
  const classes = buttonStyles();
  return (
    <Button
      data-testid={testId}
      ref={ref}
      size="small"
      color="primary"
      variant="contained"
      disabled={disabled}
      className={classes.buttonPill}
      onClick={onClick}
    >
      {children}
    </Button>
  );
});

ButtonTopBar.propTypes = {
  disabled: PropTypes.bool,
  testId: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

const FlowTopBar = (props) => {
  // Props
  const {
    call,
    alert,
    scope,
    loading,
    mainInterface,
    id,
    name,
    onRobotChange,
    onViewModeChange,
    viewMode,
    searchProps,
    confirmationAlert,
    canRun,
    robotSelected: robotSelect,
  } = props;
  // State hooks
  const [actionLoading, setActionLoading] = useState(false);
  const [robotSelected, setRobotSelected] = useState(robotSelect || "");

  // Sync robotSelected state with robotSelect prop changes
  useEffect(() => {
    console.log("robotSelect prop changed:", robotSelect);
    setRobotSelected(robotSelect || "");
  }, [robotSelect]);

  const [robotList, setRobotList] = useState({});

  // Other hooks
  const classes = flowTopBarStyles();
  const { robotSubscribe, robotUnsubscribe, getFlowPath, robotStatus } =
    useNodeStatusUpdate(props, robotSelected, viewMode);

  // Refs
  const buttonDOMRef = useRef();
  const helperRef = useRef();
  const isMounted = useRef();
  const flowInstanceRef = useRef();
  const requestedSuccessfulActionRef = useRef("");

  const [isActive, setIsActive] = useState(
    getFlowPath() === robotStatus.activeFlow,
  );

  // Managers Memos
  const robotManager = useMemo(() => new RobotManager(), []);
  const workspaceManager = useMemo(() => new Workspace(), []);

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Change robot subscriber (on change of selected robot)
   * @param {String} robotId : New selected robot
   */
  const changeRobotSubscriber = useCallback(
    (robotId) => {
      robotUnsubscribe();
      robotSubscribe(robotId);
    },
    [robotSubscribe, robotUnsubscribe],
  );

  /**
   * @private Get store helper to use cloud functions
   */
  const initStoreHelper = useCallback(() => {
    return call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.GET_STORE,
      scope,
    ).then((store) => {
      helperRef.current = store.helper;
      return store.helper;
    });
  }, [call, scope]);

  /**
   * @private Get store helper to use cloud functions
   */
  const initFlowInstance = useCallback(() => {
    return call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
      scope,
      name,
    }).then((document) => {
      flowInstanceRef.current = document;
      return document;
    });
  }, [call, scope, name]);

  /**
   * @private Init selected robot
   * @param {string} robotId : Robot ID
   */
  const initSelectedRobot = useCallback(
    (robotId) => {
      setRobotSelected(robotId);
      robotSubscribe(robotId);
      onRobotChange(robotId);
    },
    [onRobotChange, robotSubscribe],
  );

  /**
   * Get running default robot
   * @param {String} currentRobot : current selected robot id
   */
  const getRunningRobot = useCallback(
    (currentRobot, robots) => {
      // If there's a currently selected robot in local storage
      if (currentRobot) initSelectedRobot(currentRobot);
      // Call callback to get default robot
      const helper = helperRef.current;
      helper
        .getDefaultRobot()
        .then((robotId) => {
          // Update default robot in state and set as selected if there's none
          if (robotId) {
            setRobotList((prevState) => {
              return {
                ...prevState,
                [robotId]: { ...prevState[robotId], isDefault: true },
              };
            });
            // Update Flow selected robot if none is selected yet
            let robotToSelect = currentRobot;
            if (!currentRobot || !(currentRobot in robots)) {
              workspaceManager.setSelectedRobot(robotId);
              initSelectedRobot(robotId);
              robotToSelect = robotId;
            }
            // Set selected robot
            setRobotSelected(robotToSelect);
          }
        })
        .catch((err) => {
          console.warn("getRunningRobot error", err);
          alert({
            message: i18n.t(ERROR_MESSAGES.ERROR_RUNNING_SPECIFIC_CALLBACK, {
              callbackName: BACKEND_CALLBACK_NAME,
            }),
            severity: ALERT_SEVERITIES.ERROR,
          });
        });
    },
    [initSelectedRobot, workspaceManager, alert],
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * On Load Robot List
   * @param {object} robots : All robots load from robotManager
   */
  const onLoadRobotList = useCallback(
    (robots) => {
      console.log(
        "onLoadRobotList",
        robotSelected,
        workspaceManager.getSelectedRobot(),
      );
      const currentSelected =
        robotSelected || workspaceManager.getSelectedRobot();
      // Remove blacklisted robots
      Object.keys(robots).forEach((robotId) => {
        if (ROBOT_BLACKLIST.includes(robots[robotId].RobotName))
          delete robots[robotId];
      });
      // Update state hooks
      setRobotList(robots);
      // Get running Robot
      getRunningRobot(currentSelected, robots);
    },
    [getRunningRobot, workspaceManager],
  );

  /**
   * On component mount
   */
  useEffect(() => {
    // Load store loader and robot list
    initStoreHelper().then(() => {
      robotManager.getAll(onLoadRobotList);
    });
    // Load flow instance
    initFlowInstance();
    // Set isMounted
    isMounted.current = true;

    /**
     * On component unmount
     */
    return () => {
      robotUnsubscribe();
      // Unmount
      isMounted.current = false;
    };
  }, [
    initFlowInstance,
    initStoreHelper,
    onLoadRobotList,
    robotManager,
    robotUnsubscribe,
  ]);

  /**
   * Finish actionLoading when there's an update on activeFlow
   */
  useEffect(() => {
    setActionLoading(false);
    setIsActive(getFlowPath() === robotStatus.activeFlow);

    if (requestedSuccessfulActionRef.current) {
      alert({
        message: i18n.t(SUCCESS_MESSAGES.SUCCESSFUL_FLOW_ACTION, {
          action: requestedSuccessfulActionRef.current,
        }),
        severity: ALERT_SEVERITIES.SUCCESS,
      });
    }

    setActionLoading(false);
    requestedSuccessfulActionRef.current = "";
  }, [robotStatus.activeFlow, getFlowPath, setActionLoading, alert]);

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Check if can start flow
   * @param {string} action : One of values: "START" or "STOP"
   * @returns {boolean} True if can run flow and False otherwise
   */
  const canRunFlow = useCallback(
    (action) => {
      const graph = mainInterface.current?.graph;
      // let's validate flow before continuing
      graph?.validateFlow();

      const warnings = graph.warnings || [];
      const warningsVisibility = graph.warningsVisibility;
      const runtimeWarnings = warnings.filter((wn) => wn.isRuntime);
      runtimeWarnings.forEach((warning) => {
        graph.setPermanentWarnings(warning);
        if (!warningsVisibility)
          alert({
            message: runtimeWarnings[0].message,
            severity: runtimeWarnings[0].type,
          });
      });
      return !(runtimeWarnings.length && action === "START");
    },
    [alert, mainInterface],
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle change of selected robot
   * @param {Event} event : Change native event
   */
  const handleChangeRobot = useCallback(
    (event) => {
      setRobotSelected((prevState) => {
        const robotId = event.target.value;
        if (robotId !== prevState) {
          // Set in local storage
          workspaceManager.setSelectedRobot(robotId);
          // Change subscriber and update state
          changeRobotSubscriber(robotId);
          onRobotChange(robotId);
          return robotId;
        }
        return prevState;
      });
    },
    [changeRobotSubscriber, onRobotChange, workspaceManager],
  );

  /**
   * Send action to start robot
   * @param {*} action
   * @returns To avoid starting flow if flow is not eligible to start
   */
  const sendActionToRobot = useCallback(
    async (action, flowPath) => {
      const canStart = canRunFlow(action);
      if (!canStart) return;

      setActionLoading(true);
      try {
        const res = helperRef.current.sendToRobot({
          action,
          flowPath: flowPath || getFlowPath(),
          robotId: robotSelected,
        });

        if (!res || !isMounted.current) {
          alert({
            message: i18n.t("FailedFlowAction", {
              action: i18n.t(action.toLowerCase()),
            }),
            severity: ALERT_SEVERITIES.ERROR,
          });
          return;
        }

        requestedSuccessfulActionRef.current = action;
      } catch (err) {
        console.warn("Error sending action to robot", err);
        alert({
          message: i18n.t(ERROR_MESSAGES.ERROR_RUNNING_SPECIFIC_CALLBACK, {
            callbackName: BACKEND_CALLBACK_NAME,
          }),
          severity: ALERT_SEVERITIES.ERROR,
        });
      }
    },
    [alert, canRunFlow, getFlowPath, robotSelected],
  );

  /**
   * Handle Start flow button click
   */
  const handleStartFlow = useCallback(
    (saveResponse) => {
      const flowUrl = saveResponse?.model?.getUrl();

      // Start Flow if there's no active flow
      if (robotStatus.activeFlow === "") {
        sendActionToRobot("START", flowUrl);
      } else {
        // Confirmation alert if Another flow is running!
        const title = i18n.t("AnotherFlowRunningConfirmationTitle");
        const message = i18n.t("AnotherFlowRunningConfirmationMessage", {
          robotName: robotList[robotSelected].RobotName,
          activeFlow: robotStatus.activeFlow,
          id: id,
        });
        confirmationAlert({
          title,
          message,
          submitText: i18n.t("Run"),
          onSubmit: () => sendActionToRobot("START", flowUrl),
        });
      }
    },
    [
      robotStatus.activeFlow,
      sendActionToRobot,
      robotList,
      robotSelected,
      id,
      confirmationAlert,
    ],
  );

  /**
   * Handle Stop flow button click
   */
  const handleStopFlow = useCallback(() => {
    sendActionToRobot("STOP");
  }, [sendActionToRobot]);

  /**
   * Handle Save before starting a flow
   */
  const handleSaveBeforeStart = useCallback(() => {
    const isDirty = flowInstanceRef.current?.getDirty();
    if (isDirty) {
      call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.SAVE,
        {
          scope,
          name,
        },
        handleStartFlow,
      );
    } else {
      handleStartFlow();
    }
  }, [call, handleStartFlow, name, scope]);

  /**
   * Handle view mode change : default view to tree view
   * @param {Event} event : Event change
   * @param {string} newViewMode : New value
   * @returns
   */
  const handleViewModeChange = useCallback(
    (_event, newViewMode) => {
      onViewModeChange(newViewMode);
    },
    [onViewModeChange],
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Start button content
   * @returns {ReactElement} CircularProgress to indicate actionLoading or play icon with tooltip
   */
  const renderStartButton = useCallback(() => {
    // Render circular progress if actionLoading
    return actionLoading ? (
      <CircularProgress size={25} color="inherit" />
    ) : (
      <Tooltip title={i18n.t("StartFlow")}>
        <>
          <PlayArrowIcon /> {i18n.t("SaveAndRun")}
        </>
      </Tooltip>
    );
  }, [actionLoading]);

  /**
   * Render Stop button content
   * @returns {ReactElement} CircularProgress to indicate actionLoading or Stop icon with tooltip
   */
  const renderStopButton = useCallback(() => {
    // Render circular progress if actionLoading
    return actionLoading ? (
      <CircularProgress size={25} color="inherit" />
    ) : (
      <Tooltip title={i18n.t("StopFlow")}>
        <StopIcon />
      </Tooltip>
    );
  }, [actionLoading]);

  return (
    <AppBar
      data-testid="section-flow-top-bar"
      position="static"
      color="inherit"
    >
      <Toolbar variant="dense">
        <Typography component="div" className={classes.grow}>
          <FormControl className={classes.formControl}>
            <Select
              inputProps={{ "data-testid": "input_change-robot" }}
              id="robot-selector"
              value={robotSelected}
              startAdornment={<i className="icon-Happy"></i>}
              onChange={handleChangeRobot}
            >
              {Object.keys(robotList).map((robotId) => {
                const isDefaultRobot = robotList[robotId].isDefault;
                return (
                  <MenuItem
                    key={`robotList-${robotId}`}
                    value={robotId}
                    className={isDefaultRobot ? classes.defaultRobot : ""}
                  >
                    {robotList[robotId].RobotName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {isActive ? (
            <ButtonTopBar
              testId="input_stop-flow"
              ref={buttonDOMRef}
              disabled={actionLoading}
              onClick={handleStopFlow}
            >
              {renderStopButton()}
            </ButtonTopBar>
          ) : (
            <ButtonTopBar
              testId="input_save-before-start"
              ref={buttonDOMRef}
              disabled={!robotStatus.isOnline || actionLoading || !canRun}
              onClick={handleSaveBeforeStart}
            >
              {renderStartButton()}
            </ButtonTopBar>
          )}
        </Typography>
        <Typography
          data-testid="section_view-search"
          component="div"
          className={classes.searchFlowArea}
        >
          <FlowSearch {...searchProps} />
        </Typography>
        <Typography
          data-testid="section_view-mode-toggle"
          component="div"
          className={classes.visualizationToggle}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={handleViewModeChange}
          >
            <ToggleButton
              data-testid="input_default-flow"
              value={FLOW_VIEW_MODE.default}
              disabled={loading}
            >
              <Tooltip title={i18n.t("DefaultFlowView")}>
                <GrainIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              data-testid="input_tree-view-flow"
              value={FLOW_VIEW_MODE.treeView}
              disabled={loading}
            >
              <Tooltip title={i18n.t("TreeView")}>
                <i className={`icon-tree ${classes.treeIcon}`}></i>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

FlowTopBar.propTypes = {
  id: PropTypes.string,
  scope: PropTypes.string,
  viewMode: PropTypes.string,
  name: PropTypes.string,
  loading: PropTypes.bool,
  canRun: PropTypes.bool,
  mainInterface: PropTypes.object,
  call: PropTypes.func,
  confirmationAlert: PropTypes.func,
  alert: PropTypes.func,
  nodeStatusUpdated: PropTypes.func,
  onViewModeChange: PropTypes.func,
  onStartStopFlow: PropTypes.func,
  onRobotChange: PropTypes.func,
  openFlow: PropTypes.func,
  workspace: PropTypes.string,
  type: PropTypes.string,
  version: PropTypes.string,
  searchProps: PropTypes.shape({
    visible: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    onEnabled: PropTypes.func,
    onDisabled: PropTypes.func,
  }),
};

FlowTopBar.defaultProps = {
  openFlow: () => defaultFunction("openFlow"),
  onRobotChange: () => defaultFunction("onRobotChange"),
  onViewModeChange: () => defaultFunction("onViewModeChange"),
  onStartStopFlow: () => defaultFunction("onStartStopFlow"),
  nodeStatusUpdated: () => defaultFunction("nodeStatusUpdated"),
  workspace: CONSTANTS.GLOBAL_WORKSPACE,
  type: SCOPES.FLOW,
  version: "__UNVERSIONED__",
};

export default FlowTopBar;
