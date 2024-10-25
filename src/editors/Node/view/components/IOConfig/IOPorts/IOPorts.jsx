import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Divider from "@material-ui/core/Divider";
import Callback from "./components/Callback";
import Parameters from "./components/Parameters";

import { IOPortStyles } from "../styles";

const IOPorts = (props) => {
  // Props
  const {
    editable,
    handleOpenCallback,
    protectedCallbacks,
    handleNewCallback,
    handleOpenSelectScopeModal,
  } = props;
  // Hooks
  const classes = IOPortStyles();

  /**
   * Get port icons
   * @param {*} direction
   * @returns
   */
  const getPortIcon = (direction) => {
    const iconClass = {
      portIn: "icon-in",
      portOut: "icon-out",
    };

    return <i className={`${classes.portBase} ${iconClass[direction]}`}></i>;
  };

  /**
   * Render Input/Output Port
   * @param {string} direction : One of options: "portIn" or "portOut"
   * @returns {ReactElement} Input/Output Port
   */
  const renderIoPort = (direction) => {
    return (
      <div>
        {props.rowData[direction] !== undefined &&
          Object.keys(props.rowData[direction]).map((ioPort, ioPortIndex) => {
            const portData = props.rowData[direction][ioPort];
            const callback = portData?.callback;
            const message = portData?.message;
            const parameters = portData?.parameters || {};
            const disableAccordion =
              Object.keys(parameters).length === 0 && !callback;
            return (
              <Accordion
                defaultExpanded
                className={classes.ioPortTitle}
                key={`${ioPortIndex} ${direction}`}
                expanded={disableAccordion ? true : undefined}
              >
                <AccordionSummary
                  expandIcon={disableAccordion ? undefined : <ExpandMoreIcon />}
                >
                  <div className={classes.heading}>
                    {/* Icon */}
                    <div className={classes.row}>
                      {getPortIcon(direction)}
                      {/* Ioport Name */}
                      <div className={classes.paddingLR}>
                        <b>{ioPort}</b>
                      </div>
                      {/* Effective Message */}
                      <div className={classes.paddingLR}>{`(${message})`}</div>
                    </div>
                  </div>
                </AccordionSummary>
                <Divider />
                <AccordionDetails className={classes.details}>
                  {/* ------------------------- Callback ------------------------- */}
                  {callback !== null && (
                    <div data-testid="section_callback">
                      <Callback
                        id={callback}
                        ioPort={ioPort}
                        editable={editable}
                        message={message}
                        direction={direction}
                        portName={props.rowData.name}
                        protectedCallbacks={protectedCallbacks}
                        handleNewCallback={handleNewCallback}
                        handleOpenCallback={handleOpenCallback}
                        handleOpenSelectScopeModal={handleOpenSelectScopeModal}
                      />
                    </div>
                  )}
                  {/* ------------------------- Parameters ------------------------- */}
                  <div data-testid="section_parameters">
                    {Object.keys(parameters).map((param, paramIndex) => {
                      return (
                        <div data-testid={`section_parameter-${param}`}>
                          <Parameters
                            {...props}
                            key={paramIndex + direction}
                            editable={editable}
                            param={param}
                            paramValue={parameters[param]}
                            direction={direction}
                            ioPort={ioPort}
                          />
                        </div>
                      );
                    })}
                  </div>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </div>
    );
  };

  return (
    <div
      data-testid="section_io-ports"
      className={`${classes.root} ${props.classNames}`}
    >
      {renderIoPort("portIn")}
      {renderIoPort("portOut")}
    </div>
  );
};

export default IOPorts;
