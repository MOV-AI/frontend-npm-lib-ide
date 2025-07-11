import React, { useCallback, useState, memo } from "react";
import PropTypes from "prop-types";
import { i18n, withTheme } from "@mov-ai/mov-fe-lib-react";
import _isEqual from "lodash/isEqual";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import ApplicationTheme from "../../../themes";
import { DialogTitle } from "../../../plugins/Dialog/components/AppDialog/AppDialog";

import { keyValueEditorDialogStyles } from "./styles";

const COMPONENTS = {
  NAME: "name",
  VALUE: "value",
};

const KeyValueEditorDialog = (props) => {
  // Props
  const {
    onClose,
    onSubmit,
    nameValidation,
    title,
    isNew,
    data,
    setData,
    disabled,
    renderCustomContent,
    renderValueEditor,
    validate = (_data) => Promise.resolve({ success: true, data: _data }),
    disableName = false,
    disableDescription = false,
    showDescription = true,
    showDefault = false,
  } = props;
  // State hook
  const [validation, setValidation] = useState({
    component: null,
    error: false,
    message: "",
  });
  // Other hooks
  const classes = keyValueEditorDialogStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Simple extract method to lower cognitive complex
   * @private function
   * @param {String} component : component to check against
   */
  const getValidationComponent = useCallback(
    (component) => {
      return validation.component === component;
    },
    [validation.component],
  );

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On change Name
   * @param {Event} evt : OnChange event
   */
  const onChangeName = useCallback(
    (evt) => {
      const name = evt?.target?.value;
      let isValid = Promise.resolve(true);
      if (nameValidation && validate) {
        isValid = nameValidation({ name }).then((res) => {
          setValidation({
            component: COMPONENTS.NAME,
            error: !res.result,
            message: i18n.t(res.error),
          });
          // Return validation
          return res.result;
        });
      }

      // Set data
      setData((prevState) => {
        return { ...prevState, name };
      });
      // Return validation result
      return isValid;
    },
    [nameValidation, validate],
  );

  /**
   * On change Description
   * @param {Event} evt : OnChange event
   */
  const onChangeDescription = useCallback((evt) => {
    const description = evt?.target?.value;
    setData((prevState) => {
      return { ...prevState, description };
    });
  }, []);

  /**
   * Submit form and close dialog
   */
  const onSave = useCallback(() => {
    // Validate name
    onChangeName({ target: { value: data.name } }).then((isValid) => {
      if (isValid) {
        // Validate data type
        validate(data).then((res) => {
          if (res.result ?? res.success) {
            onSubmit(res.data);
            onClose();
          } else {
            setValidation({ error: true, message: res.error });
          }
        });
      }
    });
  }, [data, onClose, onSubmit, validate, onChangeName]);

  //========================================================================================
  /*                                                                                      *
   *                                    Render Methods                                    *
   *                                                                                      */
  //========================================================================================
  return (
    <Dialog open={true} onClose={onClose} classes={{ paper: classes.paper }}>
      <div data-testid="section_key-value-editor-dialog">
        <DialogTitle onClose={onClose} hasCloseButton={true}>
          {title}
        </DialogTitle>
        <DialogContent>
          <Typography component="div" className={classes.container}>
            <TextField
              label={`${i18n.t("Name")} *`}
              error={
                getValidationComponent(COMPONENTS.NAME) && validation.error
              }
              helperText={
                getValidationComponent(COMPONENTS.NAME) && validation.message
              }
              value={data.name}
              autoFocus={isNew}
              disabled={disableName || disabled}
              className={classes.input}
              onChange={onChangeName}
              inputProps={{ "data-testid": "input_name" }}
            />
            {showDescription && (
              <FormControl className={classes.marginTop}>
                <TextField
                  label={i18n.t("Description")}
                  value={data.description}
                  className={classes.input}
                  multiline
                  minRows={3}
                  maxRows={10}
                  disabled={disableDescription || disabled}
                  onChange={onChangeDescription}
                  inputProps={{ "data-testid": "input_description" }}
                />
              </FormControl>
            )}
            {renderCustomContent?.()}
            <InputLabel className={classes.label}>{i18n.t("Value")}</InputLabel>
            <FormControl className={classes.marginTop}>
              {renderValueEditor(data.value, {
                isNew,
                error:
                  getValidationComponent(COMPONENTS.VALUE) && validation.error,
                helperText:
                  getValidationComponent(COMPONENTS.VALUE) &&
                  validation.message,
                disabled: disabled,
              })}
            </FormControl>
            {showDefault && (
              <Accordion className={classes.accordion} defaultExpanded>
                <AccordionSummary
                  className={classes.accordionSummary}
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography className={classes.label}>
                    {i18n.t("Default Value")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.noHorizontalPadding}>
                  {renderValueEditor(undefined, {
                    isNew,
                    isDefault: true,
                    disabled: true,
                  })}
                </AccordionDetails>
              </Accordion>
            )}
          </Typography>
        </DialogContent>
        <DialogActions data-testid="section_dialog-actions">
          <Button data-testid="input_close" onClick={onClose}>
            {i18n.t("Cancel")}
          </Button>
          <Button
            data-testid="input_confirm"
            color="primary"
            onClick={onSave}
            // Let's only disable the save button if we are doing a name validation (which is validated on change)
            disabled={
              (getValidationComponent(COMPONENTS.NAME) && validation.error) ||
              disabled
            }
          >
            {i18n.t("Save")}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

KeyValueEditorDialog.propTypes = {
  title: PropTypes.string.isRequired,
  isNew: PropTypes.bool,
  disabled: PropTypes.bool,
  disableName: PropTypes.bool,
  disableDescription: PropTypes.bool,
  showDefault: PropTypes.bool,
  showDescription: PropTypes.bool,
  onClose: PropTypes.func,
  validate: PropTypes.func,
  onSubmit: PropTypes.func,
  renderValueEditor: PropTypes.func,
  renderCustomContent: PropTypes.func,
  nameValidation: PropTypes.func,
  valueValidation: PropTypes.func,
  setData: PropTypes.func,
  data: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    value: PropTypes.string,
  }),
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps, nextProps);
}

export default memo(
  withTheme(KeyValueEditorDialog, ApplicationTheme),
  arePropsEqual,
);
