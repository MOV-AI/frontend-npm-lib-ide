import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { FLOW_CONTEXT_MODES } from "../../../utils/Constants";
import { FLOW_VIEW_MODE } from "./Constants/constants";
import { insertIf } from "../../../utils/Utils";

export const baseContextOptions = data => {
  const callbackName = data?.data?.callback;
  const nodeOptions = ({
    handleCopyNode,
    handleDeleteNode,
    nodeDebug,
    viewMode = FLOW_VIEW_MODE.default
  }) => {
    if (viewMode === FLOW_VIEW_MODE.treeView) {
      return [
        {
          label: "Start",
          icon: <PlayCircleOutlineIcon />,
          disabled: nodeDebug.startNode.disabled,
          onClick: () => nodeDebug.startNode.func(data)
        },
        {
          label: "Stop",
          icon: <PauseCircleOutlineIcon />,
          disabled: nodeDebug.stopNode.disabled,
          onClick: () => nodeDebug.stopNode.func(data)
        }
      ];
    }

    return [
      {
        label: "Copy",
        icon: <FileCopyIcon />,
        onClick: () => handleCopyNode(data)
      },
      {
        label: "Delete",
        icon: <DeleteOutlineIcon />,
        onClick: () => handleDeleteNode(data)
      }
    ];
  };

  const subFlowOptions = nodeOptions;

  const linkOptions = ({
    handleDeleteLink,
    viewMode = FLOW_VIEW_MODE.default
  }) => [
    {
      label: "Delete",
      icon: <DeleteOutlineIcon />,
      onClick: () => handleDeleteLink(data)
    }
  ];

  const portOptions = ({
    handleToggleExposedPort,
    handleOpenCallback,
    viewMode = FLOW_VIEW_MODE.default
  }) => [
    {
      label: "ToggleExposed",
      icon: <ToggleOnIcon />,
      onClick: () => handleToggleExposedPort(data)
    },
    ...insertIf(callbackName, {
      label: "OpenCallbackName",
      labelVars: { callbackName: callbackName },
      icon: <OpenInNewIcon />,
      onClick: () => handleOpenCallback(callbackName)
    })
  ];

  const canvasOptions = ({
    handlePasteNodes,
    viewMode = FLOW_VIEW_MODE.default
  }) => {
    if (viewMode === FLOW_VIEW_MODE.treeView) {
      return null;
    }
    return [
      {
        label: "Paste",
        icon: <NoteAddIcon />,
        onClick: () => handlePasteNodes(data)
      }
    ];
  };

  return {
    [FLOW_CONTEXT_MODES.NODE]: nodeOptions,
    [FLOW_CONTEXT_MODES.LINK]: linkOptions,
    [FLOW_CONTEXT_MODES.SUBFLOW]: subFlowOptions,
    [FLOW_CONTEXT_MODES.PORT]: portOptions,
    [FLOW_CONTEXT_MODES.CANVAS]: canvasOptions
  };
};

export const getBaseContextOptions = (mode, data, args) =>
  baseContextOptions(data)[mode](args);
