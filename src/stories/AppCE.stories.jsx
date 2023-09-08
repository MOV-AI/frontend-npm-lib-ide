import React from "react";
import "@mov-ai/mov-fe-lib-react/dist/styles/Themes.js";
import AppCE from "./AppCE";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "App CE"
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = args => <AppCE {...args} />;

export const IDE = Template.bind({});
