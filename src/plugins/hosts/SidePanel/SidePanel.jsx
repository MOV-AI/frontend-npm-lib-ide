import React from "react";
import PropTypes from "prop-types";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

// not able to send props
const SidePanel = props => {
  const { viewPlugins, hostName, style } = props;
  return (
    <div id={hostName} style={{ ...style }}>
      {viewPlugins}
    </div>
  );
};

export default withHostReactPlugin(SidePanel);

SidePanel.propTypes = {
  hostName: PropTypes.string.isRequired
};
