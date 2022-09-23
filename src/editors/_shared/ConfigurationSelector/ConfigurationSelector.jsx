import React, { useState, useRef } from "react";
import { IconButton, InputAdornment, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SCOPES, ALERT_SEVERITIES } from "../../../utils/Constants";
import { SelectScopeModal } from "@mov-ai/mov-fe-lib-react";
import { Document } from "@mov-ai/mov-fe-lib-core";
import CodeIcon from "@material-ui/icons/Code";

const ConfigurationSelector = props => {
  // Props
  const { rowProps, alert } = props;
  // State Hooks
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);
  // Refs
  const inputTextRef = useRef();
  // Translation Hook
  const { t } = useTranslation();

  const rowData = rowProps?.rowData;

  const formatConfigurationValue = configuration => {
    const document = Document.parsePath(configuration, SCOPES.CONFIGURATION);
    // Temporary validation if document is from archive
    // TO BE REMOVED AFTER STANDARDIZATION OF PARSING PROCESS
    if (document.workspace !== "global") {
      alert({
        message: t("OnlyGlobalConfiguration"),
        severity: ALERT_SEVERITIES.WARNING
      });
    }
    // Return formatted config name
    return document.name;
  };

  return (
    <TextField
      style={{ width: "100%" }}
      value={rowData?.value || ""}
      data-testid="selector-text-input"
      onChange={evt => rowProps?.onChange(evt.target.value)}
      InputProps={{
        ref: inputTextRef,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              data-testid="open-selector-btn"
              aria-label="Select configuration"
              onClick={() => setOpenModal(true)}
              disabled={props.rowProps.disabled}
              onMouseDown={evt => evt.preventDefault()}
            >
              <CodeIcon></CodeIcon>
            </IconButton>
            <SelectScopeModal
              open={openModal}
              onCancel={() => setOpenModal(false)}
              onSubmit={selectedConfiguration => {
                const formatted = formatConfigurationValue(
                  selectedConfiguration
                );
                rowProps.onChange(formatted);
                setSelected(selectedConfiguration);
                setOpenModal(false);
                // Set cursor position
                setImmediate(() => {
                  if (!inputTextRef.current) return;
                  const inputText = inputTextRef.current.querySelector("input");
                  inputText.focus();
                  const endPosition = inputText.value.length;
                  inputText.setSelectionRange(endPosition, endPosition);
                });
              }}
              scopeList={[SCOPES.CONFIGURATION]}
              selected={selected}
              allowArchive={false}
            ></SelectScopeModal>
          </InputAdornment>
        )
      }}
    />
  );
};

export default ConfigurationSelector;
