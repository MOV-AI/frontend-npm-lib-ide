import { amber, green } from "@mov-ai/mov-fe-lib-react";
import { makeStyles } from "@mov-ai/mov-fe-lib-react";

const commonStyles = {
  display: "flex",
  justifyContent: "space-between"
};

const headerStyles = {
  ...commonStyles,
  marginBottom: "40px"
};

const linesHolderStyles = {
  maxHeight: "35vh",
  overflowY: "auto",
  paddingLeft: "10px",
  paddingRight: "10px"
};

const lineStyles = {
  ...commonStyles,
  paddingTop: "10px",
  paddingBottom: "10px",
  borderTop: "1px dashed #ccc",
  borderBottom: "1px dashed #ccc",
  marginBottom: "10px",
  "& ~ div": {
    paddingTop: "0px",
    borderTop: "0 none"
  },
  "& > div": {
    overflow: "hidden",
    maxWidth: "230px",
    textOverflow: "ellipsis",
    "& > p": {
      margin: "0px"
    }
  },
  "& > div:last-of-type": {
    textAlign: "right"
  }
};

export const warningsStyles = makeStyles(theme => ({
  root: {
    position: "absolute",
    top: "20px",
    right: "50px",
  },
  snackbar: {
    margin: "5px",
    minWidth: "200px"
  },
  success: {
    "&.MuiPaper-root": {
      backgroundColor: green[600] + " !important",
    },
  },
  error: {
    "&.MuiPaper-root": {
      backgroundColor: theme.palette?.error.dark + " !important",
    },
  },
  info: {
    "&.MuiPaper-root": {
      backgroundColor: theme.palette?.primary.main + " !important",
    },
  },
  warning: {
    "&.MuiPaper-root": {
      backgroundColor: amber[700] + " !important",
    },
  },
  clickableSnack: {
    border: "2px solid #666",
    cursor: "pointer",
    transition: "border-color .5s",
    color: theme.palette?.text.primary + " !important",
    "&:hover": {
      borderColor: "#000"
    }
  },
  icon: {
    fontSize: "20px"
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: "10px"
  },
  message: {
    display: "flex",
    whiteSpace: "pre",
    alignItems: "center"
  }
}));

export const invalidLinksWarningStyles = makeStyles(_theme => ({
  invalidLinksHeader: {
    ...headerStyles
  },
  invalidLinksMessageHolder: {
    ...linesHolderStyles
  },
  invalidLinkHolder: {
    ...lineStyles
  },
  fixMessage: {
    marginTop: "40px"
  }
}));

export const invalidParametersWarningStyles = makeStyles(_theme => ({
  invalidParametersHeader: {
    ...headerStyles
  },
  invalidParametersMessageHolder: {
    ...linesHolderStyles
  },
  postMessage: {
    marginTop: "40px"
  }
}));

export const invalidExposedPortsWarningStyles = makeStyles(_theme => ({
  root: {
    "& p": {
      whiteSpace: "pre-wrap"
    }
  },
  invalidExposedPortsHeader: {
    ...headerStyles
  },
  invalidExposedPortsMessageHolder: {
    ...linesHolderStyles
  },
  postMessage: {
    marginTop: "40px"
  }
}));

export const parameterLineStyles = makeStyles(_theme => ({
  invalidParameterHolder: {
    ...lineStyles
  },
  paramsList: {
    marginTop: "0px"
  },
  linkButton: {
    textTransform: "none",
    fontSize: "16px"
  }
}));
