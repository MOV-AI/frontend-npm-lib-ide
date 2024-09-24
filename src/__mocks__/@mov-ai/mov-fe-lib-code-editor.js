import React from "react";

// create mock for Code Editor
export const MonacoEditor = props => {
  return <textarea {...props} />;
};

export const MonacoCodeEditor = props => {
  const { onChange, ...rest } = props;
  return (<textarea
    data-testid="code-editor-area"
    onChange={evt => onChange(evt.target.value)}
    {...rest}
  />);
};
