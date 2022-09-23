import React from "react";
import withMock from "storybook-addon-mock";
import ConfigurationSelector from "../../editors/_shared/ConfigurationSelector/ConfigurationSelector";
import { authParams } from "../_mockLogin";

const props = {
  onChange: value => (props.rowData.value = value),
  rowData: {
    value: "navigation"
  }
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Configuration Selector",
  component: ConfigurationSelector,
  decorators: [withMock]
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = args => (
  <ConfigurationSelector {...args} rowProps={props} alert={alert} />
);

export const Selector = Template.bind({});

Selector.parameters = authParams;
