import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { filter } from "rxjs/operators";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from "@material-ui/icons/Info";
import Add from "@material-ui/icons/Add";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import { FLOW_EXPLORER_PROFILE, PLUGINS } from "../../../../utils/Constants";
import BaseFlow from "./Views/BaseFlow";
import Menu from "./Components/Menus/Menu";
import NodeMenu from "./Components/Menus/NodeMenu";
import FlowTopBar from "./Components/FlowTopBar/FlowTopBar";
import FlowBottomBar from "./Components/FlowBottomBar/FlowBottomBar";
import FlowContextMenu from "./Components/Menus/ContextMenu/FlowContextMenu";
import { MODE as FLOW_CONTEXT_MODE } from "./Components/Menus/ContextMenu";
import ContainerMenu from "./Components/Menus/ContainerMenu";
import Explorer from "./Components/Explorer/Explorer";
import LinkMenu from "./Components/Menus/LinkMenu";
import PortTooltip from "./Components/Tooltips/PortTooltip";
import { EVT_NAMES, EVT_TYPES } from "./events";
import { FLOW_VIEW_MODE } from "./Constants/constants";

import "./Resources/css/Flow.css";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: "100%",
    flexGrow: 1
  }
}));

const Flow = (props, ref) => {
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
    on
  } = props;
  // State Hooks
  const [dataFromDB, setDataFromDB] = useState();
  const [robotSelected, setRobotSelected] = useState("");
  const [runningFlow, setRunningFlow] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [warningsVisibility, setWarningsVisibility] = useState(true);
  const [viewMode, setViewMode] = useState(FLOW_VIEW_MODE.default);
  const [contextMenuOptions, setContextMenuOptions] = useState({
    open: false,
    position: { x: 0, y: 0 }
  });

  const [tooltipConfig, setTooltipConfig] = useState(null);

  // Other Hooks
  const classes = useStyles();
  const { t } = useTranslation();
  // Refs
  const baseFlowRef = React.useRef();
  const mainInterfaceRef = React.useRef();
  const debounceSelection = React.useRef();
  const activeBookmark = React.useRef();
  const selectedNodeRef = React.useRef();
  const selectedLinkRef = React.useRef();
  const isEditableComponentRef = React.useRef(true);
  // Global consts
  const NODE_MENU_NAME = `node-menu`;
  const LINK_MENU_NAME = `link-menu`;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Used to handle group visibility
   */
  const handleGroupVisibility = useCallback((groupId, visibility) => {
    getMainInterface().onGroupChange(groupId, visibility);
  }, []);

  /**
   * Handle group visibilities
   */
  const groupsVisibilities = useCallback(() => {
    getMainInterface().onGroupsChange(instance.current.getGroups()?.data);
  }, [instance]);

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
      bookmark => {
        activeBookmark.current = bookmark.name;
      }
    );

    // Subscribe to docManager broadcast for flowEditor (global events)
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR, evt => {
      // evt ex.: {action: "setMode", value: "default"}
      const { action, value } = evt;
      getMainInterface()?.[action](value);
    });
  }, [on]);

  /**
   * Initialize data
   */
  useEffect(() => {
    const model = instance.current;

    if (model) {
      setDataFromDB(model.serializeToDB());
    }
  }, [instance, data]);

  /**
   * Initialize main interface
   */
  useEffect(() => {
    mainInterfaceRef.current = baseFlowRef.current?.mainInterface;
  }, [baseFlowRef.current?.mainInterface]);

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get main interface instance
   */
  const getMainInterface = () => {
    return mainInterfaceRef.current?.current;
  };

  /**
   * Set mode
   * @param {string} mode : Interface mode
   */
  const setMode = useCallback(mode => {
    getMainInterface().setMode(mode);
  }, []);

  /**
   * Open document in new tab
   * @param {*} docData
   */
  const openDoc = useCallback(
    docData => {
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
        scope: docData.scope,
        name: docData.name
      }).then(doc => {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: doc.getUrl(),
          name: doc.getName(),
          scope: doc.getScope()
        });
      });
    },
    [call]
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
        name: NODE_MENU_NAME,
        view: (
          <MenuComponent
            id={id}
            call={call}
            nodeInst={node}
            flowModel={instance}
            openDoc={openDoc}
            editable={isEditableComponentRef.current}
            groupsVisibilities={groupsVisibilities}
          />
        )
      };
    },
    [
      NODE_MENU_NAME,
      call,
      id,
      instance,
      openDoc,
      getMenuComponent,
      groupsVisibilities
    ]
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
        nodeSelection,
        activeBookmark.current
      );
    },
    [call, getMenuComponent, getNodeMenuToAdd]
  );

  /**
   * Get link right menu if any
   * @param {Link} link : Link to be rendered in menu
   */
  const getLinkMenuToAdd = useCallback(
    link => {
      if (!link) return;
      return {
        icon: <CompareArrowsIcon />,
        name: LINK_MENU_NAME,
        view: (
          <LinkMenu
            id={id}
            call={call}
            link={link.data}
            flowModel={instance}
            sourceMessage={link?.src?.data?.message}
          />
        )
      };
    },
    [LINK_MENU_NAME, call, id, instance]
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
        linkSelection,
        activeBookmark.current
      );
    },
    [call, getLinkMenuToAdd]
  );

  const renderRightMenu = useCallback(() => {
    const explorerView = new Explorer(FLOW_EXPLORER_PROFILE);
    const details = props.data?.details || {};
    const menuName = `detail-menu`;
    const bookmarks = {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: (
          <Menu
            id={id}
            call={call}
            name={name}
            details={details}
            model={instance}
            handleGroupVisibility={handleGroupVisibility}
            editable={isEditableComponentRef.current}
          ></Menu>
        )
      },
      FlowExplorer: {
        icon: <Add />,
        name: FLOW_EXPLORER_PROFILE.name,
        view: explorerView.render({ flowId: id })
      }
    };

    // Add node menu if any is selected
    if (selectedNodeRef.current) {
      bookmarks[NODE_MENU_NAME] = getNodeMenuToAdd(selectedNodeRef.current);
    }

    // Add link menu if any is selected
    if (selectedLinkRef.current) {
      bookmarks[LINK_MENU_NAME] = getLinkMenuToAdd(selectedLinkRef.current);
    }

    // add bookmark
    call(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK,
      bookmarks,
      activeBookmark.current
    );
  }, [
    LINK_MENU_NAME,
    NODE_MENU_NAME,
    call,
    id,
    name,
    instance,
    props.data,
    getNodeMenuToAdd,
    getLinkMenuToAdd,
    handleGroupVisibility
  ]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On Robot selection change
   * @param {*} robotId
   */
  const onRobotChange = useCallback(robotId => {
    setRobotSelected(robotId);
  }, []);

  /**
   * On change running flow
   * @param {*} flow
   */
  const onStartStopFlow = useCallback(flow => {
    // Update state variable
    setRunningFlow(prevState => {
      if (prevState === flow) return prevState;
      return flow;
    });
  }, []);

  /**
   * On view mode change
   * @param {string} newViewMode : One of the following "default" or "treeView"
   */
  const onViewModeChange = useCallback(
    newViewMode => {
      setViewMode(prevState => {
        if (prevState === newViewMode) return prevState;
        isEditableComponentRef.current = newViewMode === FLOW_VIEW_MODE.default;
        // Set mode loading after changing view mode
        setMode(EVT_NAMES.LOADING);
        return newViewMode;
      });
    },
    [setMode]
  );

  /**
   * Toggle Warnings
   * @param {boolean} isVisible
   */
  const onToggleWarnings = useCallback(isVisible => {
    getMainInterface()?.onToggleWarnings({ data: isVisible });
    setWarningsVisibility(isVisible);
  }, []);

  /**
   * Update node active status
   * @param {object} nodeStatus : Nodes to update status
   * @param {{activeFlow: string, isOnline: boolean}} robotStatus : Robot current status
   */
  const onNodeStatusUpdate = useCallback((nodeStatus, robotStatus) => {
    getMainInterface()?.nodeStatusUpdated(nodeStatus, robotStatus);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                  Handle Flow Events                                  *
   *                                                                                      */
  //========================================================================================

  /**
   * On flow validation
   * @param {*} validationWarnings
   */
  const onFlowValidated = useCallback(validationWarnings => {
    const persistentWarns = validationWarnings.warnings.filter(
      el => el.isPersistent
    );
    setWarnings(persistentWarns);
  }, []);

  /**
   * On Node Selected
   * @param {*} node
   */
  const onNodeSelected = useCallback(
    node => {
      clearTimeout(debounceSelection.current);
      debounceSelection.current = setTimeout(() => {
        if (!node) {
          call(
            PLUGINS.RIGHT_DRAWER.NAME,
            PLUGINS.RIGHT_DRAWER.CALL.REMOVE_BOOKMARK,
            NODE_MENU_NAME,
            activeBookmark.current
          );
          selectedNodeRef.current = null;
        } else {
          selectedNodeRef.current = node;
          activeBookmark.current = NODE_MENU_NAME;
          addNodeMenu(node, true);
        }
      }, 300);
    },
    [addNodeMenu, call, NODE_MENU_NAME]
  );

  /**
   * On Link selected
   * @param {BaseLink} link : Link instance
   */
  const onLinkSelected = useCallback(
    link => {
      selectedLinkRef.current = link;
      getMainInterface().selectedLink = link;
      if (!link) {
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.REMOVE_BOOKMARK,
          LINK_MENU_NAME,
          activeBookmark.current
        );
      } else {
        activeBookmark.current = LINK_MENU_NAME;
        addLinkMenu(link, true);
      }
    },
    [call, LINK_MENU_NAME, addLinkMenu]
  );

  const handleContextClose = useCallback(() => {
    setContextMenuOptions(null);
    getMainInterface().setMode(EVT_NAMES.DEFAULT);
  }, []);

  /**
   * Subscribe to mainInterface and canvas events
   */
  const onReady = useCallback(
    mainInterface => {
      // subscribe to on enter default mode
      mainInterface.mode.default.onEnter.subscribe(() => {
        call(
          PLUGINS.DOC_MANAGER.NAME,
          PLUGINS.DOC_MANAGER.CALL.BROADCAST,
          PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR,
          { action: "setMode", value: EVT_NAMES.DEFAULT }
        );
      });

      // Subscribe to on node select event
      mainInterface.mode.selectNode.onEnter.subscribe(() => {
        const selectedNodes = mainInterface.selectedNodes;
        const node = selectedNodes.length !== 1 ? null : selectedNodes[0];
        onNodeSelected(node);
      });

      // Subscribe to flow validations
      mainInterface.graph.onFlowValidated.subscribe(evtData => {
        const persistentWarns = evtData.warnings.filter(el => el.isPersistent);
        groupsVisibilities();
        onFlowValidated({ warnings: persistentWarns });
      });

      // When enter default mode remove other node/sub-flow bookmarks
      mainInterface.mode.default.onEnter.subscribe(() => {
        onNodeSelected(null);
        onLinkSelected(null);
      });

      // Subscribe to double click event in a node
      mainInterface.mode.onDblClick.onEnter.subscribe(evtData => {
        const node = evtData.node;
        openDoc({
          name: node.templateName,
          scope: node.data.model
        });
      });

      // Subscribe to node instance/sub flow context menu events
      mainInterface.mode.nodeCtxMenu.onEnter.subscribe(evtData => {
        const anchorPosition = {
          left: evtData.event.clientX,
          top: evtData.event.clientY
        };
        setContextMenuOptions({
          args: evtData.node,
          mode: evtData.node?.data?.type,
          anchorPosition,
          onClose: handleContextClose
        });
      });

      mainInterface.mode.addNode.onClick.subscribe(() => {
        call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.NEW_DOC, {
          scope: "node",
          // TODO add validation here ROS regex and exists?
          onSubmit: newName => getMainInterface().addNode(newName)
        });
      });

      mainInterface.mode.addFlow.onClick.subscribe(() => {
        call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.NEW_DOC, {
          scope: "sub-flow",
          // TODO add validation here ROS regex and exists?
          onSubmit: newName => getMainInterface().addFlow(newName)
        });
      });

      // Subscribe to link context menu events
      mainInterface.mode.linkCtxMenu.onEnter.subscribe(evtData => {
        const anchorPosition = {
          left: evtData.event.clientX,
          top: evtData.event.clientY
        };
        setContextMenuOptions({
          args: evtData,
          mode: FLOW_CONTEXT_MODE.LINK,
          anchorPosition,
          onClose: handleContextClose
        });
      });

      // Subscribe to add link event
      mainInterface.events.onAddLink.subscribe(evtData =>
        alert({
          location: "snackbar",
          message: "Link created"
        })
      );

      mainInterface.mode.canvasCtxMenu.onEnter.subscribe(evtData => {
        console.log("onCanvasCtxMenu", evtData);
        mainInterface.setMode(EVT_NAMES.DEFAULT);
      });

      // subscribe to port context menu event
      mainInterface.mode.portCtxMenu.onEnter.subscribe(evtData => {
        const anchorPosition = {
          left: evtData.event.clientX,
          top: evtData.event.clientY
        };
        setContextMenuOptions({
          args: evtData.port,
          mode: FLOW_CONTEXT_MODE.PORT,
          anchorPosition,
          onClose: handleContextClose
        });
      });

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OVER &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => mainInterface.graph.onMouseOverLink(evtData));

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OUT &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => mainInterface.graph.onMouseOutLink(evtData));

      // Select Link event
      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_CLICK && event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(event => onLinkSelected(event.data));

      // subscribe to port mouseOver event
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
        });

      // subscribe to port mouseOut event
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
        });

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_CHG_MOUSE_OVER &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => console.log("onLinkErrorMouseOver", evtData));
    },
    [
      call,
      alert,
      groupsVisibilities,
      onNodeSelected,
      onFlowValidated,
      onLinkSelected,
      handleContextClose,
      openDoc
    ]
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const handleDelete = useCallback(
    ({ nodeId, callback }) => {
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
        submitText: t("Delete"),
        title: t("Confirm to delete"),
        onSubmit: callback,
        message: `Are you sure you want to delete "${nodeId}"?`
      });
    },
    [t, call]
  );

  const handleDeleteNode = useCallback(() => {
    const { args: node } = contextMenuOptions;
    const callback = () => getMainInterface().deleteNodeInst(node.data.id);

    handleDelete({ nodeId: node.data.id, callback });
    setContextMenuOptions(prevValue => ({ ...prevValue, anchorEl: null }));
  }, [handleDelete, contextMenuOptions]);

  const handleDeleteSubFlow = useCallback(() => {
    const { args: node } = contextMenuOptions;
    const callback = () => getMainInterface().deleteSubFlow(node.data.id);

    handleDelete({ nodeId: node.data.id, callback });
  }, [contextMenuOptions, handleDelete]);

  const handleDeleteLink = useCallback(() => {
    const { args: link } = contextMenuOptions;
    getMainInterface().deleteLink(link.id);
  }, [contextMenuOptions]);

  /**
   * Toggle exposed port
   */
  const handleToggleExposedPort = useCallback(() => {
    const { args: port } = contextMenuOptions;
    getMainInterface().toggleExposedPort(port);
  }, [contextMenuOptions]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.root}>
      <div id="flow-top-bar">
        <FlowTopBar
          id={id}
          call={call}
          alert={alert}
          confirmationAlert={confirmationAlert}
          scope={scope}
          warnings={warnings}
          defaultViewMode={viewMode}
          version={instance.current?.version}
          mainInterface={mainInterfaceRef}
          onRobotChange={onRobotChange}
          onStartStopFlow={onStartStopFlow}
          nodeStatusUpdated={onNodeStatusUpdate}
          onViewModeChange={onViewModeChange}
          onReady={onReady}
          // nodeCompleteStatusUpdated={this.onMonitoringNodeStatusUpdate}
        ></FlowTopBar>
      </div>
      <BaseFlow
        {...props}
        ref={baseFlowRef}
        dataFromDB={dataFromDB}
        warnings={warnings}
        warningsVisibility={warningsVisibility}
        onReady={onReady}
      />
      <FlowBottomBar
        openFlow={openDoc}
        onToggleWarnings={onToggleWarnings}
        robotSelected={robotSelected}
        runningFlow={runningFlow}
        warnings={warnings}
      />
      {contextMenuOptions && (
        <FlowContextMenu
          {...contextMenuOptions}
          onNodeDelete={handleDeleteNode}
          onLinkDelete={handleDeleteLink}
          onSubFlowDelete={handleDeleteSubFlow}
          onPortToggle={handleToggleExposedPort}
        />
      )}
      {tooltipConfig && <PortTooltip {...tooltipConfig} />}
    </div>
  );
};

Flow.defaultProps = {
  name: ""
};

export default withEditorPlugin(Flow);
