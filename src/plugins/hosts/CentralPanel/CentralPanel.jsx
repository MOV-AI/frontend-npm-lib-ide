import PropTypes from "prop-types";
import React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

function CentralPanel(props) {
  const { viewPlugins, hostName } = props;
  return <div id={hostName}>{viewPlugins}</div>;
}

export default withHostReactPlugin(CentralPanel);

CentralPanel.propTypes = {
  hostName: PropTypes.string.isRequired
};

CentralPanel.defaultProps = {
  hostName: "topBar"
};
