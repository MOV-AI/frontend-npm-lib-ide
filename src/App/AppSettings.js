import { KEYBINDINGS } from "../utils/shortcuts";
import Logo from "../Branding/movai-flow-logo-red.png";
import packageJson from "./../../package.json";

const APPLICATION_DATA = window.SERVER_DATA?.Application;
const BRANDING = { NAME: "MOV.AI Flow™" };

const AppSettings = {
  NAME: BRANDING.NAME,
  LOGO: Logo,
  SHORTCUTS: KEYBINDINGS,
  HELP: {
    DOCUMENTATION: "https://flow.mov.ai/",
  },
  APP_PROPS: {
    SHOW_APP_SELECTION: false,
    SHOW_TOGGLE_THEME: true,
  },
  APP_INFORMATION: {
    VERSION: packageJson.version,
    LAST_UPDATE: APPLICATION_DATA?.LastUpdate || "-",
    CONFIGURATION_FILE: APPLICATION_DATA?.Configuration || "-",
    CUSTOM_CONFIGURATION_FILE: APPLICATION_DATA?.CustomConfiguration || "-",
    DESCRIPTION: APPLICATION_DATA?.Description || "-",
    LABEL: APPLICATION_DATA?.Label || BRANDING.NAME,
  },
};

//========================================================================================
/*                                                                                      *
 *                                        Setters                                       *
 *                                                                                      */
//========================================================================================

export const setLogo = (logo) => {
  AppSettings.LOGO = logo;
};

export const setLinks = ({ documentation }) => {
  AppSettings.HELP.DOCUMENTATION = documentation;
};

export const setName = (name) => {
  AppSettings.NAME = name;
  AppSettings.APP_INFORMATION.LABEL = name;
};

export const setShortcuts = (shortcuts, keepBase) => {
  const baseShortcuts = keepBase ? KEYBINDINGS : {};
  AppSettings.SHORTCUTS = { ...baseShortcuts, ...shortcuts };
};

export const setAppProps = (props) => {
  AppSettings.APP_PROPS = props;
};

export default AppSettings;
