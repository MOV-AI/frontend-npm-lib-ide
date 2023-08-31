import { registerThemes } from "@tty-pt/styles";

const commonColors = {
  black: "#000000",
  white: "#ffffff"
};

const overrides = {
  MuiAppBar: {
    positionStatic: {
      zIndex: 10
    }
  }
};

registerThemes(themes => {
  const overrideThemes = {
    // Override dark theme
    dark: {
      background: commonColors.black,
      topBarColor: themes.dark.palette.background.default,
      dockLayout: {
        background: commonColors.white
      },
      backdrop: {
        color: themes.dark.textColor,
        background: themes.dark.palette.background.secondary
      },
      saveBar: { backgroundColor: themes.dark.palette.background.secondary },
      nodeEditor: { backgroundColor: "#292929", stripeColor: "#3b3b3b" },
      robotDetails: {
        interfaceColor: themes.dark.palette.background.primary,
        backgroundColor: "#292929",
        stripeColor: "#3b3b3b"
      },
      codeEditor: { theme: "vs-dark" },
      flowEditor: {
        interfaceColor: themes.dark.palette.background.primary
      },
      diffTool: {
        background: "#505050",
        removedBackground: "#632F34",
        addedBackground: "#044B53",
        color: "#24292e",
        jsonEditor: {
          background: "#363946",
          color: themes.dark.textColor,
          readOnly: "#acacac"
        }
      },
      layoutEditor: {
        background: themes.dark.palette.background.secondary,
        gridItemDev: "#ffdeb7",
        gridItemPreview: commonColors.white,
        itemBoxColor: "#969696",
        itemBoxColorHover: commonColors.white
      }
    },
    // Override light theme
    light: {
      dockLayout: {
        background: commonColors.black
      },
      background: themes.light.palette.background.primary,
      topBarColor: themes.light.palette.background.secondary,
      backdrop: {
        color: themes.light.textColor,
        background: themes.light.palette.background.secondary
      },
      saveBar: { backgroundColor: themes.light.palette.background.secondary },
      nodeEditor: {
        backgroundColor: "whitesmoke",
        stripeColor: "#cfcfcf"
      },
      robotDetails: {
        interfaceColor: "#afafaf",
        backgroundColor: "whitesmoke",
        stripeColor: "#cfcfcf"
      },
      flowEditor: {
        interfaceColor: "#afafaf"
      },
      layoutEditor: {
        background: themes.light.palette.background.primary,
        gridItemDev: "lightgrey",
        gridItemPreview: commonColors.white,
        itemBoxColor: "#3e3e3e",
        itemBoxColorHover: commonColors.black
      },
      diffTool: {
        background: themes.light.palette.background.secondary,
        removedBackground: "#ffdce0",
        addedBackground: "#cdffd8",
        color: "#24292e",
        jsonDiff: { color: "#4a6b08" },
        jsonEditor: {
          background: "lightslategray",
          color: themes.light.textColor,
          readOnly: "#d8d6d6"
        }
      },
      codeEditor: { theme: "light" }
    }
  };

  // add common component overrides for all themes
  Object.keys(overrideThemes).forEach(theme => {
    overrideThemes[theme].overrides = {
      ...(overrideThemes[theme].overrides ?? {}),
      ...overrides
    };
  });

  return overrideThemes;
});
