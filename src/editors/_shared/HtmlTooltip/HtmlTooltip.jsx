import Tooltip  from "@mui/material/Tooltip";
import { withStyles } from "@mui/styles";

export const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.accent?.background,
    borderColor: theme.palette.accent?.border,
    color: theme.palette.accent?.color,
    padding: theme.spacing(1),
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid"
  }
}))(Tooltip);
