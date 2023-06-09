import React, { useCallback, useEffect, useState, memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
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
  Button
} from "@material-ui/core";
import { withTheme } from "../../../decorators/withTheme";
import { DialogTitle } from "../../../plugins/Dialog/components/AppDialog/AppDialog";

import { keyValueEditorDialogStyles } from "./styles";

const KeyValueEditorDialog = props => {
  // Props
  const {
    open,
    onClose,
    handleSubmit,
    title,
    isNew,
    disabled,
    renderCustomContent,
    renderValueEditor,
    disableName = false,
    disableDescription = false,
    showDescription = true,
    showDefault = false,
    errors = {},
    name = "",
    value = "",
    description = "",
  } = props;
  // Other hooks
  const classes = keyValueEditorDialogStyles();
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} classes={{ paper: classes.paper }}>
      <form onSubmit={handleSubmit}  data-testid="section_key-value-editor-dialog">
        <DialogTitle onClose={onClose} hasCloseButton={true}>
          {title}
        </DialogTitle>
        <DialogContent>
          <Typography component="div" className={classes.container}>
            <TextField
              label={`${t("Name")} *`}
              helperText={errors.name ?? ""}
              name="name"
              defaultValue={name}
              autoFocus={isNew}
              disabled={disableName || disabled}
              className={classes.input}
              inputProps={{ "data-testid": "input_name" }}
            />
            {showDescription && (
              <FormControl className={classes.marginTop}>
                <TextField
                  label={t("Description")}
                  defaultValue={description}
                  name="description"
                  className={classes.input}
                  multiline
                  minRows={3}
                  maxRows={10}
                  disabled={disableDescription || disabled}
                  inputProps={{ "data-testid": "input_description" }}
                />
              </FormControl>
            )}
            {renderCustomContent && renderCustomContent()}
            <InputLabel className={classes.label}>{t("Value")}</InputLabel>
            <FormControl className={classes.marginTop}>
              {renderValueEditor(value, {
                isNew,
                name: "value",
                helperText: errors.value,
                disabled: disabled,
                defaultValue: value
              })}
            </FormControl>
            {showDefault && (
              <Accordion className={classes.accordion} defaultExpanded>
                <AccordionSummary
                  className={classes.accordionSummary}
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography className={classes.label}>
                    {t("Default Value")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.noHorizontalPadding}>
                  {renderValueEditor(value, {
                    isNew,
                    isDefault: true,
                    disabled: true
                  })}
                </AccordionDetails>
              </Accordion>
            )}
          </Typography>
        </DialogContent>
        <DialogActions data-testid="section_dialog-actions">
          <Button data-testid="input_close" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit" data-testid="input_confirm" color="primary" disabled={errors.name?.length}>
            {t("Save")}
          </Button>
        </DialogActions>
      </form>
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
  defaultValue: PropTypes.string,
  onClose: PropTypes.func,
  onValidation: PropTypes.func,
  handleSubmit: PropTypes.func,
  renderValueEditor: PropTypes.func,
  renderCustomContent: PropTypes.func,
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps, nextProps);
}

export default memo(withTheme(KeyValueEditorDialog), arePropsEqual);
