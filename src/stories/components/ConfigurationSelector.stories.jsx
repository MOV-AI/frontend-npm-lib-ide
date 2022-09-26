import { Button, snackbar, withNotification } from "@mov-ai/mov-fe-lib-react";
import React from "react";
import withMock from "storybook-addon-mock";
import ConfigurationSelector from "../../editors/_shared/ConfigurationSelector/ConfigurationSelector";
import ConfigurationType from "../../editors/_shared/hooks/DataTypes/types/ConfigurationType";
import useDataTypes from "../../editors/_shared/hooks/useDataTypes";
import { authParams } from "../_mockLogin";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Configuration Selector",
  component: ConfigurationSelector,
  decorators: [withMock],
  argTypes: {
    isConfigFromParameter: {
      description:
        "Wheather the selector is to be used by Parameters or others",
      control: {
        type: "boolean"
      }
    }
  }
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = args => {
  const { validate } = useDataTypes();
  const [value, setValue] = React.useState("");
  const [title, setTitle] = React.useState("");
  const { isConfigFromParameter } = args;

  const props = {
    onChange: _value => setValue(_value),
    rowData: {
      value,
      onChange: _value => setValue(_value)
    }
  };

  const validateData = () => {
    validate({ type: "config", value: props.rowData.value }, args)
      .then(result => {
        const message = result.success
          ? "Configuration valid"
          : "Configuration not found";
        const severity = result.success ? "success" : "error";
        snackbar({ message, severity });
      })
      .catch(err => {
        console.log("debug validation err", err);
        snackbar({ message: "Failed to validate", severity: "error" });
      });
  };

  const formatValue = isConfigFromParameter
    ? ConfigurationType.format2Parameter
    : undefined;

  React.useEffect(() => {
    const _title = isConfigFromParameter ? "Parameter" : "Default";
    setTitle(_title);
  }, [isConfigFromParameter]);

  return (
    <>
      <h2 style={{ textAlign: "left" }}>Selector for {title}</h2>
      <ConfigurationSelector
        {...args}
        rowProps={props}
        alert={alert}
        formatValue={formatValue}
      />
      <Button onClick={validateData} style={{ marginTop: 15 }}>
        Validate
      </Button>
    </>
  );
};

export const Selector = withNotification(Template).bind({});

Selector.parameters = authParams;
