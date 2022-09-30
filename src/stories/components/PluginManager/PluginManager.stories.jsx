import React, { useEffect } from "react";
import PluginManagerIDE from "../../../engine/PluginManagerIDE/PluginManagerIDE";
import { Button, withNotification } from "@mov-ai/mov-fe-lib-react";
import { ALERT_SEVERITIES, PLUGINS } from "../../../utils/Constants";
import Alerts from "../../../plugins/Alerts/Alerts";

const TestPluginManager = props => {
  useEffect(() => {
    const plugin = new Alerts({ name: PLUGINS.ALERT.NAME });
    PluginManagerIDE.install(PLUGINS.ALERT.NAME, plugin);
  }, []);

  const showAlert = () => {
    PluginManagerIDE.call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
      message: "Testing success message",
      severity: ALERT_SEVERITIES.SUCCESS
    });
  };

  return (
    <>
      <h1>Test Plugin Manager</h1>
      <Button color="primary" onClick={showAlert}>
        Alert
      </Button>
    </>
  );
};

export default {
  title: "Plugin Manager",
  component: TestPluginManager
};

const Template = args => <TestPluginManager {...args} />;

export const Manager = withNotification(Template).bind({});
