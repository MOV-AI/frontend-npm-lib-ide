import React from "react";
import PropTypes from "prop-types";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Popper from "@mui/material/Popper";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import MenuItem from "./MenuItem";

import { systemMenuStyles } from "../styles";

const SystemMenu = ({ data, menuOpen, anchorEl, closeMenu }) => {
  const classes = systemMenuStyles();

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <Popper
      className={classes.popper}
      open={menuOpen}
      anchorEl={anchorEl}
      placement={"bottom-start"}
    >
          <ClickAwayListener onClickAway={closeMenu}>
            <Paper className={classes.listHolder}>
              <List component="nav" className={classes.list}>
                {data &&
                  data.map((item, index) => {
                    if (item.id)
                      return (
                        <MenuItem
                          key={item.id}
                          item={item}
                          closeMenu={closeMenu}
                        />
                      );
                    else
                      return (
                        <Divider key={index} className={classes.menuDivider} />
                      );
                  })}
              </List>
            </Paper>
          </ClickAwayListener>
    </Popper>
  );
};

export default SystemMenu;

SystemMenu.propTypes = {
  data: PropTypes.array.isRequired,
  anchorEl: PropTypes.object.isRequired,
  menuOpened: PropTypes.bool
};
