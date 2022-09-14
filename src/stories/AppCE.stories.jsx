import React from "react";
import withMock from "storybook-addon-mock";
import { authParams } from "./_mockLogin";
import AppCE from "./AppCE";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "App CE",
  component: AppCE,
  decorators: [withMock]
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = args => <AppCE {...args} />;

export const IDE = Template.bind({});

IDE.parameters = authParams;
