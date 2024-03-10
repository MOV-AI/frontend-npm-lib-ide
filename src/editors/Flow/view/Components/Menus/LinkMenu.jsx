import React, { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  BaseCollapse,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  BaseSelect,
  Typography,
  Tooltip
} from "@mov-ai/mov-fe-lib-react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import {
  LINK_DEPENDENCY,
  MOVAI_FLOW_TYPES
} from "../../../../../utils/Constants";
import BasePort from "../Nodes/BaseNode/BasePort";

import { linkMenuStyles } from "./styles";

const LinkMenu = props => {
  // Props
  const { link, editable, sourceMessage, flowModel } = props;
  const linkData = link.data;

  // State Hooks
  const [dependencyLevel, setDependencyLevel] = useState(0);

  // Other Hooks
  const classes = linkMenuStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Use method from BasePort class to format port name
   * @param {string} name : Port Name
   * @returns {string} Formatted port name
   */
  const parsePortName = useCallback(name => {
    return BasePort.parsePortname(name);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle change event on dependency select box
   * @param {Event} evt : Change event
   */
  const onChangeDependency = useCallback(
    evt => {
      const value = evt.target.value;
      flowModel.current.setLinkDependency(link.data.id, value);
      setDependencyLevel(value);
      // Let's change the link color temporarily
      link.setTemporaryDependency(value).changeStrokeColor();
    },
    [flowModel, link]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // On component mount or change Link prop
  useEffect(() => {
    const dependency = flowModel.current.getLinkDependency(linkData.id);
    setDependencyLevel(dependency);
  }, [linkData, flowModel]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div data-testid="section_flow-link-menu">
      <h2>{i18n.t("Link")}</h2>
      <List className={classes.listHolder} component="nav">
        <ListItem>
          <ListItemText primary={i18n.t("From")} />
        </ListItem>
        <BaseCollapse in>
          <Divider />
          <Typography component="div" className={classes.directionContainer}>
            <ListItem>
              <ListItemText primary={i18n.t("Node-Colon")} />
              <Tooltip title={linkData.sourceNode}>
                <Typography>{linkData.sourceNode}</Typography>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={i18n.t("Port-Colon")} />
              <Tooltip title={parsePortName(linkData.sourcePort)}>
                <Typography>{parsePortName(linkData.sourcePort)}</Typography>
              </Tooltip>
            </ListItem>
          </Typography>
        </BaseCollapse>
        <Divider />
        <ListItem>
          <ListItemText primary={i18n.t("To")} />
        </ListItem>
        <BaseCollapse in>
          <Divider />
          <Typography component="div" className={classes.directionContainer}>
            <ListItem>
              <ListItemText primary={i18n.t("Node-Colon")} />
              <Tooltip title={linkData.targetNode}>
                <Typography>{linkData.targetNode}</Typography>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={i18n.t("Port-Colon")} />
              <Tooltip title={parsePortName(linkData.targetPort)}>
                <Typography>{parsePortName(linkData.targetPort)}</Typography>
              </Tooltip>
            </ListItem>
          </Typography>
        </BaseCollapse>
        {sourceMessage !== MOVAI_FLOW_TYPES.LINKS.TRANSITION && (
          <>
            <Divider />
            <ListItem>
              <ListItemText primary={i18n.t("LinkDependencies")} />
            </ListItem>
            <BaseCollapse in>
              <Typography
                component="div"
                className={classes.dependencyContainer}
              >
                <FormControl fullWidth={true}>
                  <InputLabel>{i18n.t("DependenciesLevel")}</InputLabel>
                  <BaseSelect
                    value={dependencyLevel}
                    onChange={onChangeDependency}
                    disabled={!editable}
                    className={classes.selectHolder}
                  >
                    {Object.values(LINK_DEPENDENCY).map(dep => {
                      return (
                        <MenuItem
                          key={dep.VALUE}
                          value={dep.VALUE}
                          className={classes.infoContainer}
                        >
                          <p>{i18n.t(dep.LABEL)}</p>
                          <div
                            className={classes.colorChip}
                            style={{ backgroundColor: dep.COLOR }}
                          ></div>
                        </MenuItem>
                      );
                    })}
                  </BaseSelect>
                  <FormHelperText>
                    {i18n.t("LinkDependenciesHelperText")}
                  </FormHelperText>
                </FormControl>
              </Typography>
            </BaseCollapse>
          </>
        )}
      </List>
    </div>
  );
};

LinkMenu.propTypes = {
  flowModel: PropTypes.object.isRequired,
  link: PropTypes.object.isRequired,
  editable: PropTypes.bool,
  sourceMessage: PropTypes.string
};

LinkMenu.defaultProps = {
  editable: true,
  sourceMessage: ""
};

export default LinkMenu;
