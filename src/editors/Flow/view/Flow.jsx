import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { filter } from "rxjs/operators";
import InfoIcon from "@material-ui/icons/Info";
import Add from "@material-ui/icons/Add";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import { Rest } from "@mov-ai/mov-fe-lib-core";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../engine/ReactPlugin/EditorReactPlugin";
import {
  FLOW_EXPLORER_PROFILE,
  FLOW_CONTEXT_MODES,
  PLUGINS,
  ALERT_SEVERITIES,
} from "../../../utils/Constants";
import Workspace from "../../../utils/Workspace";
import { KEYBINDINGS } from "../../../utils/shortcuts";
import { useKeyBinds } from "../../../utils/keybinds";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../utils/Messages";
import CallbackModel from "../../Callback/model/Callback";
import Clipboard, { KEYS } from "./Utils/Clipboard";
import Vec2 from "./Utils/Vec2";
import BaseFlow from "./Views/BaseFlow";
import { WARNING_TYPES } from "./Core/Graph/GraphValidator";
import Menu from "./Components/Menus/Menu";
import NodeMenu from "./Components/Menus/NodeMenu";
import FlowTopBar from "./Components/FlowTopBar/FlowTopBar";
import FlowBottomBar from "./Components/FlowBottomBar/FlowBottomBar";
import FlowContextMenu from "./Components/Menus/ContextMenu/FlowContextMenu";
import ContainerMenu from "./Components/Menus/ContainerMenu";
import Explorer from "./Components/Explorer/Explorer";
import LinkMenu from "./Components/Menus/LinkMenu";
import PortTooltip from "./Components/Tooltips/PortTooltip";
import InvalidLinksWarning from "./Components/Warnings/InvalidLinksWarning";
import InvalidParametersWarning from "./Components/Warnings/InvalidParametersWarning";
import InvalidExposedPortsWarning from "./Components/Warnings/InvalidExposedPortsWarning";
import { EVT_NAMES, EVT_TYPES } from "./events";
import {
  FLOW_VIEW_MODE,
  TYPES,
  PORT_TOOLTIP_MODAL_TIMEOUTS,
} from "./Constants/constants";
import GraphBase from "./Core/Graph/GraphBase";
import GraphTreeView from "./Core/Graph/GraphTreeView";
import { getBaseContextOptions } from "./contextOptions";

import "./Resources/css/Flow.css";
import { flowStyles } from "./styles";

let activeBookmark = null;

export const Flow = (props, ref) => {
  // Props
  const {
    id,
    call,
    scope,
    name,
    instance,
    data,
    alert,
    confirmationAlert,
    contextOptions,
    activateEditor,
    on,
    off,
  } = props;
  // Global consts
  const MENUS = useRef(
    Object.freeze({
      DETAIL: {
        NAME: "detail-menu",
        TITLE: "FlowDetailsMenuTitle",
      },
      NODE: {
        NAME: "node-menu",
        TITLE: "NodeInstanceMenuTitle",
      },
      LINK: {
        NAME: "link-menu",
        TITLE: "LinkInstanceMenuTitle",
      },
    }),
  );

  // State Hooks
  const [loading, setLoading] = useState(true);
  const [dataFromDB, setDataFromDB] = useState();
  const [robotSelected, setRobotSelected] = useState("");
  const [runningFlow, setRunningFlow] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [flowDebugging, setFlowDebugging] = useState();
  const [warningsVisibility, setWarningsVisibility] = useState(true);
  const [viewMode, setViewMode] = useState(FLOW_VIEW_MODE.default);
  const [tooltipConfig, setTooltipConfig] = useState(null);
  const [contextMenuOptions, setContextMenuOptions] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const { addKeyBind, removeKeyBind } = useKeyBinds(id);

  // Other Hooks
  const classes = flowStyles();
  const clipboard = useMemo(() => new Clipboard(), []);

  // Refs
  const tooltipConfigTimerRef = useRef(null);
  const lastHoveredIdRef = useRef(null);
  const interfaceSubscriptionsList = useRef([]);
  const contextArgs = useRef(null);
  const mainInterfaceRef = useRef();
  const debounceSelection = useRef();
  const selectedNodeRef = useRef();
  const selectedLinkRef = useRef();
  const isEditableComponentRef = useRef(true);
  const workspaceManager = useMemo(() => new Workspace(), []);

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns flow base class from viewMode defaults to GraphBase
   * @returns {Class} flow base class based on the viewMode
   */
  const getBaseFlowClass = () => {
    const flowClasses = {
      [FLOW_VIEW_MODE.default]: GraphBase,
      [FLOW_VIEW_MODE.treeView]: GraphTreeView,
    };
    return flowClasses[viewMode] ?? GraphBase;
  };

  /**
   * Updates the status of flow debugging variable on graph
   * And then re strokes the links (to add or remove the debug colors)
   */
  const updateLinkStroke = useCallback(() => {
    if (getMainInterface()) {
      getMainInterface().graph.isFlowDebugging = flowDebugging;
      getMainInterface().graph.reStrokeLinks();
    }
  }, [flowDebugging]);

  /**
   * Should update everything related to flowDebugging here
   */
  useEffect(() => {
    updateLinkStroke();
  }, [flowDebugging, updateLinkStroke]);

  /**
   * Start node
   * @param {Object} target : Node to be started
   */
  const startNode = useCallback(
    (node) => {
      commandNode("RUN", node, robotSelected).then(() => {
        node.statusLoading = true;
      });
    },
    [robotSelected, commandNode],
  );

  /**
   * Stop node
   * @param {Object} target : Node to be stopped
   */
  const stopNode = useCallback(
    (node) => {
      commandNode("KILL", node, robotSelected).then(() => {
        node.statusLoading = true;
      });
    },
    [robotSelected, commandNode],
  );

  /**
   * Execute command action to node to start or stop
   *
   * @param {String} action : One of values "RUN" or "KILL"
   * @param {TreeNode} node : Node to be started/stopped
   * @param {Function} callback : Success callback
   */
  const commandNode = useCallback(
    (action, node, selectedRobot) => {
      const nodeNamePath = node.getNodePath();
      return Rest.cloudFunction({
        cbName: "backend.FlowTopBar",
        func: "commandNode",
        args: {
          command: action,
          nodeName: nodeNamePath,
          robotName: selectedRobot,
        },
      })
        .then((res) => {
          if (!res.success) {
            console.warn(res.error);
            call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
              message: i18n.t(ERROR_MESSAGES.SOMETHING_WENT_WRONG),
              severity: ALERT_SEVERITIES.ERROR,
            });
          } else {
            call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
              message: i18n.t(SUCCESS_MESSAGES.NODE_IS_ACTION, {
                action: i18n.t(`ACTION_${action}`),
              }),
              severity: ALERT_SEVERITIES.INFO,
            });
          }
        })
        .catch((err) => {
          console.warn(err.toString());
          call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
            message: i18n.t(ERROR_MESSAGES.SOMETHING_WENT_WRONG),
            severity: ALERT_SEVERITIES.ERROR,
          });
        });
    },
    [call],
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get main interface instance
   */
  const getMainInterface = () => {
    return mainInterfaceRef.current;
  };

  /**
   * Set mode
   * @param {string} mode : Interface mode
   */
  const setMode = useCallback((mode) => {
    getMainInterface().setMode(mode);
  }, []);

  /**
   * Get the current node (from context menu) and all other selected nodes
   * @returns {array} Selected nodes
   */
  const getSelectedNodes = useCallback(() => {
    const node = contextArgs.current;
    const selectedNodesSet = new Set(
      [node].concat(getMainInterface().selectedNodes),
    );
    return Array.from(selectedNodesSet).filter((el) => el);
  }, []);

  /**
   * Get search options
   */
  const getSearchOptions = useCallback(() => {
    return getMainInterface()?.graph.getSearchOptions() || [];
  }, []);

  /**
   * Open document in new tab
   * @param {*} docData
   */
  const openDoc = useCallback(
    (docData) => {
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
        scope: docData.scope,
        name: docData.name,
      }).then((doc) => {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: doc.getUrl(),
          name: doc.getName(),
          scope: doc.getScope(),
        });
      });
    },
    [call],
  );

  /**
   * @private Used to remove invalid links
   * @param {*} callback
   */
  const deleteInvalidLinks = useCallback(
    (links, callback, instance = instance.current) => {
      links.forEach((link) => instance.deleteLink(link.id));

      instance.graph.clearInvalidLinks().validateFlow();

      callback?.();
    },
    [],
  );

  /**
   * @private Used to remove invalid links
   * @param {*} callback
   */
  const deleteInvalidExposedPorts = useCallback(
    (invalidExposedPorts) => {
      const exposedPorts = instance.current.exposedPorts.data;

      invalidExposedPorts.forEach((port) => {
        const portData = port.nodeInst.data;
        const portTemplate =
          portData.type === TYPES.CONTAINER
            ? `__${portData.ContainerFlow}`
            : portData.Template;

        if (
          exposedPorts.has(portTemplate) &&
          exposedPorts.get(portTemplate)[portData.id]
        ) {
          port.invalidPorts.forEach((invalidPort) =>
            instance.current.exposedPorts.toggleExposedPort(
              portTemplate,
              portData.id,
              invalidPort,
            ),
          );
        }
      });

      getMainInterface()
        .graph.clearInvalidExposedPorts(invalidExposedPorts)
        .validateFlow();
    },
    [instance],
  );

  /**
   * On Links validation
   * @param {{invalidLinks: Array, callback: Function}} eventData
   */
  const invalidLinksAlert = useCallback(
    (warning, customInterface) => {
      const { data: invalidLinks, callback } = warning;

      if (invalidLinks.length) {
        call(
          PLUGINS.DIALOG.NAME,
          PLUGINS.DIALOG.CALL.CUSTOM,
          {
            submitText: i18n.t("Fix"),
            title: i18n.t("InvalidLinksFoundTitle"),
            onSubmit: () =>
              deleteInvalidLinks(invalidLinks, callback, customInterface),
            invalidLinks,
          },
          InvalidLinksWarning,
        );
      }
    },
    [call, deleteInvalidLinks],
  );

  /**
   * On Exposed ports validation
   * @param {{invalidExposedPorts: Array, callback: Function}} eventData
   */
  const invalidExposedPortsAlert = useCallback(
    (warning) => {
      const { data: invalidExposedPorts } = warning;

      if (invalidExposedPorts.length) {
        call(
          PLUGINS.DIALOG.NAME,
          PLUGINS.DIALOG.CALL.CUSTOM,
          {
            submitText: i18n.t("Fix"),
            title: i18n.t("InvalidExposedPortsFound"),
            onSubmit: () => deleteInvalidExposedPorts(invalidExposedPorts),
            call,
            invalidExposedPorts,
          },
          InvalidExposedPortsWarning,
        );
      }
    },
    [call, deleteInvalidExposedPorts],
  );

  /**
   * @private Show alert dialog for containers with invalid parameters
   * @param {*} invalidContainersParam
   */
  const invalidContainersParamAlert = useCallback(
    (warning) => {
      const invalidContainers = warning?.data;
      // Don't show dialog if no invalid params found
      if (!invalidContainers?.length) return;

      // Show alert dialog
      call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.CUSTOM,
        {
          title: i18n.t("InvalidContainersParamTitle"),
          invalidContainerParams: invalidContainers,
          call,
        },
        InvalidParametersWarning,
      );
    },
    [call],
  );

  /**
   * Open Dialog to Enter Paste Node name
   * @param {*} position : x and y position in canvas
   * @param {*} nodeToCopy : Node data
   * @returns {Promise} Resolved only after submit or cancel dialog
   */
  const pasteNodeDialog = useCallback(
    (position, nodeToCopy) => {
      const node = nodeToCopy.node;
      return new Promise((resolve) => {
        const args = {
          title: i18n.t("PasteNodeModel", { nodeModel: node.model }),
          value: `${node.id}_copy`,
          onClose: () => {
            setFlowsToDefault();
            resolve();
          },
          onValidation: (newName) =>
            getMainInterface().graph.validator.validateNodeName(
              newName,
              i18n.t(node.model),
            ),
          onSubmit: (newName) =>
            getMainInterface().pasteNode(newName, node, position),
        };
        // Open Dialog
        call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.FORM_DIALOG, args);
      });
    },
    [call, setFlowsToDefault],
  );

  //========================================================================================
  /*                                                                                      *
   *                               Right menu initialization                              *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get Menu component based on node model (Flow or Node)
   * @param {Stringimport("lodash").NullableChain} model : One of each "Flow" or "Node"
   * @returns {ReactComponent} Reference to menu component
   */
  const getMenuComponent = useCallback((model = "") => {
    const componentByModel = {
      Node: NodeMenu,
      Flow: ContainerMenu,
    };
    return model in componentByModel ? componentByModel[model] : null;
  }, []);

  /**
   * Get node menu if any
   */
  const getNodeMenuToAdd = useCallback(
    (node) => {
      const MenuComponent = getMenuComponent(node?.data?.model);
      if (!node || !MenuComponent) return;
      return {
        icon: <i className="icon-Nodes" />,
        name: MENUS.current.NODE.NAME,
        title: i18n.t(MENUS.current.NODE.TITLE),
        view: (
          <MenuComponent
            id={id}
            call={call}
            nodeInst={node}
            flowModel={instance}
            openDoc={openDoc}
            editable={true}
          />
        ),
      };
    },
    [call, id, instance, openDoc, getMenuComponent],
  );

  /**
   * Add node menu if any
   */
  const addNodeMenu = useCallback(
    (node, nodeSelection) => {
      const MenuComponent = getMenuComponent(node?.data?.model);
      if (!node || !MenuComponent) return;
      call(
        PLUGINS.RIGHT_DRAWER.NAME,
        PLUGINS.RIGHT_DRAWER.CALL.ADD_BOOKMARK,
        getNodeMenuToAdd(node),
        activeBookmark,
        nodeSelection,
        true,
      );
    },
    [call, getMenuComponent, getNodeMenuToAdd],
  );

  /**
   * Get link right menu if any
   * @param {Link} link : Link to be rendered in menu
   */
  const getLinkMenuToAdd = useCallback(
    (link) => {
      if (!link) return;
      return {
        icon: <CompareArrowsIcon />,
        name: MENUS.current.LINK.NAME,
        title: i18n.t(MENUS.current.LINK.TITLE),
        view: (
          <LinkMenu
            id={id}
            call={call}
            link={link}
            flowModel={instance}
            sourceMessage={link?.src?.data?.message}
          />
        ),
      };
    },
    [call, id, instance],
  );

  /**
   * Add link right menu if any
   * @param {Link} link : Link to be rendered in menu
   */
  const addLinkMenu = useCallback(
    (link, linkSelection) => {
      if (!link) return;
      call(
        PLUGINS.RIGHT_DRAWER.NAME,
        PLUGINS.RIGHT_DRAWER.CALL.ADD_BOOKMARK,
        getLinkMenuToAdd(link),
        activeBookmark,
        linkSelection,
        true,
      );
    },
    [call, getLinkMenuToAdd],
  );

  const renderMenus = useCallback(() => {
    const details = props.data?.details || {};
    const bookmarks = {
      [MENUS.current.DETAIL.NAME]: {
        icon: <InfoIcon></InfoIcon>,
        name: MENUS.current.DETAIL.NAME,
        title: i18n.t(MENUS.current.DETAIL.TITLE),
        view: (
          <Menu
            id={id}
            call={call}
            name={name}
            details={details}
            model={instance}
            editable={true}
          ></Menu>
        ),
      },
    };

    if (isEditableComponentRef.current) {
      const explorerView = new Explorer(FLOW_EXPLORER_PROFILE);

      bookmarks[FLOW_EXPLORER_PROFILE.name] = {
        icon: <Add />,
        name: FLOW_EXPLORER_PROFILE.name,
        title: i18n.t(FLOW_EXPLORER_PROFILE.title),
        view: explorerView.render({
          flowId: id,
          mainInterface: getMainInterface(),
        }),
      };
    }

    // Add node menu if any is selected
    if (selectedNodeRef.current) {
      bookmarks[MENUS.current.NODE.NAME] = getNodeMenuToAdd(
        selectedNodeRef.current,
      );
    }

    // Add link menu if any is selected
    if (selectedLinkRef.current) {
      bookmarks[MENUS.current.LINK.NAME] = getLinkMenuToAdd(
        selectedLinkRef.current,
      );
    }

    // add bookmark
    call(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK,
      bookmarks,
      activeBookmark,
    );
  }, [
    id,
    name,
    instance,
    props.data,
    call,
    getNodeMenuToAdd,
    getLinkMenuToAdd,
  ]);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On Robot selection change
   * @param {*} robotId
   */
  const onRobotChange = useCallback((robotId) => {
    setRobotSelected(robotId);
  }, []);

  function hasNodesToStart() {
    for (const entry of instance.current.links.data)
      if (entry[1].from === "start/start/start") return true;

    return false;
  }

  /**
   * On view mode change
   * @param {string} newViewMode : One of the following "default" or "treeView"
   */
  const onViewModeChange = useCallback(
    (newViewMode) => {
      if (!newViewMode || viewMode === newViewMode) return;
      isEditableComponentRef.current = newViewMode === FLOW_VIEW_MODE.default;

      setLoading(true);

      // Set mode loading after changing view mode
      setMode(EVT_NAMES.LOADING);

      // Temporary fix to show loading (even though UI still freezes)
      setTimeout(() => {
        setViewMode(newViewMode);
      }, 100);
    },
    [viewMode, setMode],
  );

  /**
   * Toggle Warnings
   */
  const onToggleWarnings = useCallback(() => {
    setWarningsVisibility((prevState) => {
      const newVisibility = !prevState;
      getMainInterface()?.onToggleWarnings({ data: newVisibility });
      return newVisibility;
    });
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                  Handle Flow Events                                  *
   *                                                                                      */
  //========================================================================================

  /**
   * Remove Node Bookmark and set selectedNode to null
   */
  const unselectNode = useCallback(() => {
    call(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.CALL.REMOVE_BOOKMARK,
      MENUS.current.NODE.NAME,
      MENUS.current.DETAIL.NAME,
    );
    selectedNodeRef.current = null;
  }, [call, selectedNodeRef]);

  /**
   * On Node Selected
   * @param {*} node
   */
  const onNodeSelected = useCallback(
    (node) => {
      clearTimeout(debounceSelection.current);
      contextArgs.current = node;
      debounceSelection.current = setTimeout(() => {
        if (!node) {
          unselectNode();
        } else {
          // We only want 1 selection at the time.
          // So let's unselect links if any is selected
          if (selectedLinkRef.current) onLinkSelected(null);

          selectedNodeRef.current = node;
          activeBookmark = MENUS.current.NODE.NAME;
          addNodeMenu(node, true);
          activateEditor();
        }
      }, 100);
    },
    [addNodeMenu, unselectNode, onLinkSelected, activateEditor],
  );

  /**
   * On Link selected
   * @param {BaseLink} link : Link instance
   */
  const onLinkSelected = useCallback(
    (link) => {
      selectedLinkRef.current = link;
      getMainInterface().selectedLink = link;
      if (!link) {
        activeBookmark = MENUS.current.DETAIL.NAME;
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.REMOVE_BOOKMARK,
          MENUS.current.LINK.NAME,
          activeBookmark,
        );
      } else {
        const currentMode = getMainInterface().mode.mode;
        // We only want 1 selection at the time.
        // So let's unselect nodes if any is selected
        if (
          currentMode.id === EVT_NAMES.SELECT_NODE &&
          currentMode.props.shiftKey
        ) {
          // If we're making multiple node selection we need to reset the mode
          getMainInterface().setMode(EVT_NAMES.DEFAULT);
          // Since we resetted the mode, we need to add back the selected link
          getMainInterface().selectedLink = link;
        } else if (selectedNodeRef.current) {
          // If we just selected 1 node, it's ok, let's just unselect it
          selectedNodeRef.current.selected = false;
        }

        // Remove node menu
        unselectNode();

        activeBookmark = MENUS.current.LINK.NAME;
        addLinkMenu(link, true);

        activateEditor();
      }
    },
    [call, unselectNode, addLinkMenu, activateEditor],
  );

  /**
   * Close context menu
   */
  const handleContextClose = useCallback(() => {
    contextArgs.current = null;
    setContextMenuOptions(null);
    getMainInterface().setMode(EVT_NAMES.DEFAULT);
  }, []);

  /**
   * Call broadcast method to emit event to all open flows
   */
  const setFlowsToDefault = useCallback(() => {
    // Remove selected node and link bookmark
    onNodeSelected(null);
    onLinkSelected(null);
    // Update render of right menu
    // broadcast event to other flows
    call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.BROADCAST,
      PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR,
      { action: "setMode", value: EVT_NAMES.DEFAULT },
    );
  }, [call, onLinkSelected, onNodeSelected]);

  /**
   * Used to handle the port tooltip closing
   */
  const handleCloseTooltip = useCallback(
    (hoveredId, timer = PORT_TOOLTIP_MODAL_TIMEOUTS.NORMAL) => {
      lastHoveredIdRef.current = hoveredId;
      clearTimeout(tooltipConfigTimerRef.current);

      tooltipConfigTimerRef.current = setTimeout(() => {
        const bubbledUpHoveredElements = document.querySelectorAll(":hover");

        const checkIfIdInHoveredElements = [...bubbledUpHoveredElements].find(
          (el) =>
            el.id === `${lastHoveredIdRef.current}_port` ||
            el.id === `${lastHoveredIdRef.current}_tooltip`,
        );

        if (!hoveredId && !checkIfIdInHoveredElements) {
          setTooltipConfig(null);
          tooltipConfigTimerRef.current = null;
          lastHoveredIdRef.current = null;
        } else {
          handleCloseTooltip(hoveredId);
        }
      }, timer);
    },
    [],
  );

  /**
   * Subscribe to mainInterface and canvas events
   */
  const onReady = useCallback(
    (mainInterface) => {
      mainInterfaceRef.current = mainInterface;

      // If we are running this function again,
      // we should do some cleanup before continue
      interfaceSubscriptionsList.current.forEach((sub) => {
        sub.unsubscribe();
      });
      interfaceSubscriptionsList.current = [];

      // Set the warning types to be used in the validations
      mainInterface.graph.validator.setWarningActions(
        WARNING_TYPES.INVALID_EXPOSED_PORTS,
        invalidExposedPortsAlert,
      );
      mainInterface.graph.validator.setWarningActions(
        WARNING_TYPES.INVALID_LINKS,
        invalidLinksAlert,
      );
      mainInterface.graph.validator.setWarningActions(
        WARNING_TYPES.INVALID_PARAMETERS,
        invalidContainersParamAlert,
      );

      // Subscribe to flow validations
      mainInterface.graph.onFlowValidated.subscribe((evtData) => {
        const persistentWarns = evtData.warnings.filter(
          (el) => el.isPersistent,
        );

        setWarnings(persistentWarns);
      });

      mainInterface.onLoad = () => setLoading(false);

      // subscribe to on enter default mode
      // When enter default mode remove other node/sub-flow bookmarks
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.DEFAULT].onEnter.subscribe(() => {
          setFlowsToDefault();
        }),
      );

      // Subscribe to on node select event
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.SELECT_NODE].onEnter.subscribe(() => {
          const selectedNodes = mainInterface.selectedNodes;
          const node = selectedNodes.length !== 1 ? null : selectedNodes[0];
          onNodeSelected(node);
        }),
      );

      // Subscribe to double click event in a node
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_DBL_CLICK].onEnter.subscribe(
          (evtData) => {
            const node = evtData.node;
            openDoc({
              name: node.templateName,
              scope: node.data.model,
            });
          },
        ),
      );

      // Subscribe to node instance/sub flow context menu events
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_NODE_CTX_MENU].onEnter.subscribe(
          (evtData) => {
            const node = evtData.node;
            const anchorPosition = {
              left: evtData.event.clientX,
              top: evtData.event.clientY,
            };

            contextArgs.current = node;
            setContextMenuOptions({
              anchorPosition,
              options: getContextOptions(node?.data?.type, node, {
                handleCopyNode,
                handleDeleteNode,
                nodeDebug: {
                  startNode: {
                    func: startNode,
                    disabled: !(node.data.type === TYPES.CONTAINER
                      ? false
                      : runningFlow && !node.status),
                  },
                  stopNode: {
                    func: stopNode,
                    disabled: !(node.data.type === TYPES.CONTAINER
                      ? false
                      : runningFlow && node.status),
                  },
                },
                viewMode,
              }),
            });
          },
        ),
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ADD_NODE].onClick.subscribe(() => {
          const nodeName = getMainInterface().mode.current.props.node.data.name;
          const args = {
            title: i18n.t("AddNode"),
            submitText: i18n.t("Add"),
            value: nodeName,
            onValidation: (newName) =>
              getMainInterface().graph.validator.validateNodeName(
                newName,
                i18n.t("Node"),
              ),
            onClose: setFlowsToDefault,
            onSubmit: (newName) => getMainInterface().addNode(newName),
          };
          // Open form dialog
          call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.FORM_DIALOG, args);
        }),
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ADD_FLOW].onClick.subscribe(() => {
          const flowName = getMainInterface().mode.current.props.node.data.name;
          const args = {
            title: i18n.t("AddSubFlow"),
            submitText: i18n.t("Add"),
            value: flowName,
            onValidation: (newName) =>
              getMainInterface().graph.validator.validateNodeName(
                newName,
                i18n.t("SubFlow"),
              ),
            onClose: setFlowsToDefault,
            onSubmit: (newName) => getMainInterface().addFlow(newName),
          };
          // Open form dialog
          call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.FORM_DIALOG, args);
        }),
      );

      // Subscribe to link context menu events
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_LINK_CTX_MENU].onEnter.subscribe(
          (evtData) => {
            const anchorPosition = {
              left: evtData.event.clientX,
              top: evtData.event.clientY,
            };

            contextArgs.current = evtData;
            setContextMenuOptions({
              anchorPosition,
              options: getContextOptions(FLOW_CONTEXT_MODES.LINK, evtData, {
                handleDeleteLink,
                viewMode,
              }),
            });
          },
        ),
      );

      // Subscribe to canvas context menu
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_CANVAS_CTX_MENU].onEnter.subscribe(
          (evtData) => {
            const anchorPosition = {
              left: evtData.event.clientX,
              top: evtData.event.clientY,
            };

            contextArgs.current = evtData.position;
            setContextMenuOptions({
              anchorPosition,
              options: getContextOptions(
                FLOW_CONTEXT_MODES.CANVAS,
                evtData.position,
                {
                  handlePasteNodes,
                  viewMode,
                },
              ),
            });
          },
        ),
      );

      // subscribe to port context menu event
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_PORT_CTX_MENU].onEnter.subscribe(
          (evtData) => {
            const anchorPosition = {
              left: evtData.event.clientX,
              top: evtData.event.clientY,
            };

            contextArgs.current = evtData.port;
            setContextMenuOptions({
              anchorPosition,
              options: getContextOptions(
                FLOW_CONTEXT_MODES.PORT,
                evtData.port,
                {
                  handleToggleExposedPort,
                  handleOpenCallback,
                  viewMode,
                },
              ),
            });
          },
        ),
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              (event) =>
                event.name === EVT_NAMES.ON_MOUSE_OVER &&
                event.type === EVT_TYPES.LINK,
            ),
          )
          .subscribe((evtData) => mainInterface.graph.onMouseOverLink(evtData)),
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              (event) =>
                event.name === EVT_NAMES.ON_MOUSE_OUT &&
                event.type === EVT_TYPES.LINK,
            ),
          )
          .subscribe((evtData) => mainInterface.graph.onMouseOutLink(evtData)),
      );

      // Select Link event
      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              (event) =>
                event.name === EVT_NAMES.ON_CLICK &&
                event.type === EVT_TYPES.LINK,
            ),
          )
          .subscribe((event) => onLinkSelected(event.data)),
      );

      // subscribe to port mouseOver event
      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              (event) =>
                event.name === EVT_NAMES.ON_MOUSE_OVER &&
                event.type === EVT_TYPES.PORT,
            ),
          )
          .subscribe((evtData) => {
            const { port, event } = evtData;
            const anchorPosition = {
              left: event.layerX + 8,
              top: event.layerY,
            };

            setTooltipConfig({
              port,
              anchorPosition,
            });

            handleCloseTooltip(port.name);
          }),
      );

      // subscribe to port mouseOut event
      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              (event) =>
                event.name === EVT_NAMES.ON_MOUSE_OUT &&
                event.type === EVT_TYPES.PORT,
            ),
          )
          .subscribe(() =>
            handleCloseTooltip(null, PORT_TOOLTIP_MODAL_TIMEOUTS.FORCE_CLOSE),
          ),
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              (event) =>
                event.name === EVT_NAMES.ON_CHG_MOUSE_OVER &&
                event.type === EVT_TYPES.LINK,
            ),
          )
          .subscribe((evtData) => console.log("onLinkErrorMouseOver", evtData)),
      );
    },
    [
      runningFlow,
      viewMode,
      call,
      invalidExposedPortsAlert,
      invalidLinksAlert,
      invalidContainersParamAlert,
      setFlowsToDefault,
      onNodeSelected,
      openDoc,
      getContextOptions,
      handleCopyNode,
      handleDeleteNode,
      handleCloseTooltip,
      startNode,
      stopNode,
      handleDeleteLink,
      handlePasteNodes,
      handleToggleExposedPort,
      handleOpenCallback,
      onLinkSelected,
    ],
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handler for the Flow Debug Switch
   * @param {*} e : event
   */
  const handleFlowDebugChange = useCallback(
    (e) => {
      workspaceManager.setFlowIsDebugging(e.target.checked);
      setFlowDebugging(e.target.checked);
    },
    [workspaceManager],
  );

  /**
   * Handle Delete : Show confirmation dialog before performing delete action
   * @param {{nodeId: string, callback: function}} data
   */
  const handleDelete = useCallback(
    ({ message, callback }) => {
      confirmationAlert({
        submitText: i18n.t("Delete"),
        title: i18n.t("ConfirmDelete"),
        onSubmit: callback,
        onClose: setFlowsToDefault,
        message,
      });
    },
    [confirmationAlert, setFlowsToDefault],
  );

  /**
   * Handle copy node
   */
  const handleCopyNode = useCallback(
    async (evt) => {
      evt?.preventDefault?.();

      const selectedNodes = await Promise.all(
        getSelectedNodes().map(async (n) => {
          const newNode = await getMainInterface().getUpdatedVersionOfNode(n);
          return newNode;
        }),
      );

      const nodesPos = selectedNodes.map((n) =>
        Vec2.of(n.center.xCenter, n.center.yCenter),
      );
      let center = nodesPos.reduce((e, x) => e.add(x), Vec2.ZERO);
      center = center.scale(1 / selectedNodes.length);
      // Nodes to copy
      const nodesToCopy = {
        nodes: selectedNodes.map((n) => n.data),
        flow: data.id,
        nodesPosFromCenter: nodesPos.map((pos) => pos.sub(center)),
      };
      // Write nodes to copy to clipboard
      clipboard.write(KEYS.NODES_TO_COPY, nodesToCopy);
    },
    [clipboard, getSelectedNodes, data.id],
  );

  /**
   * Handle paste nodes in canvas
   */
  const handlePasteNodes = useCallback(
    async (evt) => {
      evt?.preventDefault?.();
      const position = (contextArgs.current =
        getMainInterface().canvas.mousePosition);
      const nodesToPaste = clipboard.read(KEYS.NODES_TO_COPY);
      if (!nodesToPaste) return;

      for (const [i, node] of nodesToPaste.nodes.entries()) {
        const nodesPosFromCenter = nodesToPaste.nodesPosFromCenter || [
          Vec2.ZERO,
        ];
        const newPos = Vec2.of(position.x, position.y).add(
          nodesPosFromCenter[i],
        );
        // Open dialog for each node to copy
        await pasteNodeDialog(newPos.toObject(), {
          node: node,
          flow: nodesToPaste.flow,
        });
      }
    },
    [clipboard, pasteNodeDialog],
  );

  /**
   * Handle delete node
   */
  const handleDeleteNode = useCallback(() => {
    const selectedNodes = getSelectedNodes();
    if (!selectedNodes.length) return;
    // Callback to delete all nodes
    const callback = () => {
      selectedNodes.forEach((node) => {
        getMainInterface().deleteNode(node.data);
      });
      unselectNode();
    };
    // Compose confirmation message
    const message = i18n.t("NodeDeleteConfirmation", {
      nodes:
        selectedNodes.length === 1
          ? selectedNodes[0].data.id
          : i18n.t("TheSelectedNodes"),
    });
    // Show confirmation before delete
    handleDelete({ message, callback });
  }, [handleDelete, unselectNode, getSelectedNodes]);

  /**
   * Handle delete link
   */
  const handleDeleteLink = useCallback(() => {
    const link = selectedLinkRef.current ?? contextArgs.current;
    link.id && getMainInterface().deleteLink(link.id);
  }, []);

  /**
   * Triggers the correct deletion
   * (if a link is selected delete link, else delete nodes)
   */
  const handleShortcutDelete = useCallback(() => {
    if (selectedLinkRef.current) handleDeleteLink();
    else handleDeleteNode();
  }, [handleDeleteLink, handleDeleteNode]);

  /**
   * Toggle exposed port
   */
  const handleToggleExposedPort = useCallback(() => {
    const port = contextArgs.current;
    getMainInterface().toggleExposedPort(port);
  }, []);

  /**
   * Open Callback
   * @param {string} callbackName : Callback name
   */
  const handleOpenCallback = useCallback(
    (callbackName) => {
      // If no callback name is passed -> returns
      if (!callbackName) return;
      // Open existing callback
      const scope = CallbackModel.SCOPE;
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
        scope,
        name: callbackName,
      }).then((doc) => {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: doc.getUrl(),
          name: doc.getName(),
          scope,
        });
      });
    },
    [call],
  );

  /**
   * Handle zoom reset
   */
  const handleResetZoom = useCallback(() => {
    getMainInterface()?.onResetZoom();
  }, []);

  /**
   * Handle Move Node
   */
  const handleMoveNode = useCallback((e) => {
    getMainInterface()?.onMoveNode(e);
  }, []);

  /*
   * Handle search nodes
   */
  const handleSearchNode = useCallback((node) => {
    const mainInterface = getMainInterface();
    const nodeInstance = node && mainInterface.searchNode(node);
    if (!nodeInstance) return;
    nodeInstance.handleSelectionChange();
    mainInterface.onFocusNode(nodeInstance);
  }, []);

  const handleSearchEnabled = useCallback(
    (e) => {
      e?.preventDefault();
      if (!searchVisible) setSearchVisible(true);
    },
    [searchVisible],
  );

  const handleSearchEnable = useCallback((e) => {
    e?.preventDefault();
    setSearchVisible(true);
  }, []);

  const handleSearchDisabled = useCallback(() => {
    setSearchVisible(false);
  }, []);

  const getContextOptions = useCallback(
    (mode, data, args) => {
      const baseContextOptions = getBaseContextOptions(mode, data, args);
      const contextOpts = contextOptions?.(baseContextOptions)?.[mode]?.(data);

      return contextOpts ?? baseContextOptions;
    },
    [contextOptions],
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Component did mount
   */
  useEffect(() => {
    on(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.ON.CHANGE_BOOKMARK,
      (bookmark) => {
        activeBookmark = bookmark.name;
      },
    );

    // Subscribe to docManager broadcast for flowEditor (global events)
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR, (evt) => {
      // evt ex.: {action: "setMode", value: EVT_NAMES.DEFAULT}
      const { action, value } = evt;
      getMainInterface()?.[action](value);
    });

    setFlowDebugging(workspaceManager.getFlowIsDebugging());

    return () => {
      off(PLUGINS.RIGHT_DRAWER.NAME, PLUGINS.RIGHT_DRAWER.ON.CHANGE_BOOKMARK);
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR);
    };
  }, [on, off, workspaceManager]);

  /**
   * Initialize data
   */
  useEffect(() => {
    const model = instance.current;

    if (model) {
      setDataFromDB(model.serializeToDB());
    }
  }, [instance, data]);

  useEffect(() => {
    on(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.ON.BEFORE_SAVE_DOC,
      async (docData) => {
        if (viewMode === FLOW_VIEW_MODE.treeView && docData.doc.name === name) {
          const subFlows = mainInterfaceRef.current.graph.subFlows;

          for (let i = 0, n = subFlows.length; i < n; i++) {
            await call(
              PLUGINS.DOC_MANAGER.NAME,
              PLUGINS.DOC_MANAGER.CALL.SAVE,
              {
                scope,
                name: subFlows[i].templateName,
              },
              null,
              // {{ignoreNew: true}} Because we don't want to show the new doc popup on missing subflows
              // {{preventAlert: true}} Because independently of how many saves we do we just to want to show the snackbar once
              { ignoreNew: true, preventAlert: true },
            );
          }
        }
      },
    );
    return () => {
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.BEFORE_SAVE_DOC);
    };
  }, [name, scope, viewMode, on, off, call]);

  useEffect(() => {
    addKeyBind(
      KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_CLOSE.SHORTCUTS,
      (evt) => {
        evt.preventDefault();
        handleSearchDisabled();
      },
      KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_CLOSE.SCOPE,
    );
    addKeyBind(
      KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_PREVENT_SEARCH.SHORTCUTS,
      (evt) => {
        evt.preventDefault();
      },
      KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_PREVENT_SEARCH.SCOPE,
    );
    addKeyBind(KEYBINDINGS.FLOW.KEYBINDS.COPY_NODE.SHORTCUTS, handleCopyNode);
    addKeyBind(
      KEYBINDINGS.FLOW.KEYBINDS.PASTE_NODE.SHORTCUTS,
      handlePasteNodes,
    );
    addKeyBind(KEYBINDINGS.FLOW.KEYBINDS.MOVE_NODE.SHORTCUTS, handleMoveNode);
    addKeyBind(
      KEYBINDINGS.FLOW.KEYBINDS.SEARCH_NODE.SHORTCUTS,
      handleSearchEnable,
    );
    addKeyBind(KEYBINDINGS.FLOW.KEYBINDS.RESET_ZOOM.SHORTCUTS, handleResetZoom);
    addKeyBind(
      KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.CANCEL.SHORTCUTS,
      setFlowsToDefault,
    );
    addKeyBind(
      KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.DELETE.SHORTCUTS,
      handleShortcutDelete,
    );
    // remove keyBind on unmount
    return () => {
      removeKeyBind(KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_CLOSE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.COPY_NODE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.PASTE_NODE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.MOVE_NODE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.SEARCH_NODE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.RESET_ZOOM.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.CANCEL.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.DELETE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS);
    };
  }, [
    addKeyBind,
    removeKeyBind,
    setFlowsToDefault,
    handleCopyNode,
    handlePasteNodes,
    handleDeleteNode,
    handleMoveNode,
    handleSearchEnable,
    handleResetZoom,
    handleShortcutDelete,
    handleSearchDisabled,
  ]);

  usePluginMethods(ref, {
    renderMenus,
    setFlowsToDefault,
    onRobotChange,
  });

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================
  return (
    <div data-testid="section_flow-editor" className={classes.root}>
      <div id="flow-top-bar">
        <FlowTopBar
          id={id}
          call={call}
          name={name}
          alert={alert}
          confirmationAlert={confirmationAlert}
          scope={scope}
          loading={loading}
          viewMode={viewMode}
          version={instance.current?.version}
          mainInterface={mainInterfaceRef}
          onRobotChange={onRobotChange}
          canRun={hasNodesToStart()}
          onStartStopFlow={setRunningFlow}
          onViewModeChange={onViewModeChange}
          searchProps={{
            visible: searchVisible,
            options: getSearchOptions(),
            onChange: handleSearchNode,
            onEnabled: handleSearchEnabled,
            onDisabled: handleSearchDisabled,
          }}
          robotSelected={robotSelected}
        ></FlowTopBar>
      </div>
      <BaseFlow
        {...props}
        graphClass={getBaseFlowClass()}
        loading={loading}
        viewMode={viewMode}
        dataFromDB={dataFromDB}
        warnings={warnings}
        warningsVisibility={warningsVisibility}
        flowDebugging={flowDebugging}
        onReady={onReady}
      />
      <FlowBottomBar
        openFlow={openDoc}
        onToggleWarnings={onToggleWarnings}
        warningVisibility={warningsVisibility}
        robotSelected={robotSelected}
        runningFlow={runningFlow}
        warnings={warnings}
        toggleFlowDebug={handleFlowDebugChange}
        flowDebugging={flowDebugging}
      />
      {contextMenuOptions?.options && (
        <FlowContextMenu onClose={handleContextClose} {...contextMenuOptions} />
      )}
      {tooltipConfig && (
        <PortTooltip
          {...tooltipConfig}
          handleCloseTooltip={handleCloseTooltip}
        />
      )}
    </div>
  );
};

Flow.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  off: PropTypes.func.isRequired,
  data: PropTypes.object,
  instance: PropTypes.object,
  editable: PropTypes.bool,
  alert: PropTypes.func,
  confirmationAlert: PropTypes.func,
  saveDocument: PropTypes.func,
  activateEditor: PropTypes.func,
  contextOptions: PropTypes.func,
};

export default withEditorPlugin(Flow);
