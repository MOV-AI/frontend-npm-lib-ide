import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Add from "@material-ui/icons/Add";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import Model from "../../../model/Flow";
import useDataSubscriber from "../../../../../plugins/DocManager/useDataSubscriber";

import { ERROR_MESSAGES } from "../../../../../utils/Messages";
import { dialog } from "../../../../../plugins/Dialog/Dialog";
import {
  DEFAULT_KEY_VALUE_DATA,
  DATA_TYPES,
  TABLE_KEYS_NAMES,
  DIALOG_TITLE
} from "../../../../../utils/Constants";
import ParametersEditorDialog from "../../../../_shared/KeyValueTable/ParametersEditorDialog";
import DetailsMenu from "../../../../_shared/DetailsMenu/DetailsMenu";
import TableKeyValue from "./sub-components/TableKeyValue";
import menuStyles from "./styles";

const ACTIVE_ITEM = {
  description: 1,
  parameters: 2
};

const Menu = ({ name, model, details: detailsProp, editable }) => {
  // State hook
  const [activeItem, setActiveItem] = useState(0);
  const { data } = useDataSubscriber({
    instance: model,
    propsData: detailsProp,
    keysToDisconsider: Model.KEYS_TO_DISCONSIDER
  });
  // Other hooks
  const classes = menuStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @param {*} value
   * @param {*} type
   * @param {*} is2ParseString
   * @returns
   */
  const renderValue = useCallback((value, type, is2StringifyString) => {
    const renderValueByType = {
      string: () => (is2StringifyString ? JSON.stringify(value) : value),
      boolean: () => value.toString()
    };
    return type in renderValueByType ? renderValueByType[type]() : value;
  }, []);

  /**
   * @private Get parameters to render in menu
   */
  const getParameters = useCallback(() => {
    const output = [];
    const parameters = data?.parameters || {};
    Object.keys(parameters).forEach(param => {
      const value = data.parameters?.[param]?.value || "";
      const type = data.parameters?.[param]?.type || DATA_TYPES.ANY;
      output.push({
        key: param,
        value: renderValue(value, type, true)
      });
    });
    return output;
  }, [data?.parameters, renderValue]);

  /**
   * @summary: Validate document name against invalid characters. It accept ROS valid names
   * and can't accept two consecutive underscores.
   * @param {String} oldName : Old Name
   * @param {Object} newData : New data
   * @returns {Promise} {result: <boolean>, [error: <string> OR data: <object>]}
   **/
  const validateParamName = useCallback(
    (oldName, newData) => {
      const { name: newName } = newData;

      try {
        if (!newName) throw new Error(ERROR_MESSAGES.NAME_IS_MANDATORY);
        else if (!Utils.validateEntityName(newName, []))
          throw new Error(ERROR_MESSAGES.INVALID_NAME);

        // Validate against repeated names
        if (oldName !== newName && model.current.getParameter(newName)) {
          throw new Error(ERROR_MESSAGES.MULTIPLE_ENTRIES_WITH_SAME_NAME);
        }
      } catch (error) {
        return Promise.resolve({ result: false, error: error.message });
      }

      return Promise.resolve({ result: true, data: { oldName, newData } });
    },
    [model]
  );

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * @param {Object} data : Data to Save
   */
  const handleSubmitParameter = useCallback(
    (oldName, newData) => {
      if (oldName === "") {
        model.current.addParameter(newData.name, newData);
      } else {
        model.current.updateKeyValueItem(
          TABLE_KEYS_NAMES.PARAMETERS,
          newData,
          oldName
        );
      }
    },
    [model]
  );

  /**
   * Open dialog to edit/add new Parameter
   * @param {string} dataId : Unique identifier of item (undefined when not created yet)
   */
  const handleParameterDialog = useCallback(dataId => {
    const obj = model.current.getParameter(dataId) || DEFAULT_KEY_VALUE_DATA;

    return dialog({
      onSubmit: formData => handleSubmitParameter(obj.name, formData),
      nameValidation: newData => validateParamName(obj.name, newData),
      title: t("EditParamType", { paramType: t(DIALOG_TITLE.PARAMETERS) }),
      data: obj,
      Dialog: ParametersEditorDialog
    });
  }, [model, validateParamName, handleSubmitParameter, t]);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Handle expand/collapse action
   *  If item is collapsed : Expand item and collapse other
   *  If item is expanded  : Collapse item and let all others collapsed as well
   * @param {Event} evt
   */
  const handleExpandClick = useCallback(evt => {
    const newActiveItem = parseInt(evt.currentTarget.dataset.menuId);

    setActiveItem(prevState => {
      return prevState === newActiveItem ? 0 : newActiveItem;
    });
  }, []);

  /**
   * Open dialog to edit flow description
   */
  const handleEditDescriptionClick = useCallback(() => dialog({
    title: t("EditDescription"),
    form: {
      value: {
        label: "Description",
        multiline: true,
        defaultValue: model.current.getDescription(),
      },
    },
    onSubmit: ({ value }) => model.current.setDescription(value),
  }), [model, t]);

  /**
   * Handle Add new Parameter
   */
  const handleAddParameterClick = useCallback(() => {
    handleParameterDialog();
  }, [handleParameterDialog]);

  /**
   * Handle Edit Parameter
   * @param {string} key : parameter id to edit
   */
  const handleParamEdit = useCallback(
    ({ key }) => {
      handleParameterDialog(key);
    },
    [handleParameterDialog]
  );

  /**
   * Handle Delete Parameter
   * @param {string} key : parameter id to delete
   * @param {string} value : parameter value, to construct the confirm phrase
   */
  const handleParamDelete = useCallback(({ key, value }) => dialog({
    submitText: t("Delete"),
    title: t("ConfirmDeleteParam", { paramName: key }),
    onSubmit: () => model.current.deleteParameter(key),
    message: t("ParameterDeleteConfirmationMessage", {
      paramName: key,
      value
    })
  }), [model, t]);

  /**
   * Handle Description Edit
   * @param {*} e
   */
  const handleDescriptionClick = e => {
    e.stopPropagation();
    handleEditDescriptionClick();
  };

  /**
   * Handle Add Parameter
   * @param {*} e
   */
  const handleAddParameter = e => {
    e.stopPropagation();
    handleAddParameterClick();
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Description
   * @returns {ReactElement} Description to render in collapsible content
   */
  const renderDescription = useCallback(() => {
    return data.description ? (
      <Typography className={`${classes.itemValue} ${classes.description}`}>
        {data.description}
      </Typography>
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        N/A
      </Typography>
    );
  }, [classes, data.description]);

  /**
   * Render parameters
   * @returns {ReactElement} Parameters to render in collapsible content
   */
  const renderParameters = useCallback(() => {
    const params = getParameters();
    return params.length ? (
      <Typography component="div" className={classes.parametersContainer}>
        <TableKeyValue
          list={params}
          allowDelete={editable}
          allowEdit={editable}
          handleParameterDeleteModal={handleParamDelete}
          handleParameterEditModal={handleParamEdit}
          type="params"
          allowSearch
        />
      </Typography>
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        {t("NoParameters")}
      </Typography>
    );
  }, [classes, editable, getParameters, handleParamDelete, handleParamEdit, t]);

  return (
    <Typography data-testid="section_flow-details-menu" component="div">
      <DetailsMenu name={name} details={data.details || {}}></DetailsMenu>
      <List>
        {/* ============ DESCRIPTION ============ */}
        <ListItem
          data-testid="input_description-expand"
          button
          data-menu-id={ACTIVE_ITEM.description}
          onClick={handleExpandClick}
        >
          <ListItemText primary={t("Description")} />
          <IconButton
            data-testid="input_description-edit"
            disabled={!editable}
            onClick={handleDescriptionClick}
          >
            <EditIcon />
          </IconButton>
          {activeItem === ACTIVE_ITEM.description ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.description} unmountOnExit>
          {renderDescription()}
          <Divider />
        </Collapse>
        {/* ============ PARAMETERS ============ */}
        <ListItem
          data-testid="input_parameters-expand"
          button
          data-menu-id={ACTIVE_ITEM.parameters}
          onClick={handleExpandClick}
        >
          <ListItemText primary={t("Parameters")} />
          <IconButton
            data-testid="input_parameters-add"
            disabled={!editable}
            onClick={handleAddParameter}
          >
            <Add />
          </IconButton>
          {activeItem === ACTIVE_ITEM.parameters ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )}
        </ListItem>
        <Collapse
          data-testid="section_parameters-table"
          in={activeItem === ACTIVE_ITEM.parameters}
          unmountOnExit
        >
          {renderParameters()}
          <Divider />
        </Collapse>
      </List>
    </Typography>
  );
};

Menu.propTypes = {
  name: PropTypes.string.isRequired,
  model: PropTypes.object.isRequired,
  details: PropTypes.object.isRequired,
  editable: PropTypes.bool
};

export default Menu;
