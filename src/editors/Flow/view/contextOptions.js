import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
import { FLOW_CONTEXT_MODES } from "../../../utils/Constants";

export const baseContextOptions = data => {
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

  const portOptions = ({ handleToggleExposedPort }) => [
    {
      label: "ToggleExposed",
      icon: <ToggleOnIcon />,
      onClick: () => handleToggleExposedPort(data)
    }
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
