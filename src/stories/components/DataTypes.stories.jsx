import React, { useState } from "react";
import { Table, snackbar, withNotification } from "@mov-ai/mov-fe-lib-react";
import MenuItem from "@mui/material/MenuItem";
import Select  from "@mui/material/Select";
import useDataTypes from "../../editors/_shared/hooks/useDataTypes";

const Component = props => {
  const [data, setData] = useState([]);
  const { getDataTypes, getLabel, getEditComponent, getValidValue, validate } =
    useDataTypes();

  const validateRow = async rowData => {
    const rowType = rowData.type || "default";
    const rowValue = await getValidValue(rowData.type, rowData.value);
    const validateData = { value: rowValue, type: rowType };
    return validate(validateData).then(paramValidation => {
      if (paramValidation.success)
        snackbar({ message: "Valid data", severity: "success" });
      else snackbar({ message: "Invalid data", severity: "error" });
      // Return row validation results
      return { result: paramValidation.success, value: rowValue };
    });
  };

  const onRowAdd = newData => {
    return new Promise((resolve, reject) => {
      try {
        validateRow(newData).then(validParams => {
          if (!validParams.result) return;

          // add key value
          setData(prevState => [...prevState, newData]);
          resolve();
        });
      } catch (err) {
        reject();
      }
    });
  };

  // TODO: To be implemented
  const onParametersRowUpdate = (newData, oldData) => {
    return new Promise((resolve, reject) => {
      try {
        // Validate port name
        validateRow(newData).then(validParams => {
          if (!validParams.result) return;

          // update key value
          resolve();
        });
      } catch (err) {
        reject();
      }
    });
  };

  const renderValueEditor = _props => {
    const editComponent = getEditComponent(_props.rowData.type);
    if (!editComponent) return <></>;
    // Pass alert method to edit component through props
    return editComponent({ ..._props, alert });
  };

  const columns = [
    { title: "Key", field: "name" },
    {
      title: "Type",
      field: "type",
      render: rowData => getLabel(rowData.type),
      editComponent: _props => (
        <Select
          value={_props.rowData.type || ""}
          onChange={async evt => {
            const _data = { ..._props.rowData };
            _data.type = evt.target.value;
            _data.value = await getValidValue(_data.type, "");
            _props.onRowDataChange(_data);
          }}
        >
          {getDataTypes([]).map(key => (
            <MenuItem key={key} value={key}>
              {getLabel(key)}
            </MenuItem>
          ))}
        </Select>
      )
    },
    {
      title: "Value",
      field: "value",
      editComponent: renderValueEditor
    }
  ];

  return (
    <Table
      title=""
      columns={columns}
      data={data}
      editable={{
        isEditable: () => true,
        onRowAdd: newData => onRowAdd(newData),
        onRowUpdate: onParametersRowUpdate
      }}
      options={{
        paging: false,
        actionsColumnIndex: -1,
        searchFieldAlignment: "left"
      }}
    />
  );
};

export default {
  title: "Data Types",
  component: Component
};

const Template = args => <Component {...args} />;

export const Types = withNotification(Template).bind({});
