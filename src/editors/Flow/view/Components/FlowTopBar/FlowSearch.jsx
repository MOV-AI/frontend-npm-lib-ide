import React, { useCallback } from "react";
import SearchIcon from "@material-ui/icons/Search";
import PropTypes from "prop-types";
import {
  TextField,
  InputAdornment,
  IconButton,
  Popper,
} from "@material-ui/core";
import { KEYBINDINGS } from "../../../../../utils/shortcuts";
import { Autocomplete } from "@material-ui/lab";
import { flowTopBarStyles } from "./styles";
import { i18n } from "@mov-ai/mov-fe-lib-react";

const FlowSearch = (props) => {
  const { options, onChange, onEnabled, onDisabled, visible } = props;
  const classes = flowTopBarStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Helpers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Format option label
   * @param {object} option : Node Data
   * @returns {string} Option label
   */
  const getOptionLabel = (option) => {
    const template = option.Template || option.ContainerFlow;
    return `${option.name} [${template}]`;
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const handleSearchNode = useCallback(
    (_e, node) => {
      return onChange(node);
    },
    [onChange],
  );

  const handleSearchToggle = useCallback(() => {
    const searchWillBeVisible = !visible;
    if (searchWillBeVisible) {
      return onEnabled();
    }
    onDisabled();
  }, [visible, onEnabled, onDisabled]);

  //========================================================================================
  /*                                                                                      *
   *                                       Renderers                                      *
   *                                                                                      */
  //========================================================================================

  const renderSearchPopup = useCallback(
    (_popperProps) => (
      <Popper
        {..._popperProps}
        className={classes.searchPopup}
        placement="bottom-start"
      />
    ),
    [classes.searchPopup],
  );

  const renderSearchInput = useCallback(
    (params) => {
      return (
        <TextField
          {...params}
          variant="standard"
          placeholder={i18n.t("SearchNode")}
          className={classes.searchInputText}
          autoFocus
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
          inputProps={{
            ...params.inputProps,
            "data-scope": KEYBINDINGS.MISC.KEYBINDS.SEARCH_INPUT_CLOSE.SCOPE,
          }}
        />
      );
    },
    [classes.searchInputText],
  );

  if (!visible) {
    return (
      <IconButton
        data-testid="input_search-icon"
        onClick={handleSearchToggle}
        size="small"
        variant="contained"
      >
        <SearchIcon color="action" />
      </IconButton>
    );
  }

  return (
    <Autocomplete
      data-testid="input_search-flow-text"
      options={options.sort((a, b) => a.parent.localeCompare(b.parent))}
      getOptionLabel={getOptionLabel}
      onChange={handleSearchNode}
      onBlur={handleSearchToggle}
      onFocus={onEnabled}
      groupBy={(option) => option.parent}
      PopperComponent={renderSearchPopup}
      renderInput={renderSearchInput}
    />
  );
};

FlowSearch.propTypes = {
  visible: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  onEnabled: PropTypes.func,
  onDisabled: PropTypes.func,
};

export default FlowSearch;
