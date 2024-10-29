import React from "react";
import { useTheme } from "@mov-ai/mov-fe-lib-react";

const NotInstalled = (props) => {
  const { name } = props;
  const theme = useTheme();
  return (
    <h1 style={{ color: theme.palette.text.primary }}>
      {name} not installed :(
    </h1>
  );
};

export default NotInstalled;

export const getNotInstalledTabData = (id, name) => {
  const tabTitle = name || id;
  return {
    id: id,
    name: name,
    tabTitle: name,
    scope: id,
    extension: "",
    content: <NotInstalled name={tabTitle} />,
  };
};
