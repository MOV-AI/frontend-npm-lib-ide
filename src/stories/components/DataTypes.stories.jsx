import React, { useState } from "react";
import { Table, snackbar, withNotification } from "@mov-ai/mov-fe-lib-react";
import { MenuItem, BaseSelect } from "@mov-ai/mov-fe-lib-react";
import useDataTypes from "../../editors/_shared/hooks/useDataTypes";

const Component = (_props) => {
  const [data, setData] = useState([]);
  const { getDataTypes, getType } = useDataTypes();

  const validateRow = async (rowData) => {
    const rowType = rowData.type;
    return getType(rowType)
      .validate(rowData.value)
      .then((paramValidation) => {
        if (paramValidation.success)
          snackbar({ message: "Valid data", severity: "success" });
        else snackbar({ message: "Invalid data", severity: "error" });
        // Return row validation results
        return { result: paramValidation.success, value: rowValue };
      });
  };

  const onRowAdd = (newData) => {
    return new Promise((resolve, reject) => {
      try {
        validateRow(newData).then((validParams) => {
          if (!validParams.result) return;

          // add key value
          setData((prevState) => [...prevState, newData]);
          resolve();
        });
      } catch (err) {
        reject();
      }
    });
  };

  // TODO: To be implemented
  const onParametersRowUpdate = (newData, _oldData) => {
    return new Promise((resolve, reject) => {
      try {
        // Validate port name
        validateRow(newData).then((validParams) => {
          if (!validParams.result) return;

          // update key value
          resolve();
        });
      } catch (err) {
        reject();
      }
    });
  };

  const renderValueEditor = (_props) => {
    const editComponent = getType(_props.rowData.type).getEditComponent();
    if (!editComponent) return <></>;
    // Pass alert method to edit component through props
    return editComponent({ ..._props, alert });
  };

  const columns = [
    { title: "Key", field: "name" },
    {
      title: "Type",
      field: "type",
      render: (rowData) => getType(rowData.type).getLabel(),
      editComponent: (_props) => (
        <BaseSelect
          value={_props.rowData.type || ""}
          onChange={async (evt) => {
            const _data = { ..._props.rowData };
            _data.type = evt.target.value;
            _data.value = await getValidValue(_data.type, "");
            _props.onRowDataChange(_data);
          }}
        >
          {getDataTypes([]).map((key) => (
            <MenuItem key={key} value={key}>
              {getType(key).getLabel()}
            </MenuItem>
          ))}
        </BaseSelect>
      ),
    },
    {
      title: "Value",
      field: "value",
      editComponent: renderValueEditor,
    },
  ];

  return (
    <Table
      title=""
      columns={columns}
      data={data}
      editable={{
        isEditable: () => true,
        onRowAdd: (newData) => onRowAdd(newData),
        onRowUpdate: onParametersRowUpdate,
      }}
      options={{
        paging: false,
        actionsColumnIndex: -1,
        searchFieldAlignment: "left",
      }}
    />
  );
};

export default {
  title: "Data Types",
  component: Component,
};

const Template = (args) => <Component {...args} />;

export const Types = withNotification(Template).bind({});
