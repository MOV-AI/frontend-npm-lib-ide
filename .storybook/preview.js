import { withTheme } from "@mov-ai/mov-fe-lib-react";
import ApplicationTheme from "../src/themes";
 
export const decorators = [
  (Story) => {
    const ThemedStory = withTheme(Story, ApplicationTheme);
    return <ThemedStory />;
  },
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
