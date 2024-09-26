import React, { useState, useRef } from "react";
import { IconButton, InputAdornment, TextField } from "@material-ui/core";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { SCOPES, ALERT_SEVERITIES } from "../../../utils/Constants";
import { SelectScopeModal } from "@mov-ai/mov-fe-lib-react";
import { Document } from "@mov-ai/mov-fe-lib-core";
import CodeIcon from "@material-ui/icons/Code";

function formatValue(value) {
  return '$(config ' + value.split('/').pop() + ')';
}

const ConfigurationSelector = props => {
  // Props
  const {
    rowProps = {},
    alert = window.alert,
  } = props;
  // State Hooks
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(rowProps.rowData?.value);
  // Refs
  const inputTextRef = useRef();

  /**
   * On Configuration selected
   * @param {string} selectedConfiguration
   */
  const onSubmit = selectedConfiguration => {
    const formatted =  formatValue(selectedConfiguration);
    rowProps.onChange(formatted);
    setSelected(formatted);
    setOpenModal(false);
    // Set cursor position
    setImmediate(() => {
      if (!inputTextRef.current) return;
      const inputText = inputTextRef.current.querySelector("input");
      inputText.focus();
      const endPosition = inputText.value.length;
      inputText.setSelectionRange(endPosition, endPosition);
    });
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <TextField
      style={{ width: "100%" }}
      value={selected || ""}
      data-testid="selector-text-input"
      onChange={evt => rowProps.onChange(evt.target.value)}
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
              onSubmit={onSubmit}
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
