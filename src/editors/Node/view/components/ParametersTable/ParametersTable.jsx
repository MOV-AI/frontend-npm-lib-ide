import React, { memo } from "react";
import PropTypes from "prop-types";
import _isEqual from "lodash/isEqual";
import { i18n, useDataTypes } from "@mov-ai/mov-fe-lib-react";
import { defaultFunction } from "../../../../../utils/Utils";
import ParameterEditorDialog from "../../../../_shared/KeyValueTable/ParametersEditorDialog";
import KeyValueTable from "../../../../_shared/KeyValueTable/KeyValueTable";

const ParametersTable = (props) => {
  // Props
  const { editable, data, openEditDialog, onRowDelete, defaultColumns } = props;
  // Hooks
  const { getType } = useDataTypes({ stringOutput: true });
  // Override default columns
  const typeColumn = {
    title: i18n.t("Type"),
    field: "type",
    width: 150,
    tableData: {
      columnOrder: 1.5, // Workaround to add this column after 1, but before 2
    },
    cellStyle: {
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
    render: (rowData) => (
      <span data-testid="output_type">{getType(rowData.type).getLabel()}</span>
    ),
  };
  const columns = [...defaultColumns];
  columns.push(typeColumn);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <KeyValueTable
      testId="section_parameters"
      title={i18n.t("Parameters")}
      varName="parameters"
      editable={editable}
      data={data}
      columns={columns}
      onRowDelete={onRowDelete}
      openEditDialog={(varName, dataId) =>
        openEditDialog(varName, dataId, ParameterEditorDialog)
      }
    ></KeyValueTable>
  );
};

ParametersTable.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  defaultColumns: PropTypes.array,
  onRowDelete: PropTypes.func,
  openEditDialog: PropTypes.func,
  editable: PropTypes.bool,
};

ParametersTable.defaultProps = {
  data: [],
  defaultColumns: [],
  onRowDelete: () => defaultFunction("onRowDelete"),
  openEditDialog: () => defaultFunction("openEditDialog"),
  editable: false,
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps.data, nextProps.data);
}

export default memo(ParametersTable, arePropsEqual);
