import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {
  defaultFunction,
  convertToValidString
} from "../../../../../../utils/Utils";

const ContextMenu = props => {
  const { anchorPosition, menuList, onClose, readOnly } = props;

  /**
   * Caputure context menu click event and dispatch it for the rightful element
   * @param {Event} event : contextmenu event
   */
  const onContextMenu = useCallback(event => {
    const { clientX, clientY } = event;
    // Get all elements from clicked point
    const allElementsFromPoint = document.elementsFromPoint(clientX, clientY);
    // Create new contextmenu event based on the original mouse clicked position
    const ev = new MouseEvent("contextmenu", {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX,
      clientY
    });
    // first element is the same event.target
    // second element is the pop-up menu overlay
    // third element is the next in line that should receive the event
    allElementsFromPoint[2]?.dispatchEvent(ev);
  }, []);

  return (
    <Menu
      onContextMenu={onContextMenu}
      data-testid="section_context-menu"
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={Boolean(anchorPosition)}
      onClose={onClose}
      disabled={readOnly}
    >
      {menuList.map(item => (
        <MenuItem
          data-testid="input_context-option"
          key={`key_${convertToValidString(item.label)}`}
          onClick={!item.disabled ? item.onClick : undefined}
          disabled={readOnly || item.disabled}
        >
          {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
          <ListItemText>{item.label || item.element}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
};

ContextMenu.propTypes = {
  anchorPosition: PropTypes.object,
  menuList: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.element,
      element: PropTypes.element,
      label: PropTypes.string,
      onClick: PropTypes.func
    })
  ),
  onClose: PropTypes.func,
  readOnly: PropTypes.bool
};
ContextMenu.defaultProps = {
  menuList: [],
  readOnly: false,
  onClose: () => defaultFunction("onClose")
};

export default ContextMenu;
