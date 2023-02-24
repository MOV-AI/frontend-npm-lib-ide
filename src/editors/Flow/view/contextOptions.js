import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { FLOW_CONTEXT_MODES } from "../../../utils/Constants";
import { insertIf } from "../../../utils/Utils";

export const baseContextOptions = data => {
  const callbackName = data.data.callback;
  const nodeOptions = ({ handleCopyNode, handleDeleteNode }) => [
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

  const subFlowOptions = nodeOptions;

  const linkOptions = ({ handleDeleteLink }) => [
    {
      label: "Delete",
      icon: <DeleteOutlineIcon />,
      onClick: () => handleDeleteLink(data)
    }
  ];

  const portOptions = ({ handleToggleExposedPort, handleOpenCallback }) => [
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

  const canvasOptions = ({ handlePasteNodes }) => [
    {
      label: "Paste",
      icon: <NoteAddIcon />,
      onClick: () => handlePasteNodes(data)
    }
  ];

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
