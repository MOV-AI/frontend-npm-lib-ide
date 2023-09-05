import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
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
  ALERT_SEVERITIES
} from "../../../utils/Constants";
import Workspace from "../../../utils/Workspace";
import { KEYBINDINGS } from "../../../utils/shortcuts";
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
import { FLOW_VIEW_MODE, TYPES } from "./Constants/constants";
import GraphBase from "./Core/Graph/GraphBase";
import GraphTreeView from "./Core/Graph/GraphTreeView";
import { getBaseContextOptions } from "./contextOptions";
import { useSub, useRemix, call, subscribe, subscribeAll, useUpdate } from "./../../../utils/noremix";
import { flowSub } from "./Components/interface/MainInterface";
import { dialog } from "./../../../plugins/Dialog/Dialog";

import "./Resources/css/Flow.css";
import { flowStyles } from "./styles";

let activeBookmark = null;

export const Flow = (props, ref) => {
  // Props
  const {
    id,
    scope,
    name,
    instance,
    data,
    alert,
    addKeyBind,
    removeKeyBind,
    activateEditor,
    activateKeyBind,
    confirmationAlert,
    contextOptions,
  } = props;
  const mainInterface = useSub(flowSub)[name];

  useRemix(props);

  // Global consts
  const MENUS = useRef(
    Object.freeze({
      DETAIL: {
        NAME: "detail-menu",
        TITLE: "FlowDetailsMenuTitle"
      },
      NODE: {
        NAME: "node-menu",
        TITLE: "NodeInstanceMenuTitle"
      },
      LINK: {
        NAME: "link-menu",
        TITLE: "LinkInstanceMenuTitle"
      }
    })
  );

  // State Hooks
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

  // Other Hooks
  const classes = flowStyles();
  const { t } = useTranslation();
  const clipboard = useMemo(() => new Clipboard(), []);

  // Refs
  const interfaceSubscriptionsList = useRef([]);
  const contextArgs = useRef(null);
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
  const baseFlowClass = useMemo(() => ({
    [FLOW_VIEW_MODE.default]: GraphBase,
    [FLOW_VIEW_MODE.treeView]: GraphTreeView
  })[viewMode] ?? GraphBase, [viewMode]);

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
    node => {
      commandNode("RUN", node).then(() => {
        node.statusLoading = true;
      });
    },
    [commandNode]
  );

  /**
   * Stop node
   * @param {Object} target : Node to be stopped
   */
  const stopNode = useCallback(
    node => {
      commandNode("KILL", node).then(() => {
        node.statusLoading = true;
      });
    },
    [commandNode]
  );

  /**
   * Execute command action to node to start or stop
   *
   * @param {String} action : One of values "RUN" or "KILL"
   * @param {TreeNode} node : Node to be started/stopped
   * @param {Function} callback : Success callback
   */
  const commandNode = useCallback(
    (action, node, selectedRobot = robotSelected) => {
      const nodeNamePath = node.getNodePath();
      return Rest.cloudFunction({
        cbName: "backend.FlowTopBar",
        func: "commandNode",
        args: {
          command: action,
          nodeName: nodeNamePath,
          robotName: selectedRobot
        }
      })
        .then(res => {
          if (!res.success) {
            console.warn(res.error);
            call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
              message: t(ERROR_MESSAGES.SOMETHING_WENT_WRONG),
              severity: ALERT_SEVERITIES.ERROR
            });
          } else {
            call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
              message: t(SUCCESS_MESSAGES.NODE_IS_ACTION, {
                action: t(`ACTION_${action}`)
              }),
              severity: ALERT_SEVERITIES.INFO
            });
          }
        })
        .catch(err => {
          console.warn(err.toString());
          call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
            message: t(ERROR_MESSAGES.SOMETHING_WENT_WRONG),
            severity: ALERT_SEVERITIES.ERROR
          });
        });
    },
    [robotSelected, t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Get the current node (from context menu) and all other selected nodes
   * @returns {array} Selected nodes
   */
  const getSelectedNodes = useCallback(() => {
    const node = contextArgs.current;
    const selectedNodesSet = new Set(
      [node].concat(mainInterface.selectedNodes)
    );
    return Array.from(selectedNodesSet).filter(el => el);
  }, [mainInterface]);

  /**
   * Get search options
   */
  const getSearchOptions = useCallback(() => {
    return mainInterface?.graph.getSearchOptions() || [];
  }, [mainInterface]);

  /**
   * Open document in new tab
   * @param {*} docData
   */
  const openDoc = useCallback(
    docData => call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
      scope: docData.scope,
      name: docData.name
    }).then(doc => call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
      id: doc.getUrl(),
      name: doc.getName(),
      scope: doc.getScope()
    })),
    []
  );

  /**
   * @private Used to remove invalid links
   * @param {*} callback
   */
  const deleteInvalidLinks = useCallback(
    (links, callback, instance = instance.current) => {
      links.forEach(link => instance.deleteLink(link.id));

      instance.graph.clearInvalidLinks().validateFlow();

      callback?.();
    },
    []
  );

  /**
   * @private Used to remove invalid links
   * @param {*} callback
   */
  const deleteInvalidExposedPorts = useCallback(
    invalidExposedPorts => {
      const exposedPorts = instance.current.exposedPorts.data;

      invalidExposedPorts.forEach(port => {
        const portData = port.nodeInst.data;
        const portTemplate =
          portData.type === TYPES.CONTAINER
            ? `__${portData.ContainerFlow}`
            : portData.Template;

        if (
          exposedPorts.has(portTemplate) &&
          exposedPorts.get(portTemplate)[portData.id]
        ) {
          port.invalidPorts.forEach(invalidPort =>
            instance.current.exposedPorts.toggleExposedPort(
              portTemplate,
              portData.id,
              invalidPort
            )
          );
        }
      });

      mainInterface
        .graph.clearInvalidExposedPorts(invalidExposedPorts)
        .validateFlow();
    },
    [instance, mainInterface]
  );

  /**
   * On Links validation
   * @param {{invalidLinks: Array, callback: Function}} eventData
   */
  const invalidLinksAlert = useCallback((warning, customInterface) => dialog({
    submitText: t("Fix"),
    title: t("InvalidLinksFoundTitle"),
    onSubmit: () => deleteInvalidLinks(warning.data, callback, customInterface),
    invalidLinks: warning.data,
    Component: InvalidLinksWarning,
  }), [t, deleteInvalidLinks]);

  /**
   * On Exposed ports validation
   * @param {{invalidExposedPorts: Array, callback: Function}} eventData
   */
  const invalidExposedPortsAlert = useCallback(warning => dialog({
    submitText: t("Fix"),
    title: t("InvalidExposedPortsFound"),
    onSubmit: () => deleteInvalidExposedPorts(warning.data),
    invalidExposedPorts: warning.data,
    Component: InvalidExposedPortsWarning,
  }), [t, deleteInvalidExposedPorts]);

  /**
   * @private Show alert dialog for containers with invalid parameters
   * @param {*} invalidContainersParam
   */
  const invalidContainersParamAlert = useCallback(warning => warning.data.length ? dialog({
    title: t("InvalidContainersParamTitle"),
    invalidContainerParams: warning.data,
    Component: InvalidParametersWarning,
  }) : null, [t]);

  /**
   * Open Dialog to Enter Paste Node name
   * @param {*} position : x and y position in canvas
   * @param {*} nodeToCopy : Node data
   * @returns {Promise} Resolved only after submit or cancel dialog
   */
  const pasteNodeDialog = useCallback((position, nodeToCopy) => dialog({
    form: {
      name: {
        label: "Name",
        placeholder: nodeToCopy.node.name,
        defaultValue: `${nodeToCopy.node.id}_copy`,
      }
    },
    title: t("PasteNodeModel", { nodeModel: nodeToCopy.node.model }),
    onClose: setFlowsToDefault,
    onValidation: ({ name }) => ({
      name: mainInterface.graph.validator.validateNodeName(
        name,
        t(nodeToCopy.node.model)
      ),
    }),
    onSubmit: ({ name }) => mainInterface.pasteNode(name, nodeToCopy.node, position)
  }), [setFlowsToDefault, mainInterface, t]);

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
      Flow: ContainerMenu
    };
    return model in componentByModel ? componentByModel[model] : null;
  }, []);

  /**
   * Get node menu if any
   */
  const getNodeMenuToAdd = useCallback(
    node => {
      const MenuComponent = getMenuComponent(node?.data?.model);
      if (!node || !MenuComponent) return;
      return {
        icon: <i className="icon-Nodes" />,
        name: MENUS.current.NODE.NAME,
        title: t(MENUS.current.NODE.TITLE),
        view: (
          <MenuComponent
            id={id}
            call={call}
            nodeInst={node}
            flowModel={instance}
            openDoc={openDoc}
            editable={true}
          />
        )
      };
    },
    [MENUS, id, instance, openDoc, getMenuComponent, t]
  );

  /**
   * Add node menu if any
   */
  const addNodeMenu = useCallback((node, nodeSelection) => {
    const MenuComponent = getMenuComponent(node?.data?.model);

    if (node && MenuComponent) return call(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.CALL.ADD_BOOKMARK,
      getNodeMenuToAdd(node),
      activeBookmark,
      nodeSelection,
      true
    );
  }, [getMenuComponent, getNodeMenuToAdd]);

  /**
   * Get link right menu if any
   * @param {Link} link : Link to be rendered in menu
   */
  const getLinkMenuToAdd = useCallback(
    link => {
      if (!link) return;
      return {
        icon: <CompareArrowsIcon />,
        name: MENUS.current.LINK.NAME,
        title: t(MENUS.current.LINK.TITLE),
        view: (
          <LinkMenu
            id={id}
            call={call}
            link={link}
            flowModel={instance}
            sourceMessage={link?.src?.data?.message}
          />
        )
      };
    },
    [MENUS, id, instance, t]
  );

  /**
   * Add link right menu if any
   * @param {Link} link : Link to be rendered in menu
   */
  const addLinkMenu = useCallback((link, linkSelection) => {
    if (link) return call(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.CALL.ADD_BOOKMARK,
      getLinkMenuToAdd(link),
      activeBookmark,
      linkSelection,
      true
    );
  }, [getLinkMenuToAdd]);

  const renderRightMenu = useCallback(() => {
    const details = props.data?.details || {};
    const bookmarks = {
      [MENUS.current.DETAIL.NAME]: {
        icon: <InfoIcon></InfoIcon>,
        name: MENUS.current.DETAIL.NAME,
        title: t(MENUS.current.DETAIL.TITLE),
        view: (
          <Menu
            id={id}
            call={call}
            name={name}
            details={details}
            model={instance}
            editable={true}
          ></Menu>
        )
      }
    };

    if (isEditableComponentRef.current) {
      const explorerView = new Explorer(FLOW_EXPLORER_PROFILE);

      bookmarks[FLOW_EXPLORER_PROFILE.name] = {
        icon: <Add />,
        name: FLOW_EXPLORER_PROFILE.name,
        title: t(FLOW_EXPLORER_PROFILE.title),
        view: explorerView.render({
          flowId: id,
          mainInterface: mainInterface
        })
      };
    }

    // Add node menu if any is selected
    if (selectedNodeRef.current) {
      bookmarks[MENUS.current.NODE.NAME] = getNodeMenuToAdd(
        selectedNodeRef.current
      );
    }

    // Add link menu if any is selected
    if (selectedLinkRef.current) {
      bookmarks[MENUS.current.LINK.NAME] = getLinkMenuToAdd(
        selectedLinkRef.current
      );
    }

    // add bookmark
    return call(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK,
      bookmarks,
      activeBookmark
    );
  }, [
    id,
    name,
    mainInterface,
    instance,
    props.data,
    getNodeMenuToAdd,
    getLinkMenuToAdd,
    t
  ]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  function hasNodesToStart() {
    for (const entry of instance.current.links.data)
      if (entry[1].from === "start/start/start") return true;

    return false;
  }

  /**
   * On view mode change
   * @param {string} newViewMode : One of the following "default" or "treeView"
   */
  const onViewModeChange = useCallback(newViewMode => {
    if (!newViewMode || viewMode === newViewMode) return;
    isEditableComponentRef.current = newViewMode === FLOW_VIEW_MODE.default;
    mainInterface.setViewMode(newViewMode);
  }, [mainInterface, viewMode]);

  /**
   * Toggle Warnings
   */
  const onToggleWarnings = useCallback(() => {
    setWarningsVisibility(prevState => {
      const newVisibility = !prevState;
      mainInterface?.onToggleWarnings({ data: newVisibility });
      return newVisibility;
    });
  }, [mainInterface]);

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
      MENUS.current.DETAIL.NAME
    );
    selectedNodeRef.current = null;
  }, [MENUS, selectedNodeRef]);

  /**
   * On Node Selected
   * @param {*} node
   */
  const onNodeSelected = useCallback(
    node => {
      if (!mainInterface)
        return;
      contextArgs.current = node;
      if (!node) {
        unselectNode();
      } else {
        // We only want 1 selection at the time.
        // So let's unselect links if any is selected
        if (selectedLinkRef.current) onLinkSelected(null);

        selectedNodeRef.current = node;
        activeBookmark = MENUS.current.NODE.NAME;
        addNodeMenu(node, true);
      }
    },
    [MENUS, addNodeMenu, unselectNode, mainInterface]
  );

  /**
   * On Link selected
   * @param {BaseLink} link : Link instance
   */
  const onLinkSelected = useCallback(
    link => {
      if (!mainInterface)
        return;
      activateEditor();
      selectedLinkRef.current = link;
      mainInterface.selectedLink = link;
      if (!link) {
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.REMOVE_BOOKMARK,
          MENUS.current.LINK.NAME,
          activeBookmark
        );
      } else {
        const currentMode = mainInterface.mode.mode;
        // We only want 1 selection at the time.
        // So let's unselect nodes if any is selected
        if (
          currentMode.id === EVT_NAMES.SELECT_NODE &&
          currentMode.props.shiftKey
        ) {
          // If we're making multiple node selection we need to reset the mode
          mainInterface.setMode(EVT_NAMES.DEFAULT);
          // Since we resetted the mode, we need to add back the selected link
          mainInterface.selectedLink = link;
        } else if (selectedNodeRef.current) {
          // If we just selected 1 node, it's ok, let's just unselect it
          selectedNodeRef.current.selected = false;
        }

        // Remove node menu
        unselectNode();

        activeBookmark = MENUS.current.LINK.NAME;
        addLinkMenu(link, true);
      }
    },
    [MENUS, activeEditor, unselectNode, addLinkMenu]
  );

  /**
   * Close context menu
   */
  const handleContextClose = useCallback(() => {
    contextArgs.current = null;
    setContextMenuOptions(null);
    mainInterface.setMode(EVT_NAMES.DEFAULT);
  }, [mainInterface]);

  /**
   * Call broadcast method to emit event to all open flows
   */
  const setFlowsToDefault = useCallback(() => {
    activateEditor();
    // Remove selected node and link bookmark
    onNodeSelected(null);
    onLinkSelected(null);
    // Update render of right menu
    // broadcast event to other flows
    return call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.BROADCAST,
      PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR,
      { action: "setMode", value: EVT_NAMES.DEFAULT }
    );
  }, [activeEditor, onLinkSelected, onNodeSelected]);

  /**
   * Subscribe to mainInterface and canvas events
   */
  const onReady = useCallback(
    mainInterface => {
      mainInterfaceRef.current = mainInterface;

      // If we are running this function again,
      // we should do some cleanup before continue
      interfaceSubscriptionsList.current.forEach(sub => {
        sub.unsubscribe();
      });
      interfaceSubscriptionsList.current = [];

      // Set the warning types to be used in the validations
      mainInterface.graph.validator.setWarningActions(
        WARNING_TYPES.INVALID_EXPOSED_PORTS,
        invalidExposedPortsAlert
      );
      mainInterface.graph.validator.setWarningActions(
        WARNING_TYPES.INVALID_LINKS,
        invalidLinksAlert
      );
      mainInterface.graph.validator.setWarningActions(
        WARNING_TYPES.INVALID_PARAMETERS,
        invalidContainersParamAlert
      );

      // Subscribe to flow validations
      mainInterface.graph.onFlowValidated.subscribe(evtData => {
        const persistentWarns = evtData.warnings.filter(
          el => el.isPersistent
        );

        setWarnings(persistentWarns);
      }),

      mainInterface.onLoad = () => setLoading(false);

      // subscribe to on enter default mode
      // When enter default mode remove other node/sub-flow bookmarks
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.DEFAULT].onEnter.subscribe(() => {
          setFlowsToDefault();
        })
      ),

      // Subscribe to on node select event
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.SELECT_NODE].onEnter.subscribe(() => {
          const selectedNodes = mainInterface.selectedNodes;
          const node = selectedNodes.length !== 1 ? null : selectedNodes[0];
          onNodeSelected(node);
        })
      );

      // Subscribe to double click event in a node
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_DBL_CLICK].onEnter.subscribe(
          evtData => {
            const node = evtData.node;
            openDoc({
              name: node.templateName,
              scope: node.data.model
            });
          }
        )
      );

      // Subscribe to node instance/sub flow context menu events
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_NODE_CTX_MENU].onEnter.subscribe(
          evtData => {
            const node = evtData.node;
            const anchorPosition = {
              left: evtData.event.clientX,
              top: evtData.event.clientY
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
                      : runningFlow && !node.status)
                  },
                  stopNode: {
                    func: stopNode,
                    disabled: !(node.data.type === TYPES.CONTAINER
                      ? false
                      : runningFlow && node.status)
                  }
                },
                viewMode
              })
            });
          }
        )
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ADD_NODE].onClick.subscribe(() => {
          const nodeName = getMainInterface().mode.current.props.node.data.name;
          // Open form dialog
          dialog({
            title: t("AddNode"),
            submitText: t("Add"),
            value: nodeName,
            onValidation: ({ name }) =>
              getMainInterface().graph.validator.validateNodeName(
                name,
                t("Node")
              ),
            onClose: setFlowsToDefault,
            onSubmit: ({ name }) => getMainInterface().addNode(name)
          });
        })
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ADD_FLOW].onClick.subscribe(() => {
          const flowName = getMainInterface().mode.current.props.node.data.name;
          // Open form dialog
          dialog({
            title: t("AddSubFlow"),
            submitText: t("Add"),
            value: flowName,
            onValidation: ({ name }) =>
              getMainInterface().graph.validator.validateNodeName(
                name,
                t("SubFlow")
              ),
            onClose: setFlowsToDefault,
            onSubmit: ({ name }) => getMainInterface().addFlow(name)
          });
        })
      );

      // Subscribe to link context menu events
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_LINK_CTX_MENU].onEnter.subscribe(
          evtData => {
            const anchorPosition = {
              left: evtData.event.clientX,
              top: evtData.event.clientY
            };

            contextArgs.current = evtData;
            setContextMenuOptions({
              anchorPosition,
              options: getContextOptions(FLOW_CONTEXT_MODES.LINK, evtData, {
                handleDeleteLink,
                viewMode
              })
            });
          }
        )
      );

      // Subscribe to canvas context menu
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_CANVAS_CTX_MENU].onEnter.subscribe(
          evtData => {
            const anchorPosition = {
              left: evtData.event.clientX,
              top: evtData.event.clientY
            };

            contextArgs.current = evtData.position;
            setContextMenuOptions({
              anchorPosition,
              options: getContextOptions(
                FLOW_CONTEXT_MODES.CANVAS,
                evtData.position,
                {
                  handlePasteNodes,
                  viewMode
                }
              )
            });
          }
        )
      );

      // subscribe to port context menu event
      interfaceSubscriptionsList.current.push(
        mainInterface.mode[EVT_NAMES.ON_PORT_CTX_MENU].onEnter.subscribe(
          evtData => {
            const anchorPosition = {
              left: evtData.event.clientX,
              top: evtData.event.clientY
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
                  viewMode
                }
              )
            });
          }
        )
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              event =>
                event.name === EVT_NAMES.ON_MOUSE_OVER &&
                event.type === EVT_TYPES.LINK
            )
          )
          .subscribe(evtData => mainInterface.graph.onMouseOverLink(evtData))
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              event =>
                event.name === EVT_NAMES.ON_MOUSE_OUT &&
                event.type === EVT_TYPES.LINK
            )
          )
          .subscribe(evtData => mainInterface.graph.onMouseOutLink(evtData))
      );

      // Select Link event
      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              event =>
                event.name === EVT_NAMES.ON_CLICK &&
                event.type === EVT_TYPES.LINK
            )
          )
          .subscribe(event => onLinkSelected(event.data))
      );

      // subscribe to port mouseOver event
      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              event =>
                event.name === EVT_NAMES.ON_MOUSE_OVER &&
                event.type === EVT_TYPES.PORT
            )
          )
          .subscribe(evtData => {
            const { port, event } = evtData;
            const anchorPosition = {
              left: event.layerX + 8,
              top: event.layerY
            };
            setTooltipConfig({
              port,
              anchorPosition
            });
          })
      );

      // subscribe to port mouseOut event
      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              event =>
                event.name === EVT_NAMES.ON_MOUSE_OUT &&
                event.type === EVT_TYPES.PORT
            )
          )
          .subscribe(() => {
            setTooltipConfig(null);
          })
      );

      interfaceSubscriptionsList.current.push(
        mainInterface.canvas.events
          .pipe(
            filter(
              event =>
                event.name === EVT_NAMES.ON_CHG_MOUSE_OVER &&
                event.type === EVT_TYPES.LINK
            )
          )
          .subscribe(evtData => console.log("onLinkErrorMouseOver", evtData))
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
      startNode,
      stopNode,
      t,
      handleDeleteLink,
      handlePasteNodes,
      handleToggleExposedPort,
      handleOpenCallback,
      onLinkSelected
    ]
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
    e => {
      workspaceManager.setFlowIsDebugging(e.target.checked);
      setFlowDebugging(e.target.checked);
      activateKeyBind();
    },
    [activateKeyBind, workspaceManager]
  );

  /**
   * Handle Delete : Show confirmation dialog before performing delete action
   * @param {{nodeId: string, callback: function}} data
   */
  const handleDelete = useCallback(
    ({ message, callback }) => {
      confirmationAlert({
        submitText: t("Delete"),
        title: t("ConfirmDelete"),
        onSubmit: callback,
        onClose: setFlowsToDefault,
        message
      });
    },
    [confirmationAlert, t, setFlowsToDefault]
  );

  /**
   * Handle copy node
   */
  const handleCopyNode = useCallback(
    evt => {
      evt?.preventDefault?.();
      const selectedNodes = getSelectedNodes();
      const nodesPos = selectedNodes.map(n =>
        Vec2.of(n.center.xCenter, n.center.yCenter)
      );
      let center = nodesPos.reduce((e, x) => e.add(x), Vec2.ZERO);
      center = center.scale(1 / selectedNodes.length);
      // Nodes to copy
      const nodesToCopy = {
        nodes: selectedNodes.map(n => n.data),
        flow: data.id,
        nodesPosFromCenter: nodesPos.map(pos => pos.sub(center))
      };
      // Write nodes to copy to clipboard
      clipboard.write(KEYS.NODES_TO_COPY, nodesToCopy);
    },
    [clipboard, getSelectedNodes, data.id]
  );

  /**
   * Handle paste nodes in canvas
   */
  const handlePasteNodes = useCallback(
    evt => {
      evt?.preventDefault?.();
      const position = (contextArgs.current =
        mainInterface.canvas.mousePosition);
      const nodesToCopy = clipboard.read(KEYS.NODES_TO_COPY);
      if (!nodesToCopy) return;

      for (const [i, node] of nodesToCopy.nodes.entries()) {
        const nodesPosFromCenter = nodesToCopy.nodesPosFromCenter || [
          Vec2.ZERO
        ];
        const newPos = Vec2.of(position.x, position.y).add(
          nodesPosFromCenter[i]
        );
        // Open dialog for each node to copy
        pasteNodeDialog(newPos.toObject(), {
          node: node,
          flow: nodesToCopy.flow
        });
      }
    },
    [clipboard, pasteNodeDialog]
  );

  /**
   * Handle delete node
   */
  const handleDeleteNode = useCallback(() => {
    const selectedNodes = getSelectedNodes();
    if (!selectedNodes.length) return;
    // Callback to delete all nodes
    const callback = () => {
      selectedNodes.forEach(node => {
        mainInterface.deleteNode(node.data);
      });
      unselectNode();
    };
    // Compose confirmation message
    const message = t("NodeDeleteConfirmation", {
      nodes: selectedNodes.length === 1 ? selectedNodes[0].data.id : t("TheSelectedNodes"),
    });
    // Show confirmation before delete
    handleDelete({ message, callback });
  }, [handleDelete, unselectNode, getSelectedNodes, t]);

  /**
   * Handle delete link
   */
  const handleDeleteLink = useCallback(() => {
    const link = selectedLinkRef.current ?? contextArgs.current;
    link.id && mainInterface.deleteLink(link.id);
  }, [mainInterface]);

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
    mainInterface.toggleExposedPort(port);
  }, [mainInterface]);

  /**
   * Open Callback
   * @param {string} callbackName : Callback name
   */
  const handleOpenCallback = useCallback(
    callbackName => {
      // If no callback name is passed -> returns
      if (!callbackName) return;
      // Open existing callback
      const scope = CallbackModel.SCOPE;
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
        scope,
        name: callbackName
      }).then(doc => {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: doc.getUrl(),
          name: doc.getName(),
          scope
        });
      });
    },
    []
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
  const handleMoveNode = useCallback(e => {
    mainInterface?.onMoveNode(e);
  }, [mainInterface]);

  /*
   * Handle search nodes
   */
  const handleSearchNode = useCallback(node => {
    const mainInterface = getMainInterface();
    const nodeInstance = node && mainInterface.searchNode(node);
    if (!nodeInstance) return;
    nodeInstance.handleSelectionChange();
    mainInterface.onFocusNode(nodeInstance);
  }, []);

  const handleSearchEnabled = useCallback(
    e => {
      e?.preventDefault();
      if (!searchVisible) setSearchVisible(true);
    },
    [searchVisible]
  );

  const handleSearchEnable = useCallback(e => {
    e?.preventDefault();
    setSearchVisible(true);
  }, []);

  const handleSearchDisabled = useCallback(() => {
    setSearchVisible(false);
    activateKeyBind();
  }, [activateKeyBind]);

  const getContextOptions = useCallback(
    (mode, data, args) => {
      const baseContextOptions = getBaseContextOptions(mode, data, args);
      const contextOpts = contextOptions?.(baseContextOptions)?.[mode]?.(data);

      return contextOpts ?? baseContextOptions;
    },
    [contextOptions, viewMode]
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
    setFlowDebugging(workspaceManager.getFlowIsDebugging());

    return subscribeAll([[
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.ON.CHANGE_BOOKMARK,
      bookmark => {
        activeBookmark = bookmark.name;
      }
    ], [
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR,
      evt => {
        // evt ex.: {action: "setMode", value: EVT_NAMES.DEFAULT}
        const { action, value } = evt;
        mainInterface?.[action](value);
      }
    ]]);
  }, [workspaceManager, mainInterface]);

  /**
   * Initialize data
   */
  useEffect(() => {
    const model = instance.current;

    if (model) {
      setDataFromDB(model.serializeToDB());
    }
  }, [instance, data]);

  useEffect(() => subscribe(
    PLUGINS.DOC_MANAGER.NAME,
    PLUGINS.DOC_MANAGER.ON.BEFORE_SAVE_DOC,
    docData => {
      if (!mainInterface)
        return;

      if (viewMode !== FLOW_VIEW_MODE.treeView || docData.doc.name !== name)
        return;

      if (!docData.thisDoc.isDirty)
        call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
          message: t(SUCCESS_MESSAGES.SAVED_SUCCESSFULLY),
          severity: ALERT_SEVERITIES.SUCCESS
        });

      mainInterface.graph.subFlows.forEach(subFlow => call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.SAVE,
        {
          scope,
          name: subFlow.templateName
        },
        null,
        // {{ignoreNew: true}} Because we don't want to show the new doc popup on missing subflows
        // {{preventAlert: true}} Because independently of how many saves we do we just to want to show the snackbar once
        { ignoreNew: true, preventAlert: true }
      ));
    }
  ), [name, scope, viewMode, t, mainInterface]);

  useEffect(() => {
    addKeyBind(
      KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_PREVENT_SEARCH.SHORTCUTS,
      evt => {
        evt.preventDefault();
      },
      KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_PREVENT_SEARCH.SCOPE
    );
    addKeyBind(
      KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_CLOSE.SHORTCUTS,
      evt => {
        evt.preventDefault();
        handleSearchDisabled();
      },
      KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_CLOSE.SCOPE
    );
    addKeyBind(KEYBINDINGS.FLOW.KEYBINDS.COPY_NODE.SHORTCUTS, handleCopyNode);
    addKeyBind(
      KEYBINDINGS.FLOW.KEYBINDS.PASTE_NODE.SHORTCUTS,
      handlePasteNodes
    );
    addKeyBind(KEYBINDINGS.FLOW.KEYBINDS.MOVE_NODE.SHORTCUTS, handleMoveNode);
    addKeyBind(
      KEYBINDINGS.FLOW.KEYBINDS.SEARCH_NODE.SHORTCUTS,
      handleSearchEnable
    );
    addKeyBind(KEYBINDINGS.FLOW.KEYBINDS.RESET_ZOOM.SHORTCUTS, handleResetZoom);
    addKeyBind(
      KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.CANCEL.SHORTCUTS,
      setFlowsToDefault
    );
    addKeyBind(
      KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.DELETE.SHORTCUTS,
      handleShortcutDelete
    );
    // remove keyBind on unmount
    return () => {
      removeKeyBind(
        KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_PREVENT_SEARCH.SHORTCUTS
      );
      removeKeyBind(KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_CLOSE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.COPY_NODE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.PASTE_NODE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.MOVE_NODE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.SEARCH_NODE.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.FLOW.KEYBINDS.RESET_ZOOM.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.CANCEL.SHORTCUTS);
      removeKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.DELETE.SHORTCUTS);
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
    handleSearchDisabled
  ]);

  useEffect(() => {
    if (searchVisible) {
      return activateKeyBind(
        KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_PREVENT_SEARCH.SCOPE
      );
    }
    activateKeyBind();
  }, [searchVisible, activateKeyBind]);

  const onStartStopFlow = useCallback((flow) => {
    setRunningFlow(flow);
    mainInterface?.nodeStatusUpdated({}); 
  }, [setRunningFlow, mainInterface]);

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
          loading={mainInterface ? mainInterface.loading : true}
          viewMode={viewMode}
          version={instance.current?.version}
          canRun={hasNodesToStart()}
          onStartStopFlow={setRunningFlow}
          onViewModeChange={onViewModeChange}
          searchProps={{
            visible: searchVisible,
            options: getSearchOptions(),
            onChange: handleSearchNode,
            onEnabled: handleSearchEnabled,
            onDisabled: handleSearchDisabled
          }}
        ></FlowTopBar>
      </div>
      <BaseFlow
        {...props}
        graphClass={baseFlowClass}
        loading={mainInterface ? mainInterface.loading : true}
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
      {tooltipConfig && <PortTooltip {...tooltipConfig} />}
    </div>
  );
};

Flow.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  data: PropTypes.object,
  instance: PropTypes.object,
  editable: PropTypes.bool,
  alert: PropTypes.func,
  addKeyBind: PropTypes.func,
  removeKeyBind: PropTypes.func,
  confirmationAlert: PropTypes.func,
  saveDocument: PropTypes.func
};

export default withEditorPlugin(Flow);
