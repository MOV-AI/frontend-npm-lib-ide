import React, { useEffect } from "react";
import PluginManagerIDE from "../../../engine/PluginManagerIDE/PluginManagerIDE";
import { Button, withNotification } from "@mov-ai/mov-fe-lib-react";
import { ALERT_SEVERITIES, PLUGINS } from "../../../utils/Constants";
import Alerts from "../../../plugins/Alerts/Alerts";
import Dialog from "../../../plugins/Dialog/Dialog";

const TestPluginManager = (props) => {
  useEffect(() => {
    const plugins = [
      {
        profile: { name: PLUGINS.DIALOG.NAME },
        factory: (profile) => new Dialog(profile),
      },
      {
        profile: { name: PLUGINS.ALERT.NAME },
        factory: (profile) => new Alerts(profile),
      },
    ];
    plugins.forEach((pluginDescription) => {
      const plugin = pluginDescription.factory(pluginDescription.profile);
      PluginManagerIDE.install(pluginDescription.profile.name, plugin);
    });
  }, []);

  const showAlert = () => {
    PluginManagerIDE.call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
      message: "Testing success message",
      severity: ALERT_SEVERITIES.SUCCESS,
    });
  };

  const showDialog = () => {
    const Component = () => <h2>Hello World</h2>;
    PluginManagerIDE.call(
      PLUGINS.DIALOG.NAME,
      PLUGINS.DIALOG.CALL.CUSTOM,
      {
        title: "Dialog Title",
        message: "My dialog long text description:",
        onSubmit: () => {
          alert("Hello world!");
        },
      },
      Component,
    );
  };

  return (
    <div
      style={{
        background: "#202020",
        color: "white",
        margin: "-1rem",
        height: "100vh",
      }}
    >
      <h1>Test Plugin Manager</h1>
      <Button color="primary" onClick={showAlert} style={{ margin: 15 }}>
        Alert
      </Button>
      <Button color="primary" onClick={showDialog} style={{ margin: 15 }}>
        Dialog
      </Button>
      <div id="alertPanel"></div>
    </div>
  );
};

export default {
  title: "Plugin Manager",
  component: TestPluginManager,
};

const Template = (args) => <TestPluginManager {...args} />;

export const Manager = withNotification(Template).bind({});
