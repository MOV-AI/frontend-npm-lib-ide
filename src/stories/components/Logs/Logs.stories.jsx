import React, { useEffect } from "react";
import { installTool } from "../../../App/BaseApp";
import AppCE from "../../AppCE";
import { getLogsToolTab, LOGS_PROFILE } from "./Logs";
import { LogsIcon } from "@mov-ai/mov-fe-lib-react";

const LogsStory = props => {
  useEffect(() => {
    // Logs
    installTool({
      id: LOGS_PROFILE.name,
      profile: LOGS_PROFILE,
      Plugin: LOGS_PROFILE.plugin,
      tabData: getLogsToolTab(),
      icon: LogsIcon,
      mainMenu: true,
      toolBar: true,
      quickAccess: true
    });
  }, []);

  return <AppCE {...props} />;
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Logs",
  component: LogsStory
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = args => <LogsStory {...args} />;

export const Logs = Template.bind({});
